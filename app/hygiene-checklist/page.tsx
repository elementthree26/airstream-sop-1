"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Circle, RefreshCw, AlertTriangle } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { HygieneChecklist } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";

export default function HygieneChecklistPage() {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;
  const { data, loading, save } = useCollection<HygieneChecklist>("hygiene_checklist");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((id: string) => {
    if (!canEdit) return;
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, [canEdit]);

  async function startNew() {
    if (!data || !canEdit) return;
    if (!confirm("Start a new hygiene check? This will reset all checkboxes and log today's date.")) return;
    setSaving(true);
    const ok = await save({ ...data, last_completed_date: new Date().toISOString().split("T")[0] });
    if (ok) setChecked({});
    setSaving(false);
  }

  const allDone = data ? data.items.every((item) => checked[item.id]) : false;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Hygiene Checklist"
        description="Recurring martech hygiene tasks"
        actions={
          canEdit ? (
            <button
              onClick={startNew}
              disabled={saving}
              className="flex items-center gap-2 border border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} /> Start New Check
            </button>
          ) : undefined
        }
      />

      <div className="px-8 py-6 flex-1 overflow-y-auto">
        {loading ? <p className="text-sm text-gray-400">Loading…</p> : data ? (
          <>
            <div className="mb-6 flex items-center gap-4">
              {data.last_completed_date ? (
                <p className="text-sm text-gray-600">
                  Last completed: <span className="font-medium">{new Date(data.last_completed_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No hygiene checks logged yet.</p>
              )}
              {allDone && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">All items complete ✓</span>
              )}
            </div>

            <div className="space-y-3 max-w-2xl">
              {[...data.items].sort((a, b) => a.sort_order - b.sort_order).map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-md p-4 transition-colors cursor-pointer ${
                    checked[item.id] ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggle(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-gray-400">
                      {checked[item.id]
                        ? <CheckCircle2 size={18} className="text-green-600" />
                        : <Circle size={18} />}
                    </span>
                    <div>
                      <p className={`text-sm ${checked[item.id] ? "text-gray-500 line-through" : "text-gray-900"}`}>
                        {item.item_description}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
