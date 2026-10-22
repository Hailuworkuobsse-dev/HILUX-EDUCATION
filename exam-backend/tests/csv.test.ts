import { describe, it, expect } from 'vitest';
import { parseCsv, csvEscape } from '../src/modules/teacher/csv.js';

const HEADER =
  'subject,topic,difficulty,year,language,prompt,optionA,optionB,optionC,optionD,optionE,correct,explanation';

describe('parseCsv (RFC-4180)', () => {
  it('parses a simple row', () => {
    expect(parseCsv('a,b,c')).toEqual([['a', 'b', 'c']]);
  });

  it('keeps commas inside quoted fields', () => {
    expect(parseCsv('a,"b, c",d')[0]).toEqual(['a', 'b, c', 'd']);
  });

  it('unescapes doubled quotes', () => {
    expect(parseCsv('a,"he said ""hi""",c')[0][1]).toBe('he said "hi"');
  });

  it('handles CRLF and LF identically', () => {
    expect(parseCsv('a,b\r\nc,d')).toEqual(parseCsv('a,b\nc,d'));
    expect(parseCsv('a,b\r\nc,d')).toHaveLength(2);
  });

  it('keeps newlines inside quoted fields', () => {
    expect(parseCsv('a,"line1\nline2",c')).toHaveLength(1);
    expect(parseCsv('a,"line1\nline2",c')[0][1]).toBe('line1\nline2');
  });

  it('strips a UTF-8 BOM', () => {
    expect(parseCsv('\uFEFFa,b')[0][0]).toBe('a');
  });

  it('preserves empty trailing fields positionally', () => {
    const row = parseCsv(`${HEADER}\nMath,Algebra,easy,2023,en,"A long enough prompt",1,2,3,4,,C,why`)[1];
    expect(row).toHaveLength(13);
    expect(row[10]).toBe(''); // optionE intentionally blank
    expect(row[11]).toBe('C');
  });
});

describe('csvEscape', () => {
  it('quotes only when needed', () => {
    expect(csvEscape('plain')).toBe('plain');
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape('line\nbreak')).toBe('"line\nbreak"');
  });

  it('round-trips through parseCsv', () => {
    const values = ['plain', 'a,b', 'say "hi"', 'line\nbreak', ''];
    const line = values.map(csvEscape).join(',');
    expect(parseCsv(line)[0]).toEqual(values);
  });
});
