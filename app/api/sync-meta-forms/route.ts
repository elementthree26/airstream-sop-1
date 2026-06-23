import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";

// Called by Google Apps Script onEdit trigger.
// Expects: { secret: string, meta_forms: MetaForm[] }
export async function POST(req: NextRequest) {
  const secret = process.env.SHEETS_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Sync not configured" }, { status: 500 });
  }

  let body: { secret?: string; meta_forms?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Array.isArray(body.meta_forms)) {
    return NextResponse.json({ error: "meta_forms must be an array" }, { status: 400 });
  }

  const filePath = "data/meta_forms.json";
  const { sha } = await getFile(filePath);

  const now = new Date().toISOString().split("T")[0];
  const newContent = JSON.stringify({
    last_synced_from_sheet: now,
    sheet_id: "1nf5tysHopK_8wTnfPa7p4tGu9oBThXNAFgTJa41kbEA",
    sheet_tab_gid: "478148551",
    meta_forms: body.meta_forms,
  }, null, 2);

  await putFile(filePath, newContent, sha, `Sync meta forms from Google Sheet (${now})`);

  return NextResponse.json({ ok: true, synced: body.meta_forms.length, date: now });
}
