import { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <input
        ref={ref}
        className={clsx(
          "min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
});
