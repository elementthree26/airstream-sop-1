export type WorkflowCategory = "Lead Labeling" | "Lead Nurturing" | "Lead Routing" | "Lead Scoring";
export type InitiativeType = "CORP" | "AMP" | "Promo" | "ASC" | "Report";
export type ProductCategory = "TT" | "TC" | "Both" | "General";
export type AssetType = "EM" | "WF" | "List" | "Form" | "CTA" | "Landing Page" | "Campaign";
export type Creator = "E3" | "Airstream" | "Red Tag";
export type FolderCategory = "Model Brochures" | "Guides" | "Other";
export type ChecklistType = "new_form" | "new_model";

export interface Workflow {
  id: string;
  name: string;
  folder: string;
  initiative_type: InitiativeType;
  product_category: ProductCategory;
  asset_type: AssetType;
  creator: Creator;
  workflow_category: WorkflowCategory;
  trigger_description: string;
  what_it_does: string;
  enrollment_criteria: string;
  owner: string | null;
  hubspot_url: string | null;
  last_verified_date: string | null;
  danger_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  name: string;
  folder_category: FolderCategory;
  product_category: ProductCategory;
  hubspot_url: string | null;
  connected_workflows: string[];
  hidden_fields: string[];
  notes: string | null;
  last_verified_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadScoring {
  id: string;
  scoring_group: string;
  action_description: string;
  points: number | null;
  group_cap: number | null;
  decay_rule: string | null;
  velocity_rule: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NamingConvention {
  id: string;
  initiative_type: InitiativeType;
  product_category: ProductCategory;
  asset_type: AssetType;
  creator: Creator;
  example: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplateItem {
  id: string;
  section: string;
  sort_order: number;
  item_description: string;
  workflow_reference: string | null;
  danger_note: string | null;
  notes: string | null;
}

export interface ChecklistInstanceItem {
  checklist_item_id: string;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface ChecklistInstance {
  id: string;
  checklist_type: ChecklistType;
  label: string;
  created_at: string;
  created_by: string;
  items: ChecklistInstanceItem[];
}

export interface HygieneItem {
  id: string;
  sort_order: number;
  item_description: string;
  notes: string | null;
}

export interface HygieneChecklist {
  last_completed_date: string | null;
  items: HygieneItem[];
}
