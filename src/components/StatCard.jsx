export default function StatCard({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-ink",
    success: "border-emerald-200 bg-emerald-50 text-success",
    warning: "border-amber-200 bg-amber-50 text-warning",
    danger: "border-orange-200 bg-orange-50 text-danger"
  };

  return (
    <section className={`rounded-lg border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </section>
  );
}
