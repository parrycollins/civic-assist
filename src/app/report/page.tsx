import { ReportForm } from "@/components/report/ReportForm";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="font-heading text-2xl font-semibold">Report a civic problem</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Describe the problem, not yourself. CivicGH publishes the issue location at street / area level.
      </p>
      <ReportForm />
    </div>
  );
}
