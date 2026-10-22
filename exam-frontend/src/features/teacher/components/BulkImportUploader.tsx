import { useRef, useState } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { Button, Card, Textarea } from '@/components/ui';

const SAMPLE_CSV = `subject,topic,difficulty,year,language,prompt,optionA,optionB,optionC,optionD,optionE,correct,explanation
Mathematics,Algebra,easy,2023,en,"If x + 2 = 5, what is x?",1,2,3,4,,C,"Subtract 2 from both sides: x = 3."
English,Grammar,medium,2022,en,"Choose the correct sentence.","He go to school.","He goes to school.","He going to school.","He gone to school.",,B,"Third-person singular takes 'goes'."`;

export interface BulkImportUploaderProps {
  onCsvReady: (csv: string) => void;
  loading?: boolean;
}

export function BulkImportUploader({ onCsvReady, loading }: BulkImportUploaderProps) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const content = await file.text();
    setText(content);
    onCsvReady(content);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examprep-sample-questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">CSV format</p>
            <p className="text-xs text-fg-muted">
              14 columns: subject, topic, difficulty, year, language, prompt, optionA–E, correct, explanation.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={downloadSample}
          >
            Download sample
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold">Upload file</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChange}
          className="block w-full cursor-pointer rounded-lg border border-dashed border-border bg-bg-surface/40 px-3 py-6 text-sm text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:text-white"
        />
        <p className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
          <FileText className="h-3 w-3" /> UTF-8 CSV · max 5,000 rows
        </p>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold">…or paste CSV</p>
        <Textarea
          rows={10}
          placeholder={SAMPLE_CSV}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono text-xs"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => onCsvReady(text)}
            disabled={!text.trim()}
            loading={loading}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Validate
          </Button>
        </div>
      </Card>
    </div>
  );
}
