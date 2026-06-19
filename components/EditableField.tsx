"use client";

interface Props {
  label: string;
  value: string | null;
  editing: boolean;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "url" | "date";
  placeholder?: string;
}

export function EditableField({ label, value, editing, onChange, type = "text", placeholder }: Props) {
  if (editing) {
    if (type === "textarea") {
      return (
        <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
          <label className="text-sm font-medium text-gray-500 self-start pt-1">{label}</label>
          <div className="col-span-2">
            <textarea
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
        <label className="text-sm font-medium text-gray-500 self-start pt-1">{label}</label>
        <div className="col-span-2">
          <input
            type={type}
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">
        {value || <span className="text-gray-400 italic">—</span>}
      </dd>
    </div>
  );
}
