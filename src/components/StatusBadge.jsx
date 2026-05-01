const labels = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done"
};

const classes = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {labels[status]}
    </span>
  );
}
