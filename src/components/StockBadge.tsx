import { getStockStatus } from "@/lib/calculations";
import { formatPercent } from "@/lib/calculations";

export default function StockBadge({
  label,
  result,
  category,
}: {
  label: string;
  result: number;
  category: "food" | "drink";
}) {
  const status = getStockStatus(result, category);

  const containerStyles = {
    green: "border-emerald-500/60 bg-emerald-500/10",
    amber: "border-amber-500/60 bg-amber-500/10",
    red: "border-rose-500/60 bg-rose-500/10",
  };

  const textStyles = {
    green: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-rose-500",
  };

  const badgeStyles = {
    green: "bg-emerald-500 text-slate-950",
    amber: "bg-amber-500 text-slate-950",
    red: "bg-rose-500 text-white",
  };

  const badgeLabels = {
    green: "On Target",
    amber: "Warning",
    red: "Off Target",
  };

  return (
    <div
      className={`print-avoid-break flex flex-col items-center justify-center rounded-lg border-2 px-4 py-5 text-center ${containerStyles[status]}`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
        {label}
      </span>
      <span className={`font-mono text-4xl font-bold tabular-nums ${textStyles[status]}`}>
        {formatPercent(result)}
      </span>
      <span
        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${badgeStyles[status]}`}
      >
        {badgeLabels[status]}
      </span>
    </div>
  );
}