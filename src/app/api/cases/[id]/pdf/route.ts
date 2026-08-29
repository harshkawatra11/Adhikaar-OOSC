import { NextResponse } from "next/server";
import { getCase } from "@/lib/store";
import { generateRtiPdf } from "@/lib/pdf/generate";

// TODO(WP2): replaced by requireSession() once Firebase Auth lands.
const TEMP_OWNER_UID = "seed-owner";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = await getCase(id, TEMP_OWNER_UID);
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  if (!caseRecord.questions.length || !caseRecord.selectedAuthorityId) {
    return NextResponse.json(
      { error: "Select an authority and add at least one question before exporting." },
      { status: 400 }
    );
  }

  const bytes = await generateRtiPdf(caseRecord);

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rti-application-${caseRecord.id.slice(0, 8)}.pdf"`,
    },
  });
}
