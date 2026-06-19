"use client";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, onAdd, addLabel = "Add New", actions }: Props) {
  const { data: session } = useSession();
  const canEdit = session?.user?.isCollaborator;

  return (
    <div className="flex items-start justify-between px-8 py-6 border-b">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onAdd && canEdit && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={16} />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
