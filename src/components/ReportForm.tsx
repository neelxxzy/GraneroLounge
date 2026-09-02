"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualLflPercent,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatWeekRange,
  getNextMonday,
  salesDifference,
  toDateInputValue,
} from "@/lib/calculations";
import type { WeeklyReportDTO } from "@/lib/types";

type FormState = {
  weekStart: string; // yyyy-mm-dd, drives the auto-generated weekRange
  weekRange: string;
  weekRangeManual: boolean; // true once the manager has hand-edited the text
  totalSales: string;
  previousYearSales: string;
  lflTargetPercent: string;
  foodStockResult: string;
  foodStockThreshold: string;
  drinkStockResult: string;
  drinkStockThreshold: string;
  npsScore: string;
  foodQualityScore: string;
  drinkQualityScore: string;
  needToKnow: string;
  dotw: string;
  botw: string;
  bohFocus: string[];
  fohFocus: string[];
};

const FOOD_PRESET = "1.0";
const DRINK_PRESET = "0.6";

function buildInitialState(): FormState {
  const monday = getNextMonday();
  return {
    weekStart: toDateInputValue(monday),
    weekRange: formatWeekRange(monday),
    weekRangeManual: false,
    totalSales: "",
    previousYearSales: "",
    lflTargetPercent: "4.5",
    foodStockResult: "",
    foodStockThreshold: FOOD_PRESET,
    drinkStockResult: "",
    drinkStockThreshold: DRINK_PRESET,
    npsScore: "",
    foodQualityScore: "",
    drinkQualityScore: "",
    needToKnow: "",
    dotw: "",
    botw: "",
    bohFocus: [""],
    fohFocus: [""],
  };
}

export default function ReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(buildInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // On first load, look up the most recent report and default the week
  // picker to the Monday right after it ends, so managers never have to
  // type the date range by hand. Falls back to "next Monday from today"
  // if there's no prior report or its date can't be used.
  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((reports: WeeklyReportDTO[]) => {
        const latest = reports[0];
        if (!latest?.weekStart) return;
        const previousMonday = new Date(latest.weekStart);
        if (Number.isNaN(previousMonday.getTime())) return;
        const suggested = new Date(previousMonday);
        suggested.setDate(suggested.getDate() + 7);
        setForm((prev) =>
          prev.weekRangeManual
            ? prev
            : {
                ...prev,
                weekStart: toDateInputValue(suggested),
                weekRange: formatWeekRange(suggested),
              }
        );
      })
      .catch(() => {
        /* no prior reports yet — keep the "next Monday from today" default */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleWeekStartChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, weekStart: value };
      if (!prev.weekRangeManual && value) {
        const [y, m, d] = value.split("-").map(Number);
        next.weekRange = formatWeekRange(new Date(y, m - 1, d));
      }
      return next;
    });
  }

  function updateListItem(key: "bohFocus" | "fohFocus", index: number, value: string) {
    setForm((prev) => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  }

  function addListItem(key: "bohFocus" | "fohFocus") {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  }

  function removeListItem(key: "bohFocus" | "fohFocus", index: number) {
    setForm((prev) => {
      const list = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: list.length > 0 ? list : [""] };
    });
  }

  // Live preview stats
  const totalSalesNum = parseFloat(form.totalSales) || 0;
  const previousYearSalesNum = parseFloat(form.previousYearSales) || 0;
  const diff = useMemo(
    () => salesDifference(totalSalesNum, previousYearSalesNum),
    [totalSalesNum, previousYearSalesNum]
  );
  const actualLfl = useMemo(
    () => actualLflPercent(totalSalesNum, previousYearSalesNum),
    [totalSalesNum, previousYearSalesNum]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.weekRange.trim()) return setError("Week range is required.");
    if (!form.dotw.trim()) return setError("Dish of the Week is required.");
    if (!form.botw.trim()) return setError("Beverage of the Week is required.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: form.weekRange,
          weekStart: form.weekStart || null,
          totalSales: parseFloat(form.totalSales) || 0,
          previousYearSales: parseFloat(form.previousYearSales) || 0,
          lflTargetPercent: parseFloat(form.lflTargetPercent) || 0,
          foodStockResult: parseFloat(form.foodStockResult) || 0,
          foodStockThreshold: parseFloat(form.foodStockThreshold) || 1.0,
          drinkStockResult: parseFloat(form.drinkStockResult) || 0,
          drinkStockThreshold: parseFloat(form.drinkStockThreshold) || 0.6,
          npsScore: parseInt(form.npsScore, 10) || 0,
          foodQualityScore: parseFloat(form.foodQualityScore) || 0,
          drinkQualityScore: parseFloat(form.drinkQualityScore) || 0,
          needToKnow: form.needToKnow,
          dotw: form.dotw,
          botw: form.botw,
          bohFocus: form.bohFocus,
          fohFocus: form.fohFocus,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save report");
      }

      const created = await res.json();
      router.push(`/?id=${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-lounge-bad bg-lounge-bad/10 px-4 py-3 text-sm text-lounge-bad">
          {error}
        </div>
      )}

      {/* Week + Sales */}
      <FormSection title="Week & Sales">
        <Field label="Week Starting (Monday)" hint="Auto-suggested from last week's report">
          <input
            type="date"
            value={form.weekStart}
            onChange={(e) => handleWeekStartChange(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Week Range Label"
          hint={
            form.weekRangeManual
              ? "Editing manually — won't update if you change the date above"
              : "Auto-generated from the date above"
          }
        >
          <div className="flex gap-2">
            <input
              type="text"
              required
              readOnly={!form.weekRangeManual}
              value={form.weekRange}
              onChange={(e) => update("weekRange", e.target.value)}
              placeholder="3rd - 9th August 2026"
              className={`${inputClass} ${!form.weekRangeManual ? "cursor-not-allowed opacity-80" : ""}`}
            />
            <button
              type="button"
              onClick={() =>
                setForm((prev) => {
                  if (prev.weekRangeManual) {
                    // Switching back to Auto: recompute the label from the current date.
                    const [y, m, d] = prev.weekStart.split("-").map(Number);
                    const recomputed =
                      prev.weekStart && !Number.isNaN(y)
                        ? formatWeekRange(new Date(y, m - 1, d))
                        : prev.weekRange;
                    return { ...prev, weekRangeManual: false, weekRange: recomputed };
                  }
                  return { ...prev, weekRangeManual: true };
                })
              }
              className="shrink-0 rounded-md border border-lounge-border px-2.5 text-[11px] font-semibold text-lounge-muted transition hover:border-lounge-accent hover:text-lounge-accent"
            >
              {form.weekRangeManual ? "Auto" : "Edit"}
            </button>
          </div>
        </Field>

        <Field label="Total Sales (£)">
          <input
            type="number"
            step="0.01"
            required
            value={form.totalSales}
            onChange={(e) => update("totalSales", e.target.value)}
            placeholder="26500"
            className={inputClass}
          />
        </Field>

        <Field label="Sales Last Year (£)">
          <input
            type="number"
            step="0.01"
            required
            value={form.previousYearSales}
            onChange={(e) => update("previousYearSales", e.target.value)}
            placeholder="20868"
            className={inputClass}
          />
        </Field>

        <Field label="LFL Target %">
          <input
            type="number"
            step="0.01"
            value={form.lflTargetPercent}
            onChange={(e) => update("lflTargetPercent", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="NPS Score (0-100)">
          <input
            type="number"
            min={0}
            max={100}
            required
            value={form.npsScore}
            onChange={(e) => update("npsScore", e.target.value)}
            placeholder="89"
            className={inputClass}
          />
        </Field>

        <Field label="Food Quality Score (out of 5)">
          <input
            type="number"
            min={0}
            max={5}
            step="0.01"
            required
            value={form.foodQualityScore}
            onChange={(e) => update("foodQualityScore", e.target.value)}
            placeholder="4.56"
            className={inputClass}
          />
        </Field>

        <Field label="Drinks Quality Score (out of 5)">
          <input
            type="number"
            min={0}
            max={5}
            step="0.01"
            required
            value={form.drinkQualityScore}
            onChange={(e) => update("drinkQualityScore", e.target.value)}
            placeholder="4.32"
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* Live preview */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-lounge-border bg-lounge-panel2 p-4 sm:grid-cols-2">
        <PreviewStat
          label="Sales Difference (live)"
          value={formatSignedCurrency(diff)}
          positive={diff >= 0}
        />
        <PreviewStat
          label="Actual LFL % (live)"
          value={formatPercent(actualLfl)}
          positive={actualLfl >= (parseFloat(form.lflTargetPercent) || 0)}
        />
      </div>
      {(totalSalesNum > 0 || previousYearSalesNum > 0) && (
        <p className="-mt-4 text-xs text-lounge-muted">
          {formatCurrency(totalSalesNum)} vs {formatCurrency(previousYearSalesNum)} last year
        </p>
      )}

      {/* Stock */}
      <FormSection title="Stock Variance">
        <Field label="Food Stock Result (%)">
          <input
            type="number"
            step="0.01"
            required
            value={form.foodStockResult}
            onChange={(e) => update("foodStockResult", e.target.value)}
            placeholder="0.35"
            className={inputClass}
          />
        </Field>
        <div>
          <Field label="Food Stock Threshold (%)">
            <input
              type="number"
              step="0.01"
              value={form.foodStockThreshold}
              onChange={(e) => update("foodStockThreshold", e.target.value)}
              className={inputClass}
            />
          </Field>
          <PresetButton onClick={() => update("foodStockThreshold", FOOD_PRESET)} value={FOOD_PRESET} />
        </div>

        <Field label="Drink Stock Result (%)">
          <input
            type="number"
            step="0.01"
            required
            value={form.drinkStockResult}
            onChange={(e) => update("drinkStockResult", e.target.value)}
            placeholder="0.33"
            className={inputClass}
          />
        </Field>
        <div>
          <Field label="Drink Stock Threshold (%)">
            <input
              type="number"
              step="0.01"
              value={form.drinkStockThreshold}
              onChange={(e) => update("drinkStockThreshold", e.target.value)}
              className={inputClass}
            />
          </Field>
          <PresetButton onClick={() => update("drinkStockThreshold", DRINK_PRESET)} value={DRINK_PRESET} />
        </div>
      </FormSection>

      {/* Specials */}
      <FormSection title="Specials of the Week">
        <Field label="Dish of the Week (DOTW)">
          <input
            type="text"
            required
            value={form.dotw}
            onChange={(e) => update("dotw", e.target.value)}
            placeholder="Dan Dan Noodles"
            className={inputClass}
          />
        </Field>
        <Field label="Beverage of the Week (BOTW)">
          <input
            type="text"
            required
            value={form.botw}
            onChange={(e) => update("botw", e.target.value)}
            placeholder="Pina Nolada"
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* Focus lists */}
      <FormSection title="Focus Items">
        <div className="sm:col-span-1">
          <FocusListEditor
            label="BOH Focus"
            items={form.bohFocus}
            onChange={(i, v) => updateListItem("bohFocus", i, v)}
            onAdd={() => addListItem("bohFocus")}
            onRemove={(i) => removeListItem("bohFocus", i)}
          />
        </div>
        <div className="sm:col-span-1">
          <FocusListEditor
            label="FOH Focus"
            items={form.fohFocus}
            onChange={(i, v) => updateListItem("fohFocus", i, v)}
            onAdd={() => addListItem("fohFocus")}
            onRemove={(i) => removeListItem("fohFocus", i)}
          />
        </div>
      </FormSection>

      {/* Need to know */}
      <FormSection title="Announcements">
        <Field label="Need to Know" full>
          <textarea
            rows={4}
            value={form.needToKnow}
            onChange={(e) => update("needToKnow", e.target.value)}
            placeholder="This month lounge's big focus is milk quality..."
            className={inputClass}
          />
        </Field>
      </FormSection>

      <div className="flex justify-end gap-3 border-t border-lounge-border pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-lounge-accent px-6 py-2.5 font-display font-semibold uppercase tracking-wide text-lounge-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Publish Weekly Notice"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-lounge-border bg-lounge-panel px-3 py-2 text-sm text-lounge-text placeholder:text-lounge-muted/60 focus:border-lounge-accent focus:outline-none focus:ring-1 focus:ring-lounge-accent";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-lounge-border bg-lounge-panel p-5">
      <legend className="px-1 font-display text-sm font-semibold uppercase tracking-widest text-lounge-accent">
        {title}
      </legend>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-lounge-muted/70">{hint}</span>}
    </label>
  );
}

function PreviewStat({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-lounge-panel px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">{label}</span>
      <span className={`font-mono text-lg font-bold tabular-nums ${positive ? "text-lounge-good" : "text-lounge-bad"}`}>
        {value}
      </span>
    </div>
  );
}

function PresetButton({ onClick, value }: { onClick: () => void; value: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 rounded-md border border-lounge-border px-2.5 py-1 text-[11px] font-semibold text-lounge-muted transition hover:border-lounge-accent hover:text-lounge-accent"
    >
      Use standard preset ({value}%)
    </button>
  );
}

function FocusListEditor({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={`${label} item`}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${label} item ${i + 1}`}
              className="rounded-md border border-lounge-border px-2 text-lounge-muted transition hover:border-lounge-bad hover:text-lounge-bad"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 self-start text-xs font-semibold text-lounge-accent hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}
