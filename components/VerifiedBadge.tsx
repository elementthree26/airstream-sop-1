import { differenceInDays, parseISO } from "date-fns";

export function VerifiedBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-gray-400 text-xs">—</span>;

  const days = differenceInDays(new Date(), parseISO(date));
  const formatted = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let cls = "";
  if (days < 90) cls = "bg-green-100 text-green-800";
  else if (days < 180) cls = "bg-yellow-100 text-yellow-800";
  else cls = "bg-red-100 text-red-800";

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${cls}`}>
      {formatted}
    </span>
  );
}
