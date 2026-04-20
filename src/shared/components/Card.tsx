import { PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps {
  className?: string;
}

export function Card({ children, className }: PropsWithChildren<CardProps>) {
  return (
    <section
      className={clsx(
        "rounded-[24px] bg-white p-4 shadow-card dark:bg-slate-900",
        className,
      )}
    >
      {children}
    </section>
  );
}
