import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RESUME_ACCEPT, extractResumeText } from "@/lib/resume-extract";

type Props = {
  onExtracted: (text: string, file: File) => void;
  label?: string;
  variant?: "glass" | "outline" | "secondary" | "ghost";
};

export function ResumeUploadButton({
  onExtracted,
  label = "Upload PDF / Word",
  variant = "glass",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const text = await extractResumeText(file);
      onExtracted(text, file);
      toast.success(`Imported ${file.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that file");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button
        type="button"
        variant={variant}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {busy ? "Reading…" : label}
      </Button>
    </>
  );
}
