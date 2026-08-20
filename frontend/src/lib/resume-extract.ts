export const RESUME_ACCEPT = ".pdf,.doc,.docx,.txt,.md,.rtf";

const MAX_BYTES = 8 * 1024 * 1024;

function ext(name: string) {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

async function extractPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (
    await import("pdfjs-dist/build/pdf.worker.mjs?url")
  ).default;

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }
  await doc.cleanup();
  return pages.join("\n\n");
}

async function extractDocx(file: File) {
  const mammoth = (await import(
    /* @vite-ignore */ "mammoth/mammoth.browser.js"
  )) as unknown as {
    extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    default?: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };
  };
  const api = mammoth.default ?? mammoth;
  const result = await api.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

/** Extracts plain text from a resume file in the browser. */
export async function extractResumeText(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("File must be smaller than 8 MB.");
  const e = ext(file.name);

  let text = "";
  if (e === ".pdf") text = await extractPdf(file);
  else if (e === ".docx") text = await extractDocx(file);
  else if (e === ".txt" || e === ".md" || e === ".rtf") text = await file.text();
  else if (e === ".doc")
    throw new Error("Legacy .doc isn't supported — save it as .docx or PDF and retry.");
  else throw new Error("Upload a PDF, DOCX, TXT, MD or RTF file.");

  text = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 40)
    throw new Error("Couldn't read text from that file — it may be a scanned image.");
  return text.slice(0, 20000);
}
