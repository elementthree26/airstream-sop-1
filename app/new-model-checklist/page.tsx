import { ChecklistPage } from "@/components/ChecklistPage";

export default function NewModelChecklistPage() {
  return (
    <ChecklistPage
      title="New Model Checklist"
      templateCollection="new_model_checklist_template"
      checklistType="new_model"
    />
  );
}
