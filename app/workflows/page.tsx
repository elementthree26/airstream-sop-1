"use client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Search, ExternalLink, Pencil, Trash2, Save, X } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { Workflow, WorkflowCategory } from "@/lib/types";
import { SlideOver } from "@/components/SlideOver";
import { DangerBanner } from "@/components/DangerBanner";
import { MarkdownField } from "@/components/MarkdownField";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PageHeader } from "@/components/PageHeader";
import { FieldRow } from "@/components/FieldRow";

const CATEGORIES: WorkflowCategory[] = ["Lead Labeling", "Lead Nurturing", "Lead Routing", "Lead Scoring"];

const EMPTY: Partial<Workflow> = {
  name: "", folder: "", initiative_type: "CORP", product_category: "General",
  asset_type: "WF", creator: "E3", workflow_category: "Lead Labeling",
  trigger_description: "", what_it_does: "", enrollment_criteria: "",
  owner: null, hubspot_url: null, last_verified_date: null,
  danger_notes: null, notes: null,
};

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;
  const { data, loading, save } = useCollection<Workflow[]>("workflows");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<WorkflowCategory | "All">("All");
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Workflow>>({});
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((w) => {
      const matchCat = filterCat === "All" || w.workflow_category === filterCat;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.folder.toLowerCase().includes(q) ||
        (w.what_it_does ?? "").toLowerCase().includes(q) ||
        (w.trigger_description ?? "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [data, search, filterCat]);

  function openRecord(w: Workflow) {
    setSelected(w);
    setEditing(false);
    setDraft({});
    setShowNew(false);
  }

  function startEdit() {
    setDraft({ ...selected });
    setEditing(true);
  }

  function startNew() {
    setSelected(null);
    setDraft({ ...EMPTY });
    setEditing(true);
    setShowNew(true);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const now = new Date().toISOString();
    let next: Workflow[];
    if (showNew) {
      const newItem: Workflow = {
        ...(draft as Workflow),
        id: `wf${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      next = [...data, newItem];
    } else {
      next = data.map((w) =>
        w.id === selected?.id ? { ...w, ...draft, updated_at: now } as Workflow : w
      );
    }
    const ok = await save(next);
    if (ok) {
      if (showNew) {
        setSelected(next[next.length - 1]);
        setShowNew(false);
      } else {
        setSelected(next.find((w) => w.id === selected?.id) ?? null);
      }
      setEditing(false);
      setDraft({});
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!data || !selected) return;
    if (!confirm(`Delete "${selected.name}"?`)) return;
    const next = data.filter((w) => w.id !== selected.id);
    const ok = await save(next);
    if (ok) { setSelected(null); setEditing(false); }
  }

  const record = showNew ? null : selected;
  const editData = editing ? draft : (selected ?? {});

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Workflows"
        description="HubSpot workflow documentation"
        onAdd={startNew}
      />

      <div className="px-8 py-4 border-b flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search workflows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                filterCat === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Folder</th>
                <th className="pb-2 font-medium">Last Verified</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => openRecord(w)}
                  className="border-b hover:bg-gray-50 cursor-pointer group"
                >
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {w.name}
                    </span>
                    {w.danger_notes && (
                      <span className="ml-2 text-red-500 text-xs">⚠</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{w.workflow_category}</td>
                  <td className="py-3 pr-4 text-gray-500">{w.folder}</td>
                  <td className="py-3">
                    <VerifiedBadge date={w.last_verified_date} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        open={!!(selected || showNew)}
        onClose={() => { setSelected(null); setEditing(false); setShowNew(false); setDraft({}); }}
        title={showNew ? "New Workflow" : (selected?.name ?? "")}
      >
        {!editing && selected?.danger_notes && (
          <DangerBanner text={selected.danger_notes} />
        )}

        <div className="flex justify-end gap-2 mb-4">
          {canEdit && !editing && (
            <>
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-md transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-md transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={() => { setEditing(false); setDraft({}); if (showNew) { setSelected(null); setShowNew(false); } }}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>

        <WorkflowForm
          data={editing ? draft : (selected ?? {})}
          editing={editing}
          onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
        />
      </SlideOver>
    </div>
  );
}

function WorkflowForm({
  data,
  editing,
  onChange,
}: {
  data: Partial<Workflow>;
  editing: boolean;
  onChange: (k: keyof Workflow, v: string | null) => void;
}) {
  const fields: Array<{ key: keyof Workflow; label: string; type?: string }> = [
    { key: "name", label: "Name" },
    { key: "folder", label: "Folder" },
    { key: "workflow_category", label: "Category" },
    { key: "initiative_type", label: "Initiative" },
    { key: "product_category", label: "Product Category" },
    { key: "asset_type", label: "Asset Type" },
    { key: "creator", label: "Creator" },
    { key: "trigger_description", label: "Trigger", type: "textarea" },
    { key: "what_it_does", label: "What It Does", type: "textarea" },
    { key: "enrollment_criteria", label: "Enrollment Criteria", type: "textarea" },
    { key: "owner", label: "Owner" },
    { key: "hubspot_url", label: "HubSpot URL", type: "url" },
    { key: "last_verified_date", label: "Last Verified", type: "date" },
    { key: "danger_notes", label: "Danger Notes", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <dl>
      {fields.map(({ key, label, type = "text" }) => {
        const val = (data[key] as string | null) ?? null;
        if (editing) {
          if (type === "textarea") {
            return (
              <div key={key} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-500 pt-1">{label}</label>
                <textarea
                  className="col-span-2 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[72px]"
                  value={val ?? ""}
                  onChange={(e) => onChange(key, e.target.value || null)}
                />
              </div>
            );
          }
          return (
            <div key={key} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
              <label className="text-sm font-medium text-gray-500 pt-1">{label}</label>
              <input
                type={type}
                className="col-span-2 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={val ?? ""}
                onChange={(e) => onChange(key, e.target.value || null)}
              />
            </div>
          );
        }

        return (
          <FieldRow key={key} label={label}>
            {key === "last_verified_date" ? (
              <VerifiedBadge date={val} />
            ) : key === "hubspot_url" && val ? (
              <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                Open in HubSpot <ExternalLink size={12} />
              </a>
            ) : key === "notes" || key === "what_it_does" || key === "trigger_description" || key === "enrollment_criteria" ? (
              <MarkdownField content={val} />
            ) : (
              val || <span className="text-gray-400 italic">—</span>
            )}
          </FieldRow>
        );
      })}
    </dl>
  );
}
