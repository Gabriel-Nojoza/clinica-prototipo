import clsx from "clsx";

interface BrandLogoProps {
  compact?: boolean;
  light?: boolean;
}

export function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  return (
    <div className={clsx("flex items-center gap-3", compact && "gap-2")}>
      <div className="relative h-16 w-16 shrink-0">
        <div className="absolute left-0 top-6 h-8 w-8 rounded-full bg-peach/70 blur-[2px]" />
        <div className="absolute right-0 top-6 h-8 w-8 rounded-full bg-lavender/80 blur-[2px]" />
        <div className="absolute left-4 top-0 h-8 w-8 rounded-full bg-mint/80 blur-[2px]" />
        <div className="absolute left-[13px] top-[8px] h-3 w-3 rounded-full border-[5px] border-primary bg-white" />
        <div className="absolute left-[28px] top-[18px] h-[30px] w-[6px] -translate-x-1/2 rounded-full bg-primary" />
        <div className="absolute left-[10px] top-[20px] h-[24px] w-[18px] rotate-[-35deg] rounded-[20px_20px_18px_18px] border-[5px] border-primary border-r-0 border-t-[5px] bg-transparent" />
        <div className="absolute right-[10px] top-[20px] h-[24px] w-[18px] rotate-[35deg] rounded-[20px_20px_18px_18px] border-[5px] border-primary border-l-0 border-t-[5px] bg-transparent" />
        <div className="absolute left-[14px] top-[38px] h-[18px] w-[16px] rounded-bl-full border-b-[5px] border-l-[5px] border-primary" />
        <div className="absolute right-[14px] top-[38px] h-[18px] w-[16px] rounded-br-full border-b-[5px] border-r-[5px] border-primary" />
      </div>
      <div>
        <p
          className={clsx(
            "font-display text-4xl font-medium tracking-tight",
            light ? "text-white" : "text-primary",
            compact && "text-2xl",
          )}
        >
          Medicinar
        </p>
        <p
          className={clsx(
            "mt-1 text-sm tracking-[0.26em]",
            light ? "text-white/75" : "text-lavender",
            compact && "text-[10px]",
          )}
        >
          multiespecialidades
        </p>
      </div>
    </div>
  );
}
