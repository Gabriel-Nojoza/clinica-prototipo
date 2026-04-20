import { Moon, Sun } from "lucide-react";
import { PropsWithChildren } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { useClinicStore } from "@/shared/store/useClinicStore";
import clsx from "clsx";

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const { theme, toggleTheme, authUser } = useClinicStore();
  const tabs = [
    { to: "/", label: "Comecar" },
    { to: "/agendar", label: "Agendar" },
    { to: "/consultas", label: "Consultas" },
    { to: "/exames", label: "Exames" },
    { to: "/perfil", label: "Perfil" },
  ];

  return (
    <div className={clsx(theme === "dark" && "dark")}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface dark:bg-slate-950">
        <header className="relative overflow-hidden bg-hero-glow px-5 pb-10 pt-6 text-white shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(201,194,236,0.38),transparent_24%),radial-gradient(circle_at_16%_30%,rgba(245,181,167,0.28),transparent_20%)]" />
          <div className="relative flex items-start justify-between">
            <div>
              <BrandLogo compact light />
              <h1 className="mt-4 font-display text-3xl font-bold">
                Saude com acolhimento e agenda no seu ritmo
              </h1>
              <p className="mt-2 max-w-xs text-sm text-white/80">
                Ola, {authUser?.fullName.split(" ")[0]}. Vamos organizar seu atendimento.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full bg-white/15 p-3 backdrop-blur"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="relative -mt-6 flex-1 rounded-t-[28px] bg-surface px-4 pb-24 pt-5 dark:bg-slate-950">
          {children}
        </main>

        <nav className="fixed bottom-4 left-1/2 z-10 grid w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 grid-cols-5 items-center gap-1 rounded-full border border-white/30 bg-[linear-gradient(135deg,rgba(25,153,221,0.96),rgba(117,207,228,0.92))] px-2 py-2 text-white shadow-2xl backdrop-blur dark:bg-[linear-gradient(135deg,rgba(17,119,187,0.95),rgba(93,122,212,0.9))]">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={clsx(
                  "rounded-full px-2 py-3 text-center text-[12px] font-semibold transition",
                  isActive ? "bg-white text-primary" : "text-white/76",
                )}
              >
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
