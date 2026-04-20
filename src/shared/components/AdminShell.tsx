import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserCircle2,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import { PropsWithChildren } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { useClinicStore } from "@/shared/store/useClinicStore";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, desc: "Visao geral" },
  { to: "/consultas", label: "Agenda", icon: CalendarDays, desc: "Consultas do dia" },
  { to: "/agendar", label: "Operacao", icon: ClipboardList, desc: "Gestao operacional" },
  { to: "/exames", label: "Exames", icon: FlaskConical, desc: "Resultados de exames" },
  { to: "/perfil", label: "Perfil", icon: UserCircle2, desc: "Minha conta" },
];

export function AdminShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const { theme, toggleTheme, authUser, logout } = useClinicStore();

  const initials = authUser?.fullName
    ?.split(" ")
    .filter((p) => p.length > 1)
    .slice(0, 2)
    .map((p) => p[0])
    .join("") ?? "A";

  const currentPage = adminNav.find((n) => n.to === location.pathname);

  return (
    <div className={clsx(theme === "dark" && "dark")}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
        <div className="flex min-h-screen gap-5 p-4 lg:pl-4 lg:pr-6 lg:py-6">

          {/* Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col">
            {/* Logo */}
            <div className="rounded-[28px] bg-[linear-gradient(145deg,#0f9cde,#1068b0)] px-5 py-5 shadow-card">
              <BrandLogo compact light />
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2">
                <ShieldCheck size={13} className="shrink-0 text-white/80" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">Painel Admin</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-3 flex-1 rounded-[28px] bg-white p-3 shadow-card dark:bg-slate-900">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Menu
              </p>
              <div className="space-y-1">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={clsx(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 transition-all",
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                      )}
                    >
                      <div className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800",
                      )}>
                        <Icon size={16} className={isActive ? "text-white" : "text-primary"} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">{item.label}</p>
                        <p className={clsx(
                          "mt-0.5 text-xs",
                          isActive ? "text-white/70" : "text-slate-400",
                        )}>
                          {item.desc}
                        </p>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            {/* User card */}
            <div className="mt-3 rounded-[28px] bg-white p-4 shadow-card dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {authUser?.fullName}
                  </p>
                  <p className="truncate text-xs text-slate-400">{authUser?.email}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  aria-label="Alternar tema"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => { void logout(); }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="flex min-h-screen flex-1 flex-col gap-5">
            {/* Header */}
            <header className="rounded-[28px] bg-white px-6 py-4 shadow-card dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {currentPage?.desc ?? "Medicinar Admin"}
                  </p>
                  <h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {currentPage?.label ?? "Painel"}
                  </h1>
                </div>

                {/* Mobile controls */}
                <div className="flex items-center gap-2 lg:hidden">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void logout(); }}
                    className="flex items-center gap-1.5 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                  >
                    <LogOut size={15} />
                    Sair
                  </button>
                </div>

                {/* Desktop: avatar resumido */}
                <div className="hidden items-center gap-3 lg:flex">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Administrador</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {authUser?.fullName?.split(" ")[0]}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {initials}
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 pb-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
