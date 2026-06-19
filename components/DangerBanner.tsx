import { AlertTriangle } from "lucide-react";

export function DangerBanner({ text }: { text: string }) {
  return (
    <div className="flex gap-3 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4">
      <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
      <p className="text-sm text-red-800 font-medium">{text}</p>
    </div>
  );
}
