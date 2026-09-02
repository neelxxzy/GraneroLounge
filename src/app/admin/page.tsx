import ReportForm from "@/components/ReportForm";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lounge-accent">
          Monday Input
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide">
          New Weekly Report
        </h1>
        <p className="mt-2 text-sm text-lounge-muted">
          Enter this week&apos;s sales, stock and operational figures. The notice board updates
          automatically once published.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
