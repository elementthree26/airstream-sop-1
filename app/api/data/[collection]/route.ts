import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getFile, putFile } from "@/lib/github";

const COLLECTION_TO_FILE: Record<string, string> = {
  workflows: "data/workflows.json",
  forms: "data/forms.json",
  lead_scoring: "data/lead_scoring.json",
  naming_conventions: "data/naming_conventions.json",
  new_form_checklist_template: "data/new_form_checklist_template.json",
  new_model_checklist_template: "data/new_model_checklist_template.json",
  checklist_instances: "data/checklist_instances.json",
  hygiene_checklist: "data/hygiene_checklist.json",
  meta_forms: "data/meta_forms.json",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { collection: string } }
) {
  const filePath = COLLECTION_TO_FILE[params.collection];
  if (!filePath) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { content } = await getFile(filePath);
    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { collection: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isCollaborator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = COLLECTION_TO_FILE[params.collection];
  if (!filePath) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { sha } = await getFile(filePath);
    const newContent = JSON.stringify(body, null, 2);
    await putFile(
      filePath,
      newContent,
      sha,
      `Update ${params.collection} via SOP app by ${session.user.login}`
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
