import { ChecklistPage } from "@/components/ChecklistPage";

export default function NewFormChecklistPage() {
  return (
    <ChecklistPage
      title="New Form Checklist"
      templateCollection="new_form_checklist_template"
      checklistType="new_form"
    />
  );
}
