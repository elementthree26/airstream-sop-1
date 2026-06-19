"use client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Plus, CheckCircle2, Circle, AlertTriangle, Pencil, Trash2, Save, X } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { ChecklistTemplateItem, ChecklistInstance, ChecklistInstanceItem } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { DangerBanner } from "@/components/DangerBanner";

interface Props {
  title: string;
  templateCollection: string;
  checklistType: "new_form" | "new_model";
}

export function ChecklistPage({ title, templateCollection, checklistType }: Props) {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;

  const { data: template, loading: tLoading, save: saveTemplate } = useCollection<ChecklistTemplateItem[]>(templateCollection);
  const { data: instances, loading: iLoading, save: saveInstances } = useCollection<ChecklistInstance[]>("checklist_instances");

  const [tab, setTab] = useState<"template" | "instances">("template");
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<Partial<ChecklistTemplateItem>>({});
  const [showNewItem, setShowNewItem] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [showNewLaunch, setShowNewLaunch] = useState(false);
  const [saving, setSaving] = useState(false);

  const myInstances = useMemo(
    () => (instances ?? []).filter((i) => i.checklist_type === checklistType),
    [instances, checklistType]
  );

  const activeInstance = useMemo(
    () => myInstances.find((i) => i.id === selectedInstance) ?? null,
    [myInstances, selectedInstance]
  );

  const sections = useMemo(() => {
    if (!template) return {};
    const map: Record<string, ChecklistTemplateItem[]> = {};
    [...template].sort((a, b) => a.sort_order - b.sort_order).forEach((item) => {
      if (!map[item.section]) map[item.section] = [];
      map[item.section].push(item);
    });
    return map;
  }, [template]);

  async function createLaunch() {
    if (!template || !instances || !newLabel.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    const newInstance: ChecklistInstance = {
      id: `ci${Date.now()}`,
      checklist_type: checklistType,
      label: newLabel.trim(),
      created_at: now,
      created_by: session?.user?.login ?? session?.user?.name ?? "unknown",
      items: template.map((item) => ({
        checklist_item_id: item.id,
        completed: false,
        completed_by: null,
        completed_at: null,
        notes: null,
      })),
    };
    const ok = await saveInstances([...instances, newInstance]);
    if (ok) {
      setSelectedInstance(newInstance.id);
      setTab("instances");
      setNewLabel("");
      setShowNewLaunch(false);
    }
    setSaving(false);
  }

  async function toggleItem(instanceId: string, itemId: string, completed: boolean) {
    if (!instances) return;
    const now = new Date().toISOString();
    const next = instances.map((inst) => {
      if (inst.id !== instanceId) return inst;
      return {
        ...inst,
        items: inst.items.map((it) =>
          it.checklist_item_id !== itemId ? it : {
            ...it,
            completed,
            completed_by: completed ? (session?.user?.login ?? session?.user?.name ?? "unknown") : null,
            completed_at: completed ? now : null,
          }
        ),
      };
    });
    await saveInstances(next);
  }

  async function saveTemplateItem() {
    if (!template) return;
    setSaving(true);
    let next: ChecklistTemplateItem[];
    if (showNewItem) {
      const newItem: ChecklistTemplateItem = {
        id: `${checklistType.slice(0, 2)}${Date.now()}`,
        section: itemDraft.section ?? "General",
        sort_order: (template.length + 1),
        item_description: itemDraft.item_description ?? "",
        workflow_reference: itemDraft.workflow_reference ?? null,
        danger_note: itemDraft.danger_note ?? null,
        notes: itemDraft.notes ?? null,
      };
      next = [...template, newItem];
    } else {
      next = template.map((t) => t.id === editingItem ? { ...t, ...itemDraft } as ChecklistTemplateItem : t);
    }
    const ok = await saveTemplate(next);
    if (ok) { setEditingItem(null); setShowNewItem(false); setItemDraft({}); }
    setSaving(false);
  }

  async function deleteTemplateItem(id: string) {
    if (!template || !confirm("Delete this checklist item?")) return;
    await saveTemplate(template.filter((t) => t.id !== id));
  }

  function instanceProgress(inst: ChecklistInstance) {
    const total = inst.items.length;
    const done = inst.items.filter((i) => i.completed).length;
    return { done, total };
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={title}
        actions={
          tab === "instances" && canEdit ? (
            <button
              onClick={() => setShowNewLaunch(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              <Plus size={16} /> New Launch
            </button>
          ) : tab === "template" && canEdit ? (
            <button
              onClick={() => { setShowNewItem(true); setItemDraft({ section: "General" }); setEditingItem(null); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              <Plus size={16} /> Add Item
            </button>
          ) : undefined
        }
      />

      <div className="flex border-b px-8">
        {(["template", "instances"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "template" && (
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tLoading ? <p className="text-sm text-gray-400">Loading…</p> : (
            <>
              {(showNewItem || editingItem) && (
                <div className="mb-6 bg-gray-50 border rounded-md p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">{showNewItem ? "New Item" : "Edit Item"}</h3>
                  {(["section", "item_description", "workflow_reference", "danger_note", "notes"] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500 capitalize">{key.replace(/_/g, " ")}</label>
                      <textarea
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={key === "item_description" ? 3 : 2}
                        value={(itemDraft[key] as string) ?? ""}
                        onChange={(e) => setItemDraft((d) => ({ ...d, [key]: e.target.value || null }))}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditingItem(null); setShowNewItem(false); setItemDraft({}); }} className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md flex items-center gap-1">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveTemplateItem} disabled={saving} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50">
                      <Save size={14} /> {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {Object.entries(sections).map(([section, items]) => (
                <div key={section} className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{section}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border rounded-md p-4">
                        {item.danger_note && (
                          <div className="flex gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                            <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-800 font-medium">{item.danger_note}</p>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.item_description}</p>
                            {item.workflow_reference && (
                              <p className="text-xs text-blue-600 mt-1">→ {item.workflow_reference}</p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                            )}
                          </div>
                          {canEdit && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingItem(item.id); setItemDraft({ ...item }); setShowNewItem(false); }}
                                className="text-gray-400 hover:text-blue-600 p-1"
                              >
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => deleteTemplateItem(item.id)} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === "instances" && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r overflow-y-auto">
            {showNewLaunch && (
              <div className="p-4 border-b bg-gray-50">
                <p className="text-xs font-medium text-gray-600 mb-2">Launch label</p>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="e.g. Rangeline 21PL — June 2026"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowNewLaunch(false); setNewLabel(""); }} className="flex-1 text-xs border border-gray-300 text-gray-600 py-1.5 rounded-md">Cancel</button>
                  <button onClick={createLaunch} disabled={saving || !newLabel.trim()} className="flex-1 text-xs bg-blue-600 text-white py-1.5 rounded-md disabled:opacity-50">{saving ? "Creating…" : "Create"}</button>
                </div>
              </div>
            )}

            {iLoading ? <p className="text-sm text-gray-400 p-4">Loading…</p> : myInstances.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">No launches yet.</p>
            ) : (
              <ul>
                {[...myInstances].reverse().map((inst) => {
                  const { done, total } = instanceProgress(inst);
                  return (
                    <li
                      key={inst.id}
                      onClick={() => setSelectedInstance(inst.id)}
                      className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedInstance === inst.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""}`}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">{inst.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{done}/{total} complete</p>
                      <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {!activeInstance ? (
              <p className="text-sm text-gray-400">Select a launch to view.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{activeInstance.label}</h2>
                  <span className="text-sm text-gray-500">
                    {instanceProgress(activeInstance).done}/{instanceProgress(activeInstance).total} items complete
                  </span>
                </div>
                <InstanceChecklist
                  instance={activeInstance}
                  template={template ?? []}
                  canEdit={!!canEdit}
                  onToggle={(itemId, completed) => toggleItem(activeInstance.id, itemId, completed)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InstanceChecklist({
  instance,
  template,
  canEdit,
  onToggle,
}: {
  instance: ChecklistInstance;
  template: ChecklistTemplateItem[];
  canEdit: boolean;
  onToggle: (itemId: string, completed: boolean) => void;
}) {
  const itemMap = useMemo(() => {
    const m: Record<string, ChecklistTemplateItem> = {};
    template.forEach((t) => { m[t.id] = t; });
    return m;
  }, [template]);

  const sections = useMemo(() => {
    const map: Record<string, Array<{ instanceItem: ChecklistInstanceItem; templateItem: ChecklistTemplateItem }>> = {};
    instance.items.forEach((ii) => {
      const ti = itemMap[ii.checklist_item_id];
      if (!ti) return;
      if (!map[ti.section]) map[ti.section] = [];
      map[ti.section].push({ instanceItem: ii, templateItem: ti });
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.templateItem.sort_order - b.templateItem.sort_order));
    return map;
  }, [instance, itemMap]);

  return (
    <div className="space-y-8">
      {Object.entries(sections).map(([section, items]) => (
        <div key={section}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{section}</h3>
          <div className="space-y-3">
            {items.map(({ instanceItem: ii, templateItem: ti }) => (
              <div key={ti.id} className={`border rounded-md p-4 transition-colors ${ii.completed ? "bg-green-50 border-green-200" : "bg-white"}`}>
                {ti.danger_note && (
                  <div className="flex gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                    <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800 font-medium">{ti.danger_note}</p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => canEdit && onToggle(ti.id, !ii.completed)}
                    disabled={!canEdit}
                    className="mt-0.5 shrink-0 text-gray-400 hover:text-blue-600 disabled:cursor-default"
                  >
                    {ii.completed
                      ? <CheckCircle2 size={18} className="text-green-600" />
                      : <Circle size={18} />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${ii.completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                      {ti.item_description}
                    </p>
                    {ti.workflow_reference && (
                      <p className="text-xs text-blue-600 mt-1">→ {ti.workflow_reference}</p>
                    )}
                    {ti.notes && <p className="text-xs text-gray-500 mt-1">{ti.notes}</p>}
                    {ii.completed && ii.completed_by && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed by {ii.completed_by} · {ii.completed_at ? new Date(ii.completed_at).toLocaleDateString() : ""}
                      </p>
                    )}
                    {ii.notes && <p className="text-xs text-blue-700 mt-1 bg-blue-50 px-2 py-1 rounded">Note: {ii.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
