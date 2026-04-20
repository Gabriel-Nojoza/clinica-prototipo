import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = true,
  className,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-950",
        {
          "bg-primary text-white hover:bg-teal-700 focus:ring-primary": variant === "primary",
          "bg-white text-slate-900 shadow-card hover:bg-slate-50 focus:ring-slate-300 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800":
            variant === "secondary",
          "bg-transparent text-slate-700 hover:bg-slate-200 focus:ring-slate-300 dark:text-slate-200 dark:hover:bg-slate-800":
            variant === "ghost",
          "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500": variant === "danger",
        },
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
