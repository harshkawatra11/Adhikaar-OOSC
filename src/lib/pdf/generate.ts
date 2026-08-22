// Server-side PDF generation for the RTI application itself. This is the
// artifact an operator actually posts to a public authority, so it is
// built to read like a properly prepared manual filing: applicant block,
// correctly addressed CPIO block, the section 6(1) invocation, numbered
// questions, a fee declaration, and a signature line. No AI-styled
// flourishes, no colour, because a government office does not want them
// and neither does a serious document.

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { CaseRecord } from "@/lib/types";
import { AUTHORITIES } from "@/lib/data/authorities";

const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const BODY_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateRtiPdf(caseRecord: CaseRecord): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const newPageIfNeeded = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawLine = (text: string, opts: { size?: number; f?: PDFFont; gap?: number; indent?: number } = {}) => {
    const size = opts.size ?? 11;
    const f = opts.f ?? font;
    const indent = opts.indent ?? 0;
    const lines = wrapText(text, f, size, BODY_WIDTH - indent);
    for (const line of lines) {
      newPageIfNeeded(size + 4);
      page.drawText(line, { x: MARGIN + indent, y, size, font: f, color: rgb(0.08, 0.06, 0.03) });
      y -= size + 4;
    }
    y -= opts.gap ?? 0;
  };

  const authority = AUTHORITIES.find((a) => a.id === caseRecord.selectedAuthorityId);

  drawLine("APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005", { size: 14, f: bold, gap: 4 });
  drawLine("Filed under section 6(1)", { size: 10, gap: 14 });

  drawLine("To,", { gap: 2 });
  drawLine(authority?.cpioAddress ?? "The Public Information Officer, [authority not selected]", {
    size: 11,
    gap: 14,
  });

  drawLine(`Date: ${caseRecord.filedDate ?? new Date().toISOString().slice(0, 10)}`, { gap: 2 });
  drawLine(`Application fee: ${feeLine(caseRecord)}`, { gap: 14 });

  drawLine("Subject: Request for information under section 6(1) of the Right to Information Act, 2005", {
    f: bold,
    gap: 10,
  });

  drawLine("Sir or Madam,", { gap: 8 });
  drawLine(
    `I, the undersigned, request the following information under the Right to Information Act, 2005. In terms of section 6(2) of the Act, I am not required to state, and have not stated, any reason for this request beyond what is necessary to identify the records sought.`,
    { gap: 10 }
  );

  drawLine("Particulars of information required:", { f: bold, gap: 6 });
  caseRecord.questions.forEach((q, idx) => {
    drawLine(`${idx + 1}. ${q.text}`, { indent: 10, gap: 6 });
  });

  y -= 6;
  drawLine(
    "I request that this information be provided within the time limit prescribed under section 7(1) of the Act.",
    { gap: 14 }
  );

  drawLine("Applicant details", { f: bold, gap: 4 });
  drawLine(`Name: ${caseRecord.applicant.name}`, { gap: 2 });
  drawLine(`Address: ${caseRecord.applicant.address}`, { gap: 2 });
  if (caseRecord.applicant.isBpl) {
    drawLine(
      "This applicant holds a valid Below Poverty Line certificate, a copy of which is enclosed, and is exempt from the application fee under the proviso to section 7(5) of the Act.",
      { gap: 6 }
    );
  }

  y -= 20;
  drawLine("Yours faithfully,", { gap: 40 });
  drawLine(caseRecord.applicant.name, { f: bold });

  newPageIfNeeded(120);
  y -= 20;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.6, 0.55, 0.4),
  });
  y -= 16;
  drawLine(
    "This application was prepared with the assistance of Adhikaar, a jurisdiction-aware drafting workbench. It is an assistive drafting tool, not a source of legal advice, and every question above was reviewed and approved by a human operator before this document was generated.",
    { size: 9, gap: 4 }
  );
  drawLine(
    `Prepared for case reference ${caseRecord.id.slice(0, 8)}.`,
    { size: 9 }
  );

  return doc.save();
}

function feeLine(caseRecord: CaseRecord): string {
  if (!caseRecord.fee) return "Not yet computed";
  if (caseRecord.fee.waived) return `Waived (${caseRecord.fee.waiverReason ?? "fee exemption applies"})`;
  return `Rs. ${caseRecord.fee.amount} (${caseRecord.fee.paymentModes.join(", ")})`;
}
