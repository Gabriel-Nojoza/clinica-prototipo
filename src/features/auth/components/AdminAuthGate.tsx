import { PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { useClinicStore } from "@/shared/store/useClinicStore";
import { loginSchema, LoginForm } from "@/features/auth/schemas/authSchema";

export function AdminAuthGate({ children }: PropsWithChildren) {
  const {
    authUser,
    login,
    initializeAuth,
    applyAuthSession,
    isAuthReady,
    isBootstrapping,
    configurationError,
  } = useClinicStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    void initializeAuth();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAuthSession(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyAuthSession, initializeAuth]);

  if (configurationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <Card className="w-full max-w-sm space-y-4">
          <BrandLogo />
          <p className="text-sm text-slate-500">{configurationError}</p>
        </Card>
      </div>
    );
  }

  if (!isAuthReady || isBootstrapping) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (authUser?.role === "admin") {
    return <>{children}</>;
  }

  if (authUser && authUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <Card className="w-full max-w-sm space-y-4">
          <BrandLogo />
          <p className="text-sm font-semibold text-red-500">Acesso negado.</p>
          <p className="text-sm text-slate-500">
            Esta area e restrita a administradores da clinica.
          </p>
          <Button
            variant="secondary"
            onClick={async () => {
              if (supabase) await supabase.auth.signOut();
            }}
          >
            Sair
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-sm rounded-[28px] border border-slate-800 bg-slate-900/95 shadow-card backdrop-blur">
        <div className="space-y-3 rounded-[24px] bg-slate-800/50 p-4">
          <BrandLogo />
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2">
            <ShieldCheck size={14} className="shrink-0 text-primary" />
            <p className="text-xs font-semibold text-primary">Acesso administrativo</p>
          </div>
          <p className="text-sm text-slate-400">
            Entre com suas credenciais de administrador para acessar o painel de controle.
          </p>
        </div>

        {feedback ? (
          <p className="mt-4 rounded-2xl bg-red-950 px-4 py-3 text-sm text-red-300">
            {feedback}
          </p>
        ) : null}

        <form
          className="mt-6 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            const result = await login(values.email, values.password);
            if (!result.success) {
              setFeedback(result.message);
            } else {
              setFeedback(null);
            }
          })}
        >
          <Input
            label="Email do administrador"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verificando..." : "Entrar no painel"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
