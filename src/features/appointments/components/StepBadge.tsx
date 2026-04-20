interface StepBadgeProps {
  current: boolean;
  label: string;
  index: number;
}

export function StepBadge({ current, label, index }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          current ? "bg-primary text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
        }`}
      >
        {index}
      </div>
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}
