import type { WeeklyReportDTO } from "@/lib/types";
import {
  actualLflPercent,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  salesDifference,
} from "@/lib/calculations";
import StockBadge from "./StockBadge";
import PrintButton from "./PrintButton";
import WeekSelector from "./WeekSelector";

export default function Dashboard({ report }: { report: WeeklyReportDTO }) {
  const diff = salesDifference(report.totalSales, report.previousYearSales);
  const actualLfl = actualLflPercent(report.totalSales, report.previousYearSales);
  const hitLflTarget = actualLfl >= report.lflTargetPercent;

  return (
    <div className="print-page mx-auto max-w-4xl">
      {/* Toolbar — hidden entirely when printing */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <WeekSelector currentId={report.id} />
        <PrintButton />
      </div>

      {/* ===== Notice board sheet ===== */}
      <div className="rounded-2xl border border-lounge-border bg-lounge-panel p-6 shadow-2xl print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none sm:p-8">
        {/* Header */}
        <header className="print-avoid-break mb-6 border-b-4 border-lounge-accent pb-5 print:border-black">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lounge-accent print:text-black">
                Weekly Operations Notice
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-lounge-text print:text-black sm:text-4xl">
                {report.weekRange}
              </h1>
            </div>
            <div
              className={`flex flex-col items-end rounded-xl border-2 px-5 py-3 text-right ${
                hitLflTarget
                  ? "border-lounge-good bg-lounge-good/10"
                  : "border-lounge-bad bg-lounge-bad/10"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
                LFL vs Target ({formatPercent(report.lflTargetPercent)})
              </span>
              <span
                className={`font-mono text-5xl font-bold leading-none tabular-nums ${
                  hitLflTarget ? "text-lounge-good" : "text-lounge-bad"
                }`}
              >
                {formatPercent(actualLfl)}
              </span>
            </div>
          </div>
          <p className="print-only mt-2 text-xs text-neutral-500">
            Printed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        {/* Sales breakdown */}
        <section className="print-avoid-break mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total Sales" value={formatCurrency(report.totalSales)} />
          <StatTile label="Sales Last Year" value={formatCurrency(report.previousYearSales)} />
          <StatTile
            label="Difference"
            value={formatSignedCurrency(diff)}
            valueClassName={diff >= 0 ? "text-lounge-good" : "text-lounge-bad"}
          />
          <div className="flex flex-col items-center justify-center rounded-lg border border-lounge-border bg-lounge-panel2 px-3 py-4 text-center print:border-black print:bg-white">
            <span className="text-xs font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
              NPS Score
            </span>
            <span className="font-mono text-3xl font-bold tabular-nums text-lounge-accent print:text-black">
              {report.npsScore}
              <span className="text-base text-lounge-muted print:text-neutral-500">/100</span>
            </span>
          </div>
        </section>

        {/* Quality scores */}
        <section className="print-avoid-break mb-6">
          <SectionLabel>Quality Scores</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <QualityBadge label="Food Quality" score={report.foodQualityScore} />
            <QualityBadge label="Drinks Quality" score={report.drinkQualityScore} />
          </div>
        </section>

        {/* Stock variance */}
        <section className="print-avoid-break mb-6">
          <SectionLabel>Stock Variance</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <StockBadge
              label="Food Stock Result"
              result={report.foodStockResult}
              category="food"
            />
            <StockBadge
              label="Drink Stock Result"
              result={report.drinkStockResult}
              category="drink"
            />
          </div>
        </section>

        {/* Focus grids */}
        <section className="print-avoid-break mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FocusCard title="BOH Focus" items={report.bohFocus} accent="border-lounge-accent" />
          <FocusCard title="FOH Focus" items={report.fohFocus} accent="border-lounge-good" />
        </section>

        {/* DOTW / BOTW */}
        <section className="print-avoid-break mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SpecialCard label="Dish of the Week" value={report.dotw} />
          <SpecialCard label="Beverage of the Week" value={report.botw} />
        </section>

        {/* Need to know */}
        <section className="print-avoid-break rounded-xl border-2 border-lounge-accent bg-lounge-accent/10 p-5 print:border-black print:bg-neutral-100">
          <SectionLabel>Need to Know</SectionLabel>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-lounge-text print:text-black">
            {report.needToKnow}
          </p>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-lounge-muted print:text-neutral-700">
      {children}
    </h2>
  );
}

function StatTile({
  label,
  value,
  valueClassName = "text-lounge-text print:text-black",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-lounge-border bg-lounge-panel2 px-3 py-4 text-center print:border-black print:bg-white">
      <span className="text-xs font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
        {label}
      </span>
      <span className={`font-mono text-2xl font-bold tabular-nums ${valueClassName}`}>{value}</span>
    </div>
  );
}

function QualityBadge({ label, score }: { label: string; score: number }) {
  const good = score >= 4;
  return (
    <div
      className={`print-avoid-break flex flex-col items-center justify-center rounded-lg border-2 px-4 py-5 text-center print:bg-white ${
        good ? "border-lounge-good/60 bg-lounge-good/10" : "border-lounge-bad/60 bg-lounge-bad/10"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
        {label}
      </span>
      <span
        className={`font-mono text-4xl font-bold tabular-nums ${good ? "text-lounge-good" : "text-lounge-bad"}`}
      >
        {score.toFixed(2)}
        <span className="text-lg text-lounge-muted print:text-neutral-500">/5</span>
      </span>
    </div>
  );
}

function FocusCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className={`rounded-xl border-l-4 ${accent} border-y border-r border-lounge-border bg-lounge-panel2 p-4 print:border-black print:bg-white`}>
      <SectionLabel>{title}</SectionLabel>
      {items.length > 0 ? (
        <ul className="space-y-1.5 text-sm text-lounge-text print:text-black">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lounge-accent print:bg-black" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-lounge-muted">No items listed.</p>
      )}
    </div>
  );
}

function SpecialCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-lounge-border bg-gradient-to-br from-lounge-panel2 to-lounge-panel p-4 print:border-black print:bg-none print:bg-white">
      <span className="text-xs font-semibold uppercase tracking-widest text-lounge-muted print:text-neutral-600">
        {label}
      </span>
      <p className="mt-1 font-display text-xl font-semibold text-lounge-accent print:text-black">{value}</p>
    </div>
  );
}
