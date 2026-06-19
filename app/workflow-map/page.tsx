"use client";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  configurator: { border: "#2563eb", bg: "#eff6ff", header: "#1d4ed8", text: "#1e40af" },
  brochure:     { border: "#7c3aed", bg: "#f5f3ff", header: "#6d28d9", text: "#5b21b6" },
  meta:         { border: "#be185d", bg: "#fdf2f8", header: "#9d174d", text: "#831843" },
  labeling:     { border: "#2563eb", tag: "bg-blue-100 text-blue-800" },
  nurture:      { border: "#15803d", tag: "bg-green-100 text-green-800" },
  routing:      { border: "#b45309", tag: "bg-amber-100 text-amber-800" },
  aimbase:      { border: "#0e7490", tag: "bg-cyan-100 text-cyan-800" },
  delivery:     { border: "#0f766e", tag: "bg-teal-100 text-teal-800" },
  scoring:      { border: "#6d28d9", tag: "bg-violet-100 text-violet-800" },
};

const LEGEND = [
  { color: "#2563eb", label: "Product Labeling" },
  { color: "#15803d", label: "Lead Nurture (Plinko)" },
  { color: "#b45309", label: "Dealer Distro / Routing" },
  { color: "#0e7490", label: "Aimbase Labeling" },
  { color: "#0f766e", label: "Aimbase Delivery" },
  { color: "#6d28d9", label: "Lead Scoring" },
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none leading-snug">
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${color}`}>
      {label}
    </span>
  );
}

// ─── Detailed workflow node ───────────────────────────────────────────────────
type NodeProps = {
  name: string;
  type: string;
  typeColor: string;
  borderColor: string;
  trigger?: string;
  branchLogic?: string[];
  sets?: string[];
  why?: string;
  warning?: string;
  width?: number;
};

function WFNode({ name, type, typeColor, borderColor, trigger, branchLogic, sets, why, warning, width = 260 }: NodeProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderColor, width }} className="border-2 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full text-left px-3 pt-2.5 pb-2 flex items-start justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Tag label={type} color={typeColor} />
            {warning && <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">⚠️ {warning}</span>}
          </div>
          <p className="text-[11px] font-bold text-gray-800 leading-snug">{name}</p>
        </div>
        <span className="mt-0.5 shrink-0 text-gray-400">
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* Expandable detail */}
      {open && (
        <div className="border-t px-3 py-2.5 space-y-2.5 text-[10px]" style={{ borderColor }}>
          {trigger && (
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wide mb-0.5">Enrollment Trigger</p>
              <p className="text-gray-700 leading-snug">{trigger}</p>
            </div>
          )}
          {branchLogic && branchLogic.length > 0 && (
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wide mb-0.5">Branch Logic / Data Inputs</p>
              <ul className="space-y-0.5">
                {branchLogic.map(b => (
                  <li key={b} className="flex gap-1 text-gray-700 leading-snug">
                    <span className="text-gray-400 shrink-0">→</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sets && sets.length > 0 && (
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wide mb-0.5">Properties Written</p>
              <ul className="space-y-0.5">
                {sets.map(s => (
                  <li key={s} className="flex gap-1 text-gray-700 leading-snug">
                    <span className="text-blue-500 shrink-0 font-bold">✎</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {why && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
              <p className="font-bold text-amber-700 uppercase tracking-wide mb-0.5">Why this exists</p>
              <p className="text-amber-800 leading-snug">{why}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Arrow ────────────────────────────────────────────────────────────────────
function Arrow({ label, dashed, color = "#9ca3af" }: { label?: string; dashed?: boolean; color?: string }) {
  return (
    <div className="flex flex-col items-center my-0.5">
      <div style={{ borderColor: color }} className={`w-px h-4 ${dashed ? "border-l-2 border-dashed" : ""}`}
        {...(!dashed && { style: { width: 1, height: 16, backgroundColor: color } })} />
      {label && (
        <span className="text-[9px] bg-white text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 z-10 -my-0.5 font-medium whitespace-nowrap">
          {label}
        </span>
      )}
      <div style={{ borderTopColor: color }} className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px]" />
    </div>
  );
}

// ─── Dedup gate ───────────────────────────────────────────────────────────────
function DedupeGate({ checks }: { checks: string }) {
  return (
    <Tip text={checks}>
      <div className="flex items-center justify-center my-1 cursor-default">
        <div className="text-[9px] font-bold bg-amber-50 border-2 border-amber-400 text-amber-800 px-3 py-1 rounded-full shadow-sm">
          🚦 DEDUP GATE — hover for logic
        </div>
      </div>
    </Tip>
  );
}

// ─── Lane wrapper ─────────────────────────────────────────────────────────────
function Lane({ title, c, note, children }: { title: string; c: typeof C.configurator; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-[280px] max-w-[320px]">
      <div style={{ backgroundColor: c.header }} className="w-full text-white text-xs font-bold text-center py-2 rounded-t-xl tracking-wide uppercase">
        {title}
      </div>
      <div style={{ borderColor: c.border, backgroundColor: c.bg }} className="border-2 border-t-0 rounded-b-xl w-full flex flex-col items-center px-4 py-4 gap-0 min-h-[500px]">
        {children}
      </div>
      {note && <p className="text-[10px] text-gray-500 mt-2 text-center leading-snug max-w-[280px] italic">{note}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkflowMapPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Workflow Map"
        description="Full detail on every HubSpot workflow — triggers, branch logic, data inputs, properties written, and reasoning. Click any node to expand."
      />

      <div className="px-8 py-6 flex-1 overflow-auto">

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
              <div style={{ backgroundColor: color }} className="w-3 h-3 rounded-sm shrink-0" />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <ChevronDown size={12} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Click any node to expand detail</span>
          </div>
        </div>

        {/* Entry point label */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Step 1 — Contact enters via one of three entry points</h2>

        {/* Three lanes */}
        <div className="flex gap-6 mb-0 overflow-x-auto pb-2">

          {/* ── LANE 1: Configurator ── */}
          <Lane title="Entry Point 1: Configurator Form" c={C.configurator}>
            <p className="text-[10px] text-blue-700 text-center mb-3 leading-snug font-medium">
              Contact submits a Build & Price / Configurator form on airstream.com
            </p>

            <WFNode
              name="CORP | Configurator Product Labeling"
              type="Product Labeling"
              typeColor={C.labeling.tag}
              borderColor={C.labeling.border}
              trigger="Contact submits any Airstream configurator form. HubSpot form submission event fires enrollment."
              branchLogic={[
                "Hidden field: model_selection — which specific Airstream model the contact configured (e.g. 'Bambi 16RB')",
                "Hidden field: model_type — Travel Trailer or Touring Coach",
                "One branch per model — workflow reads both fields to determine which branch executes",
              ]}
              sets={[
                "Primary Interested Product Model → model_selection value (e.g. 'Bambi 16RB')",
                "Primary Interested Product Category → model_type value (Travel Trailer / Touring Coach)",
                "Interested Lead Source → 'Configurator'",
              ]}
              why="Hidden fields work here because a configurator session is one model — the contact actively selects and builds a single unit. The form can reliably pass both model and type via hidden fields without risk of multi-session contamination."
            />

            <Arrow />
            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest my-1">Parallel enrollment ↓</p>
            <Arrow dashed label="simultaneously" />

            <WFNode
              name="CORP | Lead Nurture Plinko"
              type="Lead Nurture"
              typeColor={C.nurture.tag}
              borderColor={C.nurture.border}
              trigger="Exits Configurator Product Labeling. Enrolls in Plinko if not already at a higher stage."
              branchLogic={[
                "Checks contact's current Lifecycle Status against the 5-stage ladder",
                "One-way gate: if contact is already at Configure & Build or higher, no change — never moves backward",
                "Configurator contacts enter at stage 3: Configure & Build (highest non-purchase intent stage)",
              ]}
              sets={[
                "Lifecycle Status → 'Configure & Build' (if not already higher)",
              ]}
              why="Plinko is the single source of truth for lifecycle stage. Keeping it centralized means all downstream nurture emails, segments, and reporting reference one consistent property rather than each team managing their own stage logic."
            />
            <Arrow />

            <WFNode
              name="CORP | Dealer Distro Handraisers"
              type="Dealer Distro"
              typeColor={C.routing.tag}
              borderColor={C.routing.border}
              trigger="Exits Configurator Product Labeling. Highest-intent routing workflow — configurator = hand-raiser."
              branchLogic={[
                "Dedup check: is contact currently active in Dealer Distro Request Brochure or Dealer Distro META Lead Ad Submissions?",
                "If already in another Dealer Distro workflow → skip (already being routed, no duplicate needed)",
                "If clear → proceed to Aimbase labeling chain",
              ]}
              sets={[]}
              why="Called 'Handraisers' because configurator contacts have actively built a unit — the highest self-declared purchase intent signal. They get a dedicated routing path separate from brochure and Meta leads so timing and messaging can be tuned for their higher intent level."
            />

            <DedupeGate checks="Checks: Is this contact currently enrolled in CORP | Dealer Distro Request Brochure OR CORP | Dealer Distro META Lead Ad Submissions? If yes, suppress — they're already being routed to Aimbase and a duplicate webhook would create a duplicate dealer lead." />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center font-semibold text-gray-500 mt-1">↓ Aimbase Chain (see below)</div>
          </Lane>

          {/* ── LANE 2: Brochure Download ── */}
          <Lane title="Entry Point 2: Brochure Download" c={C.brochure} note="A contact can download multiple brochures in one session — this is the key technical constraint that shapes this entire lane.">
            <p className="text-[10px] text-purple-700 text-center mb-3 leading-snug font-medium">
              Contact downloads a brochure from any Airstream model page on airstream.com
            </p>

            <WFNode
              name="CORP | Brochure Download Product Labeling"
              type="Product Labeling"
              typeColor={C.labeling.tag}
              borderColor={C.labeling.border}
              trigger="Contact submits any brochure download form (one exists on each model page)."
              branchLogic={[
                "Page Referrer URL — the URL of the model page the contact was on when they submitted the form",
                "NOT a hidden field — because a contact can download 3 brochures in one session, a hidden field would be overwritten by the last submission, making it unreliable",
                "Each model page has a unique URL slug. Workflow branches on referrer URL pattern (e.g. /travel-trailers/bambi/ → Bambi)",
                "One branch per model URL pattern",
              ]}
              sets={[
                "Primary Interested Product Model → model identified from page referrer URL",
                "Primary Interested Product Category → Travel Trailer or Touring Coach (derived from URL path)",
                "Interested Lead Source → 'Brochure Download'",
              ]}
              why="Page Referrer is used instead of a hidden field specifically because multi-brochure downloads are common. If someone downloads an Airstream 16RB brochure, then an Atlas brochure, a hidden field would show 'Atlas' for both contacts — losing the first signal entirely. Referrer URL captures the accurate model context per submission."
            />

            <Arrow />
            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest my-1">Parallel enrollment ↓</p>
            <Arrow dashed label="simultaneously" />

            <WFNode
              name="CORP | Lead Nurture Plinko"
              type="Lead Nurture"
              typeColor={C.nurture.tag}
              borderColor={C.nurture.border}
              trigger="Exits Brochure Download Product Labeling."
              branchLogic={[
                "One-way gate: checks current Lifecycle Status",
                "Brochure contacts enter at stage 2: Experience Matching — earlier in the funnel than configurator",
                "If contact is already at Configure & Build or higher, no change",
              ]}
              sets={[
                "Lifecycle Status → 'Experience Matching' (if not already higher)",
              ]}
              why="Brochure downloaders have shown interest but haven't committed to a model (they might download 3). They enter at a lower Plinko stage than configurator contacts to reflect that lower intent signal."
            />
            <Arrow />

            <WFNode
              name="CORP | Dealer Distro Request Brochure"
              type="Dealer Distro"
              typeColor={C.routing.tag}
              borderColor={C.routing.border}
              trigger="Exits Brochure Download Product Labeling."
              branchLogic={[
                "Dedup check: is contact currently active in CORP | Dealer Distro Handraisers?",
                "Handraisers = higher intent — if already there, skip this lower-intent routing path",
                "If not in Handraisers → proceed to Aimbase chain",
              ]}
              sets={[]}
              why="Separate from Handraisers so brochure-specific delays and messaging can differ from configurator leads. Dedup logic is asymmetric — only checks for Handraisers (not the Meta workflow) because Handraisers is higher intent than brochure. Meta and brochure are roughly equivalent."
            />

            <DedupeGate checks="Checks: Is this contact currently enrolled in CORP | Dealer Distro Handraisers? If yes, suppress — they've already been routed as a higher-intent hand-raiser. No need to re-route at a lower intent level." />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center font-semibold text-gray-500 mt-1">↓ Aimbase Chain (see below)</div>
          </Lane>

          {/* ── LANE 3: Meta Lead Ad ── */}
          <Lane title="Entry Point 3: Meta Lead Ad" c={C.meta} note="Meta lead forms submit directly into HubSpot via native Meta–HubSpot lead sync. No Airstream landing page is involved.">
            <p className="text-[10px] text-pink-700 text-center mb-3 leading-snug font-medium">
              Contact submits a Facebook or Instagram lead ad form for any active Airstream campaign
            </p>

            <WFNode
              name="CORP | META Product Ad Labeling & TYE"
              type="Product Labeling"
              typeColor={C.labeling.tag}
              borderColor={C.labeling.border}
              trigger="Contact is created or updated via Meta lead sync. Workflow catches all active Airstream Meta lead ad form submissions."
              branchLogic={[
                "HubSpot branch per Meta form ID — one branch per active Meta lead form",
                "HubSpot caps branches at 20 — for models with multiple floor plans (e.g. Atlas), sub-branches are nested inside the Atlas branch to handle Atlas 25RT vs Atlas 25MS",
                "Branch identifies which specific model campaign the contact came from",
                "After branching: sets all three key properties, then sends Thank You Email",
              ]}
              sets={[
                "Primary Interested Product Model → model from Meta campaign (e.g. 'Atlas 25RT')",
                "Primary Interested Product Category → Travel Trailer or Touring Coach",
                "Interested Lead Source → 'CORP Meta Form'",
              ]}
              why="Meta leads arrive with no page context (no referrer URL, no configurator hidden fields). The only signal is which Meta form they submitted — so the workflow uses form ID as the branching key. The 20-branch HubSpot limit forced a nested branch design for multi-variant models like the Atlas."
            />

            <Arrow label="after properties set" />

            {/* TYE email callout */}
            <Tip text="The CTA button in this email uses a HubSpot Smart Module driven by Primary Interested Product Model — the button URL changes per model to show the correct brochure PDF link. This is ONLY possible for Meta leads (not web brochure forms) because Meta contacts submit exactly one form, so Primary Interested Product Model is reliable. Web brochure contacts may download multiple brochures, making the property unreliable for a single smart CTA.">
              <div className="border-2 border-pink-300 bg-pink-50 rounded-xl px-3 py-2.5 w-full mb-1 cursor-default">
                <div className="text-[10px] font-bold text-pink-800 mb-1">📧 Thank You Email fires here</div>
                <div className="text-[9px] text-pink-700 leading-snug space-y-0.5">
                  <div><span className="font-semibold">Name:</span> CORP | Generic Brochure Confirmation Email - Meta | EM | AIR</div>
                  <div><span className="font-semibold">CTA button:</span> Smart Module — URL changes per model (model-specific brochure PDF)</div>
                  <div><span className="font-semibold">Driven by:</span> Primary Interested Product Model property</div>
                  <div className="text-pink-600 italic mt-1">Hover for why this can't be done for web forms →</div>
                </div>
              </div>
            </Tip>

            <Arrow />
            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest my-1">Parallel enrollment ↓</p>
            <Arrow dashed label="simultaneously" />

            <WFNode
              name="CORP | Lead Nurture Plinko"
              type="Lead Nurture"
              typeColor={C.nurture.tag}
              borderColor={C.nurture.border}
              trigger="Exits META Product Ad Labeling."
              branchLogic={[
                "Same one-way lifecycle gate as other journeys",
                "Meta leads typically enter at Experience Matching or Configure & Build depending on campaign type",
              ]}
              sets={[
                "Lifecycle Status → appropriate stage (if not already higher)",
              ]}
              why="All three entry journeys funnel into the same Plinko workflow so lifecycle stage is always managed in one place, regardless of source."
            />
            <Arrow />

            <WFNode
              name="CORP | Dealer Distro META Lead Ad Submissions"
              type="Dealer Distro"
              typeColor={C.routing.tag}
              borderColor={C.routing.border}
              trigger="Exits META Product Ad Labeling."
              branchLogic={[
                "Dedup check: is contact currently active in CORP | Dealer Distro Handraisers?",
                "Handraisers = highest intent — Meta is equivalent intent to brochure, lower than configurator",
                "If not in Handraisers → proceed to Aimbase chain",
              ]}
              sets={[]}
              why="Dedicated routing path for Meta leads. Dedup only checks Handraisers (not Brochure) because a contact could reasonably be a Meta lead AND a brochure downloader — both are mid-funnel signals. Only suppresses if they've already been routed at the higher configurator/hand-raiser level."
            />

            <DedupeGate checks="Checks: Is this contact currently enrolled in CORP | Dealer Distro Handraisers? If yes, suppress. That workflow already routed them as a higher-intent contact. No need to re-route from a Meta lead." />
            <Arrow label="if not duplicate" />
            <div className="text-[10px] text-center font-semibold text-gray-500 mt-1">↓ Aimbase Chain (see below)</div>
          </Lane>

        </div>

        {/* ── Plinko detail ── */}
        <div className="mt-8 mb-6 border-2 border-green-300 rounded-xl bg-green-50 px-6 py-5">
          <h3 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-1">CORP | Lead Nurture Plinko — Lifecycle Stage Machine</h3>
          <p className="text-[10px] text-green-700 mb-4 leading-snug">All three journeys enroll here. Plinko is a one-directional lifecycle stage machine — contacts only ever move forward, never back. It sets the <strong>Lifecycle Status</strong> property used by all downstream nurture emails and reporting segments.</p>
          <div className="flex items-start gap-2 overflow-x-auto">
            {[
              { stage: "Inspire", desc: "Earliest awareness stage. Browsing, no specific action taken.", entry: null },
              { stage: "Experience Matching", desc: "Brochure downloaders land here. Beginning to research specific models.", entry: "Brochure" },
              { stage: "Configure & Build", desc: "Configurator submitters land here. Actively building a unit — high intent.", entry: "Configurator" },
              { stage: "Try & Buy", desc: "Ready to speak with a dealer or purchase.", entry: null },
              { stage: "Customers", desc: "Existing owners. Separate nurture track.", entry: null },
            ].map((s, i) => (
              <div key={s.stage} className="flex items-center gap-2 shrink-0">
                <Tip text={s.desc}>
                  <div className={`border-2 rounded-xl px-3 py-2.5 text-center cursor-default min-w-[120px] ${s.entry === "Brochure" ? "border-purple-400 bg-purple-50" : s.entry === "Configurator" ? "border-blue-400 bg-blue-50" : "border-green-400 bg-white"}`}>
                    <div className="text-[10px] font-bold text-gray-700">{s.stage}</div>
                    {s.entry && <div className={`text-[9px] font-semibold mt-0.5 ${s.entry === "Brochure" ? "text-purple-600" : "text-blue-600"}`}>← {s.entry} entry</div>}
                    {!s.entry && i < 4 && <div className="text-[9px] text-gray-400 mt-0.5">↓ downstream</div>}
                  </div>
                </Tip>
                {i < 4 && <div className="text-green-500 font-bold text-lg">→</div>}
              </div>
            ))}
            <div className="ml-2 flex items-center">
              <div className="text-[10px] text-green-700 border-l-2 border-green-300 pl-3 leading-snug font-medium">
                One-way gate<br />Never moves backward<br />Sets: Lifecycle Status
              </div>
            </div>
          </div>
        </div>

        {/* ── Shared Aimbase terminal ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">All 3 Dealer Distro workflows converge here</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex flex-col items-center gap-0 max-w-[500px] mx-auto">
            <WFNode
              name="CORP | Aimbase Lead Label + Webhook"
              type="Aimbase Labeling"
              typeColor={C.aimbase.tag}
              borderColor={C.aimbase.border}
              trigger="Exits any of the three Dealer Distro workflows (Handraisers, Request Brochure, or META Lead Ad Submissions), after passing the dedup gate."
              branchLogic={[
                "Branches on Primary Interested Product Model (set upstream by Product Labeling workflow)",
                "20+ branches — one per Airstream model currently in the product lineup",
                "Each branch sets Aimbase-specific fields for that exact model",
              ]}
              sets={[
                "aimbase_model_code → Aimbase's internal model identifier for the specific unit",
                "aimbase_dealer_region → geographic dealer region for routing",
                "Additional Aimbase-specific contact properties per model branch",
              ]}
              why="Aimbase has its own model codes and dealer regions that don't map 1:1 to HubSpot's model names. This workflow acts as a translation layer — converting HubSpot's 'Primary Interested Product Model' into the exact codes Aimbase needs to route the lead to the right dealer. Kept separate from the webhook so Aimbase field mapping can be updated without touching the delivery mechanism."
              width={460}
            />
            <Arrow />
            <WFNode
              name="CORP | Leads — Send to Aimbase"
              type="Aimbase Delivery"
              typeColor={C.delivery.tag}
              borderColor={C.delivery.border}
              trigger="Exits CORP | Aimbase Lead Label + Webhook — all Aimbase fields are guaranteed to be set at this point."
              branchLogic={[
                "No branching — single action workflow",
                "Fires one Make (Integromat) webhook regardless of model or source",
              ]}
              sets={[
                "Triggers Make scenario → POSTs full HubSpot contact record to Aimbase CRM API",
              ]}
              why="Deliberately kept as a single, simple workflow. If the Aimbase webhook URL ever changes, there is exactly one place to update it. If this logic were embedded inside the labeling workflow or each Dealer Distro workflow, a URL change would require updating 4+ workflows."
              width={460}
            />
            <Arrow label="Make (Integromat) webhook POST" />
            <div className="border-2 border-teal-400 rounded-xl px-8 py-4 bg-teal-50 text-center shadow-sm">
              <div className="text-sm font-bold text-teal-800">Aimbase CRM</div>
              <div className="text-[10px] text-teal-600 mt-1">Lead delivered to dealer routing system → assigned to nearest dealer</div>
            </div>
          </div>
        </div>

        {/* ── Scoring layer ── */}
        <div className="border-2 border-violet-300 rounded-xl bg-violet-50 px-6 py-5 max-w-[700px] mx-auto mb-8">
          <h3 className="text-xs font-bold text-violet-800 uppercase tracking-widest mb-1">Lead Scoring Layer — Runs in Parallel, Independent of Entry Journey</h3>
          <p className="text-[10px] text-violet-700 mb-4 leading-snug">
            These workflows fire whenever a contact&apos;s <strong>HubSpot Lead Score</strong> property changes — regardless of source. Score is calculated by HubSpot&apos;s scoring tool based on DLV-tracked behavioral signals: page visits, email engagement, form submissions, return visits, etc.
          </p>

          <div className="flex flex-col items-center gap-0">
            <WFNode
              name="CORP | Simplified Lead Scoring | General | WF | E3"
              type="Lead Scoring"
              typeColor={C.scoring.tag}
              borderColor={C.scoring.border}
              trigger="Any change to the contact's HubSpot Lead Score property — fired by HubSpot's native lead scoring engine."
              branchLogic={[
                "Score 5: Contact is a recent hand-raiser (configurator submission within recency window) — highest tier",
                "Score 4: Total lead score > 250 — high engagement",
                "Score 3: Total lead score 100–250 — moderate engagement",
                "Score 2: Total lead score 50–100 — low engagement",
                "Score 1: Total lead score < 50 — minimal signals",
                "Score inputs include: page visits (tracked via data layer / GTM DLVs), email opens/clicks, form submissions, return site visits",
              ]}
              sets={[
                "Lead Score Tier → 1, 2, 3, 4, or 5 (custom HubSpot property)",
              ]}
              why="Simplified Lead Scoring distills HubSpot's raw numeric score into a clean 1–5 tier that's easy to reference in other workflows, segments, and sales communications. The tiers are calibrated so that score 5 = someone sales should call immediately."
              width={500}
            />
            <Arrow />

            <div className="flex gap-8 items-start justify-center w-full">
              <Tip text="Score 5 contacts were already routed through Dealer Distro Handraisers when they submitted the configurator form. No additional routing needed.">
                <div className="flex flex-col items-center">
                  <div className="text-[10px] bg-violet-100 border-2 border-violet-300 rounded-lg px-3 py-2 text-violet-700 font-medium text-center cursor-default">
                    Score 5<br /><span className="text-[9px] font-normal">Already routed via<br />Dealer Distro Handraisers</span>
                  </div>
                </div>
              </Tip>

              <div className="flex flex-col items-center">
                <div className="text-[10px] bg-violet-100 border-2 border-violet-300 rounded-lg px-3 py-2 text-violet-700 font-medium text-center">
                  Scores 1–4
                </div>
                <Arrow />
                <WFNode
                  name="CORP | Dealer Distro Simplified Lead Score Change"
                  type="Dealer Distro"
                  typeColor={C.routing.tag}
                  borderColor={C.scoring.border}
                  warning="Currently OFF"
                  trigger="Contact's Lead Score Tier is set to 1, 2, 3, or 4 by the Simplified Lead Scoring workflow."
                  branchLogic={[
                    "Dedup check: is contact currently enrolled in ANY of the 3 Dealer Distro workflows?",
                    "Checks: Dealer Distro Handraisers, Dealer Distro Request Brochure, Dealer Distro META Lead Ad Submissions",
                    "If enrolled in any of the above → skip (already being routed or has been routed)",
                    "If not in any → proceed to Aimbase chain as a score-qualified lead",
                  ]}
                  sets={[]}
                  why="This is the catch-all routing path for contacts who have accumulated enough behavioral score to be dealer-ready, but never submitted a configurator form, brochure form, or Meta ad. Currently turned OFF — it would be turned ON when the team is ready to handle score-based leads in the dealer pipeline."
                  width={300}
                />
                <DedupeGate checks="Checks ALL THREE Dealer Distro workflows: Handraisers, Request Brochure, and META Lead Ad Submissions. If enrolled in any of them, suppress — they've already been or are being routed. This is the broadest dedup gate in the system." />
                <Arrow label="if not in any Dealer Distro" />
                <div className="text-[10px] text-center font-semibold text-gray-500">↓ Aimbase Chain (above)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Architecture decisions ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            {
              q: "Why use Page Referrer for brochures instead of a hidden field?",
              a: "A single contact can download 3 brochures in one session. Each form submission would overwrite the hidden field, so by the time the workflow fires, only the last model submitted would be visible. Page Referrer captures the model page URL at submission time, which is always accurate regardless of how many brochures were downloaded.",
            },
            {
              q: "Why can't the web brochure TYE email have a model-specific CTA?",
              a: "The smart module CTA is driven by Primary Interested Product Model. For Meta leads, that property is set once and is reliable. For web brochure contacts, that property reflects whichever model they downloaded last — not necessarily the one they care most about. Showing a CTA for the wrong model would be worse than a generic CTA.",
            },
            {
              q: "Why are there 3 separate Dealer Distro workflows instead of one?",
              a: "Each entry point has a different intent level and may need different delay timers, messaging, and SLA windows. Handraisers (configurator) get the fastest routing. Brochure and Meta leads may have a delay before being sent. Combining them into one workflow would make it impossible to tune these independently.",
            },
            {
              q: "Why does the Aimbase chain have two workflows instead of one?",
              a: "Separation of concerns: the labeling workflow handles the complex per-model branching logic (sets aimbase_model_code, etc.). The delivery workflow fires the webhook. If the webhook URL changes, update one workflow. If Aimbase adds a new model field, update the labeling workflow. Easier to maintain and debug.",
            },
            {
              q: "Why is the Lead Score Change Dealer Distro currently OFF?",
              a: "Score-based routing generates a larger volume of lower-intent leads. The team wanted to validate the Aimbase pipeline with higher-intent leads first (configurator, brochure, Meta) before opening the floodgates to every contact that accumulates enough behavioral score.",
            },
            {
              q: "How does the dedup gate hierarchy work across all Dealer Distro workflows?",
              a: "Priority order: Handraisers > Brochure ≈ Meta > Score-based. Lower-intent workflows check for and defer to higher-intent ones. The score-change workflow checks all three. This ensures a contact is never sent to Aimbase twice and always goes through the highest-intent routing path available.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-gray-800 mb-1.5">{q}</div>
              <div className="text-[11px] text-gray-600 leading-relaxed">{a}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
