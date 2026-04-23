import { Card } from "@/components/ui/card";

export function MetricCard({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold text-spread-ink/60">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {caption ? <p className="mt-1 text-xs text-spread-ink/60">{caption}</p> : null}
    </Card>
  );
}
