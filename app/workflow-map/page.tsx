"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  // entry points
  configurator: "#3b82f6",   // blue
  brochure:     "#8b5cf6",   // purple
  meta:         "#ec4899",   // pink

  // workflow types
  labeling:  "#2563eb",   // blue-600
  nurture:   "#16a34a",   // green-600
  routing:   "#d97706",   // amber-600
  aimbase:   "#0891b2",   // cyan-600
  scoring:   "#7c3aed",   // violet-600
  delivery:  "#0f766e",   // teal-700
};

const LEGEND = [
  { color: C.labeling,  label: "Product Labeling",      desc: "Sets contact properties (model, category, source)" },
  { color: C.nurture,   label: "Lead Nurture (Plinko)",  desc: "Moves contacts through lifecycle stages" },
  { color: C.routing,   label: "Dealer Distro",          desc: "Routes qualified leads toward Aimbase; deduplicates" },
  { color: C.aimbase,   label: "Aimbase Label + Webhook",desc: "Sets Aimbase-specific fields per model" },
  { color: C.delivery,  label: "Send to Aimbase",        desc: "Final Make webhook → Aimbase CRM" },
  { color: C.scoring,   label: "Lead Scoring",           desc: "Parallel scoring layer; can also route to Aimbase" },
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-xl pointer-events-none leading-snug">
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Node ─────────────────────────────────────────────────────────────────────
function Node({
  label, sublabel, color, width = 200, tooltip,
}: {
  label: string; sublabel?: string; color: string; width?: number; tooltip?: string;
}) {
  const box = (
    <div
      style={{ borderColor: color, width }}
      className="border-2 rounded-lg px-3 py-2.5 bg-white shadow-sm cursor-default select-none"
    >
      <div className="text-xs font-semibold text-gray-800 leading-tight">{label}</div>
      {sublabel && <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{sublabel}</div>}
    </div>
  );
  if (tooltip) return <Tooltip text={tooltip}>{box}</Tooltip>;
  return box;
}

// ─── Arrow ─────────────────────────────────────────────────────────────────────
function Arrow({ label, dashed }: { label?: string; dashed?: boolean }) {
  return (
    <div className="flex flex-col items-center my-0.5">
      <div className={`w-px h-5 ${dashed ? "border-l-2 border-dashed border-gray-300" : "bg-gray-400"}`} />
      {label && (
        <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 z-10 -my-0.5 font-medium">
          {label}
        </span>
      )}
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-400" />
    </div>
  );
}

// ─── Gate ─────────────────────────────────────────────────────────────────────
function DedupeGate() {
  return (
    <Tooltip text="Before sending to Aimbase, checks whether the contact is already enrolled in a higher-intent Dealer Distro workflow. If yes, skips — prevents duplicate dealer leads.">
      <div className="flex items-center justify-center my-0.5">
        <div className="text-[9px] font-bold bg-amber-50 border-2 border-amber-400 text-amber-800 px-3 py-1 rounded-full shadow-sm cursor-default">
          🚦 DEDUP GATE — already in higher-intent workflow?
        </div>
      </div>
    </Tooltip>
  );
}

// ─── Lane ─────────────────────────────────────────────────────────────────────
function Lane({
  title, color, accentColor, children, note,
}: {
  title: string; color: string; accentColor: string; children: React.ReactNode; note?: string;
}) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-[220px] max-w-[280px]">
      <div
        style={{ backgroundColor: accentColor }}
        className="w-full text-white text-xs font-bold text-center py-2 rounded-t-xl tracking-wide uppercase"
      >
        {title}
      </div>
      <div
        style={{ borderColor: color }}
        className="border-2 border-t-0 rounded-b-xl w-full flex flex-col items-center px-4 py-4 gap-0 bg-gray-50 min-h-[400px]"
      >
        {children}
      </div>
      {note && <p className="text-[10px] text-gray-500 mt-2 text-center leading-snug max-w-[220px]">{note}</p>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 border-t border-gray-200 pt-3 mt-3 mb-1">
      {label}
    </div>
  );
}

// ─── Shared terminal block ────────────────────────────────────────────────────
function SharedTerminal() {
  return (
    <div className="flex flex-col items-center w-full max-w-[560px] mx-auto mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px w-16 bg-gray-300" />
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest whitespace-nowrap">
          All 3 journeys converge here
        </span>
        <div className="h-px w-16 bg-gray-300" />
      </div>
      <Node
        label="CORP | Aimbase Lead Label + Webhook"
        sublabel="Sets Aimbase-specific fields (dealer region, model code) per product model via branch logic"
        color={C.aimbase}
        width={340}
        tooltip="20+ branches — one per Airstream model. Sets fields like aimbase_model_code and aimbase_dealer_region before the webhook fires. This is what tells Aimbase exactly which product the lead is interested in."
      />
      <Arrow />
      <Node
        label="CORP | Leads — Send to Aimbase"
        sublabel="Triggers Make (Integromat) webhook → delivers lead to Aimbase CRM"
        color={C.delivery}
        width={340}
        tooltip="A simple single-action workflow. Fires the Make webhook which POSTs the contact record to Aimbase. Kept separate so the webhook URL only needs to be updated in one place."
      />
      <Arrow label="Make webhook" />
      <div
        style={{ borderColor: C.delivery }}
        className="border-2 rounded-xl px-6 py-3 bg-teal-50 text-center shadow-sm"
      >
        <div className="text-sm font-bold text-teal-800">Aimbase CRM</div>
        <div className="text-[10px] text-teal-600 mt-0.5">Lead delivered to dealer routing system</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkflowMapPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Workflow Map"
        description="How all HubSpot workflows connect — three entry journeys, shared nurture, and Aimbase delivery"
      />

      <div className="px-8 py-6 flex-1 overflow-auto">

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {LEGEND.map(({ color, label, desc }) => (
            <Tooltip key={label} text={desc}>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm cursor-default">
                <div style={{ backgroundColor: color }} className="w-3 h-3 rounded-sm shrink-0" />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* ── Entry point header ── */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Entry Points — How a contact enters the system</h2>

        {/* Three lanes */}
        <div className="flex gap-6 mb-0 overflow-x-auto pb-4">

          {/* ── Lane 1: Configurator ── */}
          <Lane title="Configurator Form" color={C.configurator} accentColor="#1d4ed8">
            <div className="text-[10px] text-gray-500 text-center mb-3 leading-snug">
              Contact submits a <strong>Build & Price / Configurator</strong> form on airstream.com
            </div>

            <Node
              label="CORP | Configurator Product Labeling"
              sublabel="Sets: Primary Interested Product Model, Category, Lead Source = Configurator"
              color={C.labeling}
              tooltip="Triggered by configurator form submission. Uses hidden fields to identify which model the contact configured. Sets three key contact properties that all downstream workflows depend on."
            />
            <Arrow />
            <SectionHeader label="Parallel enrollment" />
            <Arrow dashed label="simultaneously" />

            <Node
              label="CORP | Lead Nurture Plinko"
              sublabel="Moves contact to 'Configure & Build' lifecycle stage"
              color={C.nurture}
              tooltip="Plinko is a one-directional lifecycle machine with 5 stages: Inspire → Experience Matching → Configure & Build → Try & Buy → Customers. Configurator contacts enter at 'Configure & Build' — a high-intent stage. Contacts can only move forward, never backward."
            />
            <Arrow />

            <Node
              label="CORP | Dealer Distro Handraisers"
              sublabel="Routes hand-raiser (configurator) leads to Aimbase"
              color={C.routing}
              tooltip="'Hand-raiser' = someone who actively configured an Airstream. Highest-intent entry point. Checks dedup gate before proceeding."
            />
            <DedupeGate />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center text-gray-500 mt-1">→ Aimbase chain (below)</div>
          </Lane>

          {/* ── Lane 2: Brochure Download ── */}
          <Lane title="Brochure Download" color={C.brochure} accentColor="#6d28d9">
            <div className="text-[10px] text-gray-500 text-center mb-3 leading-snug">
              Contact downloads a brochure from airstream.com
            </div>

            <Node
              label="CORP | Brochure Download Product Labeling"
              sublabel="Reads Page Referrer URL (not hidden field) to identify model"
              color={C.labeling}
              tooltip="Uses Page Referrer instead of a hidden field because a contact can download multiple brochures in a single session — making a single hidden field unreliable. The referrer URL always reflects which model page they were on."
            />
            <Arrow />
            <SectionHeader label="Parallel enrollment" />
            <Arrow dashed label="simultaneously" />

            <Node
              label="CORP | Lead Nurture Plinko"
              sublabel="Moves contact to 'Experience Matching' lifecycle stage"
              color={C.nurture}
              tooltip="Brochure downloaders enter Plinko at 'Experience Matching' — earlier in the funnel than configurator leads. If the contact already has a higher Plinko stage, they stay there (one-way gate)."
            />
            <Arrow />

            <Node
              label="CORP | Dealer Distro Request Brochure"
              sublabel="Routes brochure-download leads to Aimbase"
              color={C.routing}
              tooltip="Dedicated Dealer Distro workflow for brochure leads. Checks if the contact is already in a higher-intent Dealer Distro workflow (e.g., Handraisers) before proceeding — prevents duplicate dealer pings."
            />
            <DedupeGate />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center text-gray-500 mt-1">→ Aimbase chain (below)</div>
          </Lane>

          {/* ── Lane 3: Meta Lead Ad ── */}
          <Lane
            title="Meta Lead Ad"
            color={C.meta}
            accentColor="#be185d"
            note="Meta lead forms submit directly to HubSpot via native lead syncing — no landing page required."
          >
            <div className="text-[10px] text-gray-500 text-center mb-3 leading-snug">
              Contact submits a <strong>Meta (Facebook/Instagram) lead ad</strong> form
            </div>

            <Node
              label="CORP | META Product Ad Labeling & TYE"
              sublabel="Sets model, category, lead source = Meta Form. Sends personalized TYE email."
              color={C.labeling}
              tooltip="Catches all active Meta lead forms. Uses 20 branches (HubSpot's max) with nested sub-branches for model variants (e.g. Atlas → Atlas 25RT / Atlas 25MS). Also fires a Thank You Email with a smart CTA module — the CTA link changes based on Primary Interested Product Model, showing the correct brochure URL per model."
            />
            <Arrow label="smart TYE email" />
            <Tooltip text="The Thank You Email CTA uses a HubSpot Smart Module driven by Primary Interested Product Model. This is only possible for Meta leads (not web forms) because web contacts may download multiple brochures, making it impossible to know which single model to feature.">
              <div className="border border-pink-300 bg-pink-50 rounded-lg px-3 py-2 w-full text-center mb-2">
                <div className="text-[10px] font-semibold text-pink-800">Thank You Email sent</div>
                <div className="text-[9px] text-pink-600 mt-0.5">CTA button = model-specific brochure link</div>
              </div>
            </Tooltip>

            <SectionHeader label="Parallel enrollment" />
            <Arrow dashed label="simultaneously" />

            <Node
              label="CORP | Lead Nurture Plinko"
              sublabel="Enrolls Meta leads in lifecycle nurture"
              color={C.nurture}
              tooltip="Meta leads also enter Plinko. Stage is set based on the model/category context captured in Product Labeling."
            />
            <Arrow />

            <Node
              label="CORP | Dealer Distro META Lead Ad Submissions"
              sublabel="Routes Meta leads to Aimbase"
              color={C.routing}
              tooltip="Dedicated Dealer Distro for Meta leads. Checks if contact is already in Handraisers workflow — if so, skips to prevent duplicate dealer routing."
            />
            <DedupeGate />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center text-gray-500 mt-1">→ Aimbase chain (below)</div>
          </Lane>

        </div>

        {/* ── Plinko detail strip ── */}
        <div className="mt-8 mb-6 border border-green-200 rounded-xl bg-green-50 px-6 py-4">
          <h3 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-3">
            CORP | Lead Nurture Plinko — Lifecycle Stage Machine (shared by all 3 journeys)
          </h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["Inspire", "Experience Matching", "Configure & Build", "Try & Buy", "Customers"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-1 shrink-0">
                <Tooltip text={
                  i === 0 ? "Earliest stage. Contacts who have only browsed or shown initial interest."
                  : i === 1 ? "Brochure downloaders land here. Beginning to research specific models."
                  : i === 2 ? "Configurator submitters land here. High intent — actively building a unit."
                  : i === 3 ? "Ready to purchase or speak with a dealer."
                  : "Existing customers. Separate nurture track."
                }>
                  <div className={`border-2 border-green-400 bg-white rounded-lg px-3 py-2 text-center text-[10px] font-semibold text-green-800 cursor-default ${i === 2 ? "ring-2 ring-blue-400" : i === 1 ? "ring-2 ring-purple-400" : ""}`}>
                    {stage}
                    {i === 1 && <div className="text-[9px] font-normal text-purple-600 mt-0.5">← Brochure entry</div>}
                    {i === 2 && <div className="text-[9px] font-normal text-blue-600 mt-0.5">← Configurator entry</div>}
                  </div>
                </Tooltip>
                {i < 4 && <div className="text-green-500 font-bold text-sm">→</div>}
              </div>
            ))}
            <div className="ml-3 text-[10px] text-green-700 font-medium border-l border-green-300 pl-3 leading-snug">
              One-way gate:<br />contacts only<br />move forward
            </div>
          </div>
        </div>

        {/* ── Shared Aimbase terminal ── */}
        <div className="mt-2 mb-8">
          <SharedTerminal />
        </div>

        {/* ── Scoring layer ── */}
        <div className="border-2 border-violet-300 rounded-xl bg-violet-50 px-6 py-5 max-w-[700px] mx-auto">
          <h3 className="text-xs font-bold text-violet-800 uppercase tracking-widest mb-1">
            Parallel Lead Scoring Layer — runs independently of the 3 journeys above
          </h3>
          <p className="text-[10px] text-violet-700 mb-4 leading-snug">
            These workflows fire whenever a contact&apos;s lead score changes — regardless of which entry journey they came from.
          </p>

          <div className="flex flex-col items-center">
            <Node
              label="CORP | Simplified Lead Scoring | General | WF | E3"
              sublabel="Triggered by any lead score change. Assigns score tier 1–5."
              color={C.scoring}
              width={380}
              tooltip="Score tiers: 5 = recent hand-raiser (configurator), 4 = score >250, 3 = score 100–250, 2 = score 50–100, 1 = score <50. Score is driven by page visits, email engagement, form submissions, etc."
            />
            <Arrow />

            <div className="flex gap-8 items-start">
              <div className="flex flex-col items-center">
                <div className="text-[10px] bg-violet-100 border border-violet-300 rounded px-2 py-1 text-violet-700 font-medium mb-1">Score = 5 (hand-raiser)</div>
                <div className="text-[9px] text-gray-500">Already routed via<br />Dealer Distro above</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] bg-violet-100 border border-violet-300 rounded px-2 py-1 text-violet-700 font-medium mb-1">Score 1–4</div>
                <Arrow />
                <Node
                  label="CORP | Dealer Distro Simplified Lead Score Change"
                  sublabel="⚠️ Currently OFF — catch-all for score-based routing"
                  color={C.scoring}
                  width={270}
                  tooltip="This workflow is currently turned OFF. When enabled, it catches contacts with scores 1–4 who haven't yet been routed via any of the three Dealer Distro workflows above. Includes the same dedup gate — checks all three Dealer Distro workflows before proceeding to the Aimbase chain."
                />
                <DedupeGate />
                <Arrow label="if not duplicate" />
                <div className="text-[10px] text-center text-gray-500">→ Aimbase chain (above)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Architecture notes ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              title: "Why three separate Dealer Distro workflows?",
              body: "Each entry point has different intent levels (hand-raiser > brochure > Meta). Keeping them separate lets us tune delay timers, enrollment criteria, and dedup logic per source — without one workflow's logic bleeding into another.",
            },
            {
              title: "Why does Aimbase labeling sit between Dealer Distro and the webhook?",
              body: "Aimbase needs model-specific fields (dealer region, model code) that aren't set on the base contact record. By labeling right before delivery, we guarantee the fields are always fresh and model-accurate at webhook time.",
            },
            {
              title: "Why can't the web form TYE email show a model-specific CTA?",
              body: "A contact can download 3 brochures in one session. The last form submission overwrites the contact's model field — so we can't reliably know which single model to feature. Meta leads only submit one form, so it works there.",
            },
          ].map(({ title, body }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-gray-800 mb-1.5">{title}</div>
              <div className="text-[11px] text-gray-600 leading-relaxed">{body}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
