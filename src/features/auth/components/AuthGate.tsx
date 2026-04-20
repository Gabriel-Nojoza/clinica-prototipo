import { PropsWithChildren, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { useClinicStore } from "@/shared/store/useClinicStore";
import {
  loginSchema,
  LoginForm,
  patientRegistrationSchema,
  PatientRegistrationForm,
} from "@/features/auth/schemas/authSchema";

export function AuthGate({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const {
    authUser,
    login,
    registerPatient,
    initializeAuth,
    applyAuthSession,
    isAuthReady,
    isBootstrapping,
    configurationError,
  } = useClinicStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    reset: resetLoginForm,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register,
    handleSubmit: handleRegister,
    reset: resetRegisterForm,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegistrationForm>({
    resolver: zodResolver(patientRegistrationSchema),
  });

  useEffect(() => {
    void initializeAuth();

    if (!supabase) {
      return;
    }

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
      <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-10">
        <Card className="w-full max-w-md rounded-[28px] space-y-4">
          <BrandLogo />
          <p className="text-sm text-slate-600 dark:text-slate-300">{configurationError}</p>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env`.
          </div>
        </Card>
      </div>
    );
  }

  if (authUser) {
    return <>{children}</>;
  }

  if (!isAuthReady || isBootstrapping) {
    return <div className="min-h-screen bg-hero-glow" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-4 py-10">
      <Card className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/95 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(245,181,167,0.16),rgba(158,220,199,0.16),rgba(201,194,236,0.16))] p-4">
          <BrandLogo />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Acesse sua area para agendar, acompanhar consultas e receber notificacoes.
          </p>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
              mode === "login"
                ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white"
                : "text-slate-500"
            }`}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
              mode === "register"
                ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white"
                : "text-slate-500"
            }`}
            onClick={() => setMode("register")}
          >
            Cadastrar
          </button>
        </div>

        {feedback ? (
          <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">
            {feedback}
          </p>
        ) : null}

        {mode === "login" ? (
          <form
            className="mt-6 space-y-3"
            onSubmit={handleLogin(async (values) => {
              const result = await login(values.email, values.password);
              setFeedback(result.message);
              setPendingConfirmationEmail(
                result.message.toLowerCase().includes("confirm")
                  ? values.email.trim().toLowerCase()
                  : null,
              );

              if (result.success) {
                navigate("/", { replace: true });
              }
            })}
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={loginErrors.email?.message}
              {...registerLogin("email")}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              error={loginErrors.password?.message}
              {...registerLogin("password")}
            />
            <Button type="submit" disabled={isLoginSubmitting}>
              Entrar
            </Button>
            {pendingConfirmationEmail ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isResendingConfirmation}
                onClick={async () => {
                  if (!supabase || !pendingConfirmationEmail) {
                    return;
                  }

                  try {
                    setIsResendingConfirmation(true);
                    const { error } = await supabase.auth.resend({
                      type: "signup",
                      email: pendingConfirmationEmail,
                    });

                    setFeedback(
                      error
                        ? error.message
                        : "Reenviamos o email de confirmacao. Verifique sua caixa de entrada e spam.",
                    );
                  } finally {
                    setIsResendingConfirmation(false);
                  }
                }}
              >
                {isResendingConfirmation ? "Reenviando confirmacao..." : "Reenviar email de confirmacao"}
              </Button>
            ) : null}
          </form>
        ) : (
          <form
            className="mt-6 space-y-3"
            onSubmit={handleRegister(async (values) => {
              const result = await registerPatient(
                {
                  id: "",
                  role: "patient",
                  fullName: values.fullName,
                  cpf: values.cpf,
                  birthDate: values.birthDate,
                  phone: values.phone,
                  email: values.email,
                  address: values.address,
                },
                values.password,
              );
              setFeedback(result.message);

              if (result.success) {
                resetRegisterForm();

                if (authUser) {
                  navigate("/", { replace: true });
                } else {
                  setMode("login");
                  setPendingConfirmationEmail(values.email.trim().toLowerCase());
                  resetLoginForm({
                    email: values.email.trim().toLowerCase(),
                    password: "",
                  });
                }
              }
            })}
          >
            <Input label="Nome completo" error={errors.fullName?.message} {...register("fullName")} />
            <Input label="CPF" error={errors.cpf?.message} {...register("cpf")} />
            <Input
              label="Data de nascimento"
              type="date"
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />
            <Input label="Telefone" error={errors.phone?.message} {...register("phone")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="Endereco" error={errors.address?.message} {...register("address")} />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" disabled={isSubmitting}>
              Criar conta
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
