"use client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Search, Pencil, Trash2, Save, X } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { LeadScoring } from "@/lib/types";
import { SlideOver } from "@/components/SlideOver";
import { MarkdownField } from "@/components/MarkdownField";
import { PageHeader } from "@/components/PageHeader";
import { FieldRow } from "@/components/FieldRow";

const EMPTY: Partial<LeadScoring> = {
  scoring_group: "", action_description: "", points: null,
  group_cap: null, decay_rule: null, velocity_rule: null, notes: null,
};

export default function LeadScoringPage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;
  const { data, loading, save } = useCollection<LeadScoring[]>("lead_scoring");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LeadScoring | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<LeadScoring>>({});
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return !q ? data : data.filter((s) =>
      s.scoring_group.toLowerCase().includes(q) || (s.action_description ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  function openRecord(s: LeadScoring) { setSelected(s); setEditing(false); setDraft({}); setShowNew(false); }
  function startEdit() { setDraft({ ...selected }); setEditing(true); }
  function startNew() { setSelected(null); setDraft({ ...EMPTY }); setEditing(true); setShowNew(true); }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    const now = new Date().toISOString();
    let next: LeadScoring[];
    if (showNew) {
      const newItem: LeadScoring = { ...(draft as LeadScoring), id: `ls${Date.now()}`, created_at: now, updated_at: now };
      next = [...data, newItem];
    } else {
      next = data.map((s) => s.id === selected?.id ? { ...s, ...draft, updated_at: now } as LeadScoring : s);
    }
    const ok = await save(next);
    if (ok) {
      if (showNew) { setSelected(next[next.length - 1]); setShowNew(false); }
      else setSelected(next.find((s) => s.id === selected?.id) ?? null);
      setEditing(false); setDraft({});
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!data || !selected) return;
    if (!confirm(`Delete "${selected.scoring_group}"?`)) return;
    const next = data.filter((s) => s.id !== selected.id);
    const ok = await save(next);
    if (ok) { setSelected(null); setEditing(false); }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Lead Scoring" description="HubSpot lead scoring rules and groups" onAdd={startNew} />

      <div className="px-8 py-4 border-b">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search scoring groups…"
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
                <th className="pb-2 pr-4 font-medium">Scoring Group</th>
                <th className="pb-2 pr-4 font-medium">Points</th>
                <th className="pb-2 pr-4 font-medium">Cap</th>
                <th className="pb-2 font-medium">Decay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => openRecord(s)} className="border-b hover:bg-gray-50 cursor-pointer group">
                  <td className="py-3 pr-4 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{s.scoring_group}</td>
                  <td className="py-3 pr-4 text-gray-600">{s.points ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.group_cap ?? "—"}</td>
                  <td className="py-3 text-gray-500 text-xs">{s.decay_rule ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        open={!!(selected || showNew)}
        onClose={() => { setSelected(null); setEditing(false); setShowNew(false); setDraft({}); }}
        title={showNew ? "New Scoring Group" : (selected?.scoring_group ?? "")}
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
          {(["scoring_group", "action_description", "points", "group_cap", "decay_rule", "velocity_rule", "notes"] as const).map((key) => {
            const raw = editing ? draft[key] : selected?.[key];
            const val = raw != null ? String(raw) : null;
            const isNumber = key === "points" || key === "group_cap";
            if (editing) return (
              <div key={key} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-500 pt-1 capitalize">{key.replace(/_/g, " ")}</label>
                <input type={isNumber ? "number" : "text"}
                  className="col-span-2 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={val ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: isNumber ? (e.target.value ? Number(e.target.value) : null) : (e.target.value || null) }))} />
              </div>
            );
            return (
              <FieldRow key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}>
                {key === "notes" ? <MarkdownField content={val} /> : val || <span className="text-gray-400 italic">—</span>}
              </FieldRow>
            );
          })}
        </dl>
      </SlideOver>
    </div>
  );
}
