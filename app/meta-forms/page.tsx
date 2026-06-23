"use client";
import { useCollection } from "@/hooks/useCollection";
import { PageHeader } from "@/components/PageHeader";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

type MetaForm = {
  id: string;
  product: string;
  form_name: string;
  category: "Travel Trailer" | "Touring Coach" | string;
  ipm: string;
  added_lead_label: boolean;
  added_lead_score: boolean;
  added_plinko: boolean;
  added_dealer_distro: boolean;
  added_aimbase: boolean;
  date_added: string;
  prop_wf_link: string;
  dealer_routing_link: string;
};

type MetaFormsData = {
  last_synced_from_sheet: string;
  sheet_id: string;
  sheet_tab_gid: string;
  meta_forms: MetaForm[];
};

const CHECKS: { key: keyof MetaForm; label: string }[] = [
  { key: "added_lead_label",    label: "Lead Label WF" },
  { key: "added_lead_score",    label: "Lead Score WF" },
  { key: "added_plinko",        label: "Plinko WF" },
  { key: "added_dealer_distro", label: "Dealer Distro WF" },
  { key: "added_aimbase",       label: "Aimbase WF" },
];

function Check({ val }: { val: boolean }) {
  return val
    ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
    : <XCircle size={15} className="text-red-400 shrink-0" />;
}

export default function MetaFormsPage() {
  const { data, loading } = useCollection<MetaFormsData>("meta_forms");

  const ttForms = data?.meta_forms.filter(f => f.category === "Travel Trailer") ?? [];
  const tcForms = data?.meta_forms.filter(f => f.category === "Touring Coach") ?? [];
  const allComplete = (form: MetaForm) => CHECKS.every(c => form[c.key]);
  const incomplete = data?.meta_forms.filter(f => !allComplete(f)) ?? [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Live Meta Forms"
        description="All currently published Meta lead ad forms and their workflow integration status"
        actions={
          data ? (
            <div className="flex items-center gap-3">
              {incomplete.length > 0 && (
                <span className="text-xs bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full font-medium">
                  {incomplete.length} form{incomplete.length !== 1 ? "s" : ""} missing workflow steps
                </span>
              )}
              <a
                href={`https://docs.google.com/spreadsheets/d/${data.sheet_id}/edit#gid=${data.sheet_tab_gid}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-md transition-colors"
              >
                <RefreshCw size={12} /> View source sheet
              </a>
            </div>
          ) : undefined
        }
      />

      <div className="px-8 py-6 flex-1 overflow-y-auto">
        {loading && <p className="text-sm text-gray-400">Loading…</p>}

        {data && (
          <>
            {/* Stats */}
            <div className="flex gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-gray-800">{data.meta_forms.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Live forms</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">{ttForms.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Travel Trailer</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600">{tcForms.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Touring Coach</div>
              </div>
              <div className={`bg-white border rounded-xl px-4 py-3 shadow-sm text-center ${incomplete.length > 0 ? "border-red-200" : "border-green-200"}`}>
                <div className={`text-2xl font-bold ${incomplete.length > 0 ? "text-red-600" : "text-green-600"}`}>
                  {data.meta_forms.length - incomplete.length}/{data.meta_forms.length}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Fully wired</div>
              </div>
              <div className="ml-auto flex items-end">
                <p className="text-xs text-gray-400 italic">
                  Synced from sheet: {data.last_synced_from_sheet}
                </p>
              </div>
            </div>

            {/* Table */}
            {[
              { label: "Travel Trailer Forms", forms: ttForms, color: "blue" },
              { label: "Touring Coach Forms", forms: tcForms, color: "purple" },
            ].map(({ label, forms, color }) => (
              <div key={label} className="mb-8">
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 text-${color}-600`}>{label} — {forms.length} live</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-40">Product</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">HubSpot Form Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">IPM Written</th>
                        {CHECKS.map(c => (
                          <th key={c.key} className="text-center px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap">{c.label}</th>
                        ))}
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((form, i) => {
                        const complete = allComplete(form);
                        return (
                          <tr
                            key={form.id}
                            className={`border-b border-gray-100 last:border-0 ${!complete ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                            <td className="px-4 py-2.5 font-medium text-gray-800">{form.product}</td>
                            <td className="px-4 py-2.5 text-gray-600 font-mono text-[10px]">{form.form_name}</td>
                            <td className="px-4 py-2.5 text-gray-600">{form.ipm || form.product}</td>
                            {CHECKS.map(c => (
                              <td key={c.key} className="px-3 py-2.5 text-center">
                                <div className="flex justify-center">
                                  <Check val={form[c.key] as boolean} />
                                </div>
                              </td>
                            ))}
                            <td className="px-4 py-2.5">
                              <div className="flex gap-2">
                                {form.prop_wf_link && (
                                  <a href={form.prop_wf_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[10px]">
                                    Prop WF
                                  </a>
                                )}
                                {form.dealer_routing_link && (
                                  <a href={form.dealer_routing_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[10px]">
                                    Routing WF
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Google Apps Script instructions */}
            <div className="mt-4 border border-gray-200 rounded-xl bg-gray-50 px-5 py-4 max-w-3xl">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Auto-sync setup</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                This page auto-updates when someone edits the sheet. To enable it, add this Google Apps Script to the spreadsheet
                (<span className="font-mono bg-white border border-gray-200 px-1 rounded">Extensions → Apps Script</span>):
              </p>
              <pre className="text-[10px] bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto leading-relaxed text-gray-700">{`const WEBHOOK_URL = "https://airstream-sop-1.vercel.app/api/sync-meta-forms";
const SECRET = "YOUR_SHEETS_SYNC_SECRET"; // match SHEETS_SYNC_SECRET in Vercel env vars

function onEdit(e) {
  const sheet = e.source.getSheetByName("Meta Lead Forms"); // update tab name if needed
  if (!sheet || e.source.getActiveSheet().getName() !== sheet.getName()) return;
  syncMetaForms();
}

function syncMetaForms() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Meta Lead Forms"); // update tab name if needed
  const rows = sheet.getDataRange().getValues();

  // Find header row
  const headerRow = rows.findIndex(r => r.includes("Lead Form Name"));
  if (headerRow === -1) return;

  const headers = rows[headerRow];
  const col = (name) => headers.indexOf(name);

  const forms = [];
  for (let i = headerRow + 2; i < rows.length; i++) {
    const r = rows[i];
    if (r[col("Published?")] !== "Published") continue;
    forms.push({
      id: r[col("Product")].toString().toLowerCase().replace(/[^a-z0-9]/g, "_"),
      product: r[col("Product")] || "",
      form_name: r[col("Lead Form Name")] || "",
      category: r[col("Lead Form Name")].includes("| TC |") ? "Touring Coach" : "Travel Trailer",
      ipm: r[col("Product")] || "",
      added_lead_label: r[col("Added to Lead Label?")] === "Yes" || r[col("Added to Lead Label?")] === true,
      added_lead_score: r[col("Added to Lead Score?")] === "Yes" || r[col("Added to Lead Score?")] === true,
      added_plinko: r[col("Added to Plinko?")] === "Yes" || r[col("Added to Plinko?")] === true,
      added_dealer_distro: r[col("Added to META Dealer Distro?")] === "Yes" || r[col("Added to META Dealer Distro?")] === true,
      added_aimbase: r[col("Has the form been added to the Aimbase workflow?")] === "Yes" || r[col("Has the form been added to the Aimbase workflow?")] === true,
      date_added: r[col("Date forms have been added to workflows")] ? r[col("Date forms have been added to workflows")].toString() : "",
      prop_wf_link: r[col("Property Writing Workflow Link")] || "",
      dealer_routing_link: r[col("Dealer Routing Workflow Link")] || "",
    });
  }

  const payload = JSON.stringify({ secret: SECRET, meta_forms: forms });
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload,
  });
}`}</pre>
              <p className="text-xs text-gray-500 mt-2 leading-snug">
                Also add <span className="font-mono bg-white border border-gray-200 px-1 rounded">SHEETS_SYNC_SECRET</span> as an environment variable in your Vercel project settings (any random string — just make both match).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
