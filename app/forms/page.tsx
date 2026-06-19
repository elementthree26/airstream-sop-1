"use client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Search, ExternalLink, Pencil, Trash2, Save, X } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { Form } from "@/lib/types";
import { SlideOver } from "@/components/SlideOver";
import { MarkdownField } from "@/components/MarkdownField";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PageHeader } from "@/components/PageHeader";
import { FieldRow } from "@/components/FieldRow";

const EMPTY: Partial<Form> = {
  name: "", folder_category: "Model Brochures", product_category: "General",
  hubspot_url: null, connected_workflows: [], hidden_fields: [], notes: null, last_verified_date: null,
};

export default function FormsPage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;
  const { data, loading, save } = useCollection<Form[]>("forms");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Form | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Form>>({});
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return !q ? data : data.filter((f) =>
      f.name.toLowerCase().includes(q) || f.folder_category.toLowerCase().includes(q)
    );
  }, [data, search]);

  function openRecord(f: Form) { setSelected(f); setEditing(false); setDraft({}); setShowNew(false); }
  function startEdit() { setDraft({ ...selected }); setEditing(true); }
  function startNew() { setSelected(null); setDraft({ ...EMPTY }); setEditing(true); setShowNew(true); }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const now = new Date().toISOString();
    let next: Form[];
    if (showNew) {
      const newItem: Form = { ...(draft as Form), id: `form${Date.now()}`, created_at: now, updated_at: now };
      next = [...data, newItem];
    } else {
      next = data.map((f) => f.id === selected?.id ? { ...f, ...draft, updated_at: now } as Form : f);
    }
    const ok = await save(next);
    if (ok) {
      if (showNew) { setSelected(next[next.length - 1]); setShowNew(false); }
      else setSelected(next.find((f) => f.id === selected?.id) ?? null);
      setEditing(false); setDraft({});
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!data || !selected) return;
    if (!confirm(`Delete "${selected.name}"?`)) return;
    const next = data.filter((f) => f.id !== selected.id);
    const ok = await save(next);
    if (ok) { setSelected(null); setEditing(false); }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Forms" description="HubSpot form documentation" onAdd={startNew} />

      <div className="px-8 py-4 border-b">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-4">
        {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Folder</th>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 font-medium">Last Verified</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} onClick={() => openRecord(f)} className="border-b hover:bg-gray-50 cursor-pointer group">
                  <td className="py-3 pr-4 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{f.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{f.folder_category}</td>
                  <td className="py-3 pr-4 text-gray-500">{f.product_category}</td>
                  <td className="py-3"><VerifiedBadge date={f.last_verified_date} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        open={!!(selected || showNew)}
        onClose={() => { setSelected(null); setEditing(false); setShowNew(false); setDraft({}); }}
        title={showNew ? "New Form" : (selected?.name ?? "")}
      >
        <div className="flex justify-end gap-2 mb-4">
          {canEdit && !editing && (
            <>
              <button onClick={startEdit} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-md transition-colors">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-md transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setDraft({}); if (showNew) { setSelected(null); setShowNew(false); } }} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md disabled:opacity-50">
                <Save size={14} /> {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>

        <dl>
          {(["name", "folder_category", "product_category", "hubspot_url", "last_verified_date", "notes"] as const).map((key) => {
            const val = editing ? (draft[key] as string ?? null) : (selected?.[key] as string ?? null);
            if (editing) return (
              <div key={key} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-500 pt-1 capitalize">{key.replace(/_/g, " ")}</label>
                <input type={key === "hubspot_url" ? "url" : key === "last_verified_date" ? "date" : "text"}
                  className="col-span-2 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={val ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value || null }))} />
              </div>
            );
            return (
              <FieldRow key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}>
                {key === "last_verified_date" ? <VerifiedBadge date={val} />
                  : key === "hubspot_url" && val ? <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">Open in HubSpot <ExternalLink size={12} /></a>
                  : key === "notes" ? <MarkdownField content={val} />
                  : val || <span className="text-gray-400 italic">—</span>}
              </FieldRow>
            );
          })}
          <FieldRow label="Connected Workflows">
            {(selected?.connected_workflows ?? []).length ? (
              <ul className="space-y-1">
                {(selected?.connected_workflows ?? []).map((wf, i) => (
                  <li key={i} className="text-sm text-gray-700">• {wf}</li>
                ))}
              </ul>
            ) : <span className="text-gray-400 italic">—</span>}
          </FieldRow>
          <FieldRow label="Hidden Fields">
            {(selected?.hidden_fields ?? []).length ? (
              <ul className="space-y-1">
                {(selected?.hidden_fields ?? []).map((f, i) => (
                  <li key={i} className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{f}</li>
                ))}
              </ul>
            ) : <span className="text-gray-400 italic">—</span>}
          </FieldRow>
        </dl>
      </SlideOver>
    </div>
  );
}
