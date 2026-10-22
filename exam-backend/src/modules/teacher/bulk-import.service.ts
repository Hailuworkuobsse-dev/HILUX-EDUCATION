import { randomUUID } from 'node:crypto';
import type { Subject, Topic } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { parseCsv } from './csv.js';
import type {
  BulkImportResultDTO,
  BulkImportRowDTO,
  BulkImportValidationResultDTO,
  Difficulty,
  ParsedImportRow
} from './types.js';

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
const VALID_DIFFICULTIES = new Set<Difficulty>(['easy', 'medium', 'hard']);
const VALID_LANGUAGES = new Set(['en', 'am', 'om', 'ti']);
const MAX_ROWS = 5000;

// =============================================================================
// Header spec
// =============================================================================

const EXPECTED_HEADERS = [
  'subject',
  'topic',
  'difficulty',
  'year',
  'language',
  'prompt',
  'optiona',
  'optionb',
  'optionc',
  'optiond',
  'optione',
  'correct',
  'explanation'
];

interface Lookup {
  subjectByName: Map<string, Subject>;
  subjectBySlug: Map<string, Subject>;
  topicBySubjectAndName: Map<string, Topic>;
}

async function loadLookup(): Promise<Lookup> {
  const subjects = await prisma.subject.findMany({ include: { topics: true } });
  const subjectByName = new Map<string, Subject>();
  const subjectBySlug = new Map<string, Subject>();
  const topicBySubjectAndName = new Map<string, Topic>();

  for (const s of subjects) {
    subjectByName.set(s.name.toLowerCase(), s);
    subjectBySlug.set(s.slug.toLowerCase(), s);
    for (const t of s.topics) {
      topicBySubjectAndName.set(`${s.id}:${t.name.toLowerCase()}`, t);
    }
  }

  return { subjectByName, subjectBySlug, topicBySubjectAndName };
}

// =============================================================================
// Row validation
// =============================================================================

function validateRow(
  cells: string[],
  rowNumber: number,
  lookup: Lookup
): ParsedImportRow {
  const get = (i: number) => (cells[i] ?? '').trim();
  const errors: string[] = [];

  const subjectCell = get(0);
  const topicCell = get(1);
  const difficultyCell = get(2).toLowerCase();
  const yearCell = get(3);
  const languageCell = get(4).toLowerCase();
  const prompt = get(5);
  const optionCells = [get(6), get(7), get(8), get(9), get(10)];
  const correctCell = get(11).toUpperCase();
  const explanationCell = get(12);

  // Subject
  let subject: Subject | undefined;
  if (!subjectCell) {
    errors.push('Missing subject');
  } else {
    subject =
      lookup.subjectByName.get(subjectCell.toLowerCase()) ??
      lookup.subjectBySlug.get(subjectCell.toLowerCase());
    if (!subject) errors.push(`Unknown subject: ${subjectCell}`);
  }

  // Topic
  let topic: Topic | undefined;
  if (!topicCell) {
    errors.push('Missing topic');
  } else if (subject) {
    topic = lookup.topicBySubjectAndName.get(`${subject.id}:${topicCell.toLowerCase()}`);
    if (!topic) errors.push(`Unknown topic for this subject: ${topicCell}`);
  }

  // Difficulty
  let difficulty: Difficulty | null = null;
  if (!difficultyCell) errors.push('Missing difficulty');
  else if (!VALID_DIFFICULTIES.has(difficultyCell as Difficulty)) {
    errors.push(`Invalid difficulty (must be easy, medium, hard): ${difficultyCell}`);
  } else difficulty = difficultyCell as Difficulty;

  // Year (optional)
  let year: number | null = null;
  if (yearCell) {
    const n = Number(yearCell);
    if (!Number.isInteger(n) || n < 2000 || n > 2100) {
      errors.push(`Invalid year (2000–2100): ${yearCell}`);
    } else year = n;
  }

  // Language
  let language: string | null = null;
  if (!languageCell) errors.push('Missing language');
  else if (!VALID_LANGUAGES.has(languageCell)) {
    errors.push(`Invalid language (must be one of en, am, om, ti): ${languageCell}`);
  } else language = languageCell;

  // Prompt
  if (!prompt) errors.push('Missing prompt');
  else if (prompt.length < 10) errors.push('Prompt must be at least 10 characters');

  // Options: A, B, C are required; D & E optional but must be filled contiguously.
  const filled = optionCells.map((o) => o.length > 0);
  if (!filled[0]) errors.push('Option A is required');
  if (!filled[1]) errors.push('Option B is required');
  if (!filled[2]) errors.push('Option C is required');
  if (!filled[3] && filled[4]) errors.push('Option D is empty but option E is filled');

  const optionCount = filled.filter(Boolean).length;
  if (optionCount < 2) errors.push('At least 2 options are required');

  // Correct answer must reference a filled option
  let correctIndex = -1;
  if (!correctCell) errors.push('Missing correct answer');
  else {
    const idx = LABELS.indexOf(correctCell as (typeof LABELS)[number]);
    if (idx < 0) errors.push(`Invalid correct answer (must be A, B, C, D, or E): ${correctCell}`);
    else if (!filled[idx]) errors.push(`Correct answer ${correctCell} refers to an empty option`);
    else correctIndex = idx;
  }

  const trimmedOptions = optionCells
    .slice(0, Math.max(optionCount, 3))
    .filter((o) => o.length > 0);

  return {
    rowNumber,
    subjectId: subject?.id ?? null,
    subjectName: subject?.name ?? null,
    topicId: topic?.id ?? null,
    difficulty,
    year,
    language,
    prompt,
    options: trimmedOptions,
    correctIndex,
    explanation: explanationCell || null,
    errors
  };
}

// =============================================================================
// Parse + validate
// =============================================================================

function parseAndValidate(csv: string, lookup: Lookup): {
  parsed: ParsedImportRow[];
  dtos: BulkImportRowDTO[];
} {
  const rows = parseCsv(csv);
  if (rows.length === 0) throw ApiError.badRequest('CSV is empty');

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const headerMismatch =
    headers.length < EXPECTED_HEADERS.length ||
    EXPECTED_HEADERS.some((expected, i) => headers[i] !== expected);

  if (headerMismatch) {
    throw ApiError.badRequest(
      `Invalid CSV headers. Expected: ${EXPECTED_HEADERS.join(', ')}`
    );
  }

  const dataRows = rows.slice(1);
  if (dataRows.length === 0) {
    return { parsed: [], dtos: [] };
  }
  if (dataRows.length > MAX_ROWS) {
    throw ApiError.badRequest(`Too many rows (max ${MAX_ROWS})`);
  }

  const parsed: ParsedImportRow[] = [];
  const dtos: BulkImportRowDTO[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 2; // header is row 1
    const p = validateRow(row, rowNumber, lookup);
    parsed.push(p);
    dtos.push({
      rowNumber,
      status: p.errors.length === 0 ? 'valid' : 'invalid',
      subjectName: p.subjectName,
      prompt: p.prompt || null,
      errors: p.errors
    });
  }

  return { parsed, dtos };
}

// =============================================================================
// Public API
// =============================================================================

export async function validateImport(
  csv: string
): Promise<BulkImportValidationResultDTO> {
  const lookup = await loadLookup();
  const { dtos } = parseAndValidate(csv, lookup);

  const valid = dtos.filter((r) => r.status === 'valid').length;
  const invalid = dtos.filter((r) => r.status === 'invalid').length;

  return {
    rows: dtos,
    summary: { total: dtos.length, valid, invalid }
  };
}

export async function commitImport(
  teacherId: string,
  csv: string
): Promise<BulkImportResultDTO> {
  const lookup = await loadLookup();
  const { parsed } = parseAndValidate(csv, lookup);

  const valid = parsed.filter((r) => r.errors.length === 0);
  const total = parsed.length;

  let imported = 0;

  for (const row of valid) {
    // Re-check required foreign keys (subjects / topics may have changed
    // between validate and commit — a rare but possible race).
    if (!row.subjectId || !row.topicId || !row.difficulty || !row.language) continue;
    if (row.correctIndex < 0) continue;

    const ids = row.options.map(() => randomUUID());
    const correctOptionId = ids[row.correctIndex];
    if (!correctOptionId) continue;

    try {
      await prisma.question.create({
        data: {
          subjectId: row.subjectId,
          topicId: row.topicId,
          difficulty: row.difficulty,
          year: row.year,
          language: row.language,
          prompt: row.prompt,
          explanation: row.explanation,
          correctOptionId,
          status: 'draft',
          createdById: teacherId,
          version: 1,
          options: {
            create: row.options.map((text, i) => ({
              id: ids[i],
              label: LABELS[i],
              text,
              orderIndex: i
            }))
          }
        }
      });
      imported++;
    } catch {
      // Skip any row whose DB insert fails (e.g., FK race). The rest proceeds.
    }
  }

  return {
    imported,
    skipped: total - imported,
    total
  };
}
