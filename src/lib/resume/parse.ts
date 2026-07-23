// Turn an uploaded résumé file into scorable text.
//
// Supports PDF (the overwhelming majority of résumés), DOCX, and plain text. If we cannot extract
// real text — most often a SCANNED image PDF with no text layer — we say so honestly and never
// fabricate a score from nothing. Same discipline as the scorer: no guessing.
//
// The PDF/DOCX parsers are imported LAZILY (dynamic import inside the relevant branch), never at
// module load. pdf-parse pulls in pdfjs, which is heavy and finicky to bundle in serverless
// functions; loading it only when a PDF is actually uploaded keeps a plain-text upload from ever
// touching it, and (with serverExternalPackages in next.config) keeps it out of the bundle entirely.

export type ParseResult = { ok: true; text: string } | { ok: false; reason: string };

const UNREADABLE =
  "We couldn't read any text from this file. If it's a scanned image, please upload a text-based PDF or DOCX, or paste the résumé text.";

export async function parseResume(
  buffer: Buffer,
  filename: string,
  mimetype: string,
): Promise<ParseResult> {
  const name = filename.toLowerCase();
  try {
    let text = "";

    if (mimetype === "application/pdf" || name.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const r = await parser.getText();
        text = r.text;
      } finally {
        await parser.destroy();
      }
    } else if (
      name.endsWith(".docx") ||
      mimetype.includes("officedocument.wordprocessingml")
    ) {
      const { extractRawText } = await import("mammoth");
      const r = await extractRawText({ buffer });
      text = r.value;
    } else if (mimetype.startsWith("text/") || name.endsWith(".txt")) {
      text = buffer.toString("utf8");
    } else {
      return { ok: false, reason: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." };
    }

    text = clean(text);

    // A real résumé has plenty of text. If almost nothing came out, the file was unreadable
    // (e.g. a scan) — report it honestly rather than scoring an empty string.
    if (text.replace(/\s/g, "").length < 40) {
      return { ok: false, reason: UNREADABLE };
    }

    return { ok: true, text };
  } catch {
    return {
      ok: false,
      reason: "We couldn't read this file. Please try a different PDF/DOCX, or paste the résumé text.",
    };
  }
}

function clean(t: string): string {
  return t
    .replace(/^\s*--\s*\d+\s*of\s*\d+\s*--\s*$/gim, "") // pdf-parse page markers
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
