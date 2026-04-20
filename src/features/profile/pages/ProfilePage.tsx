import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { useClinicStore } from "@/shared/store/useClinicStore";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nome obrigatorio."),
  cpf: z.string().min(11, "CPF invalido."),
  birthDate: z.string().min(1, "Data obrigatoria."),
  phone: z.string().min(10, "Telefone invalido."),
  email: z.string().email("Email invalido."),
  address: z.string().min(8, "Endereco obrigatorio."),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { authUser, updateProfile, logout, appointments } = useClinicStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: authUser ?? undefined,
  });

  const history = appointments.filter((appointment) => appointment.patientId === authUser?.id);

  if (!authUser) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Perfil do paciente</h2>
          <p className="mt-1 text-sm text-slate-500">
            Atualize seus dados para receber notificacoes corretamente.
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (values) => {
            const result = await updateProfile({ ...authUser, ...values });
            setFeedback(result.message);
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
          <Input label="Email" error={errors.email?.message} {...register("email")} />
          <Input label="Endereco" error={errors.address?.message} {...register("address")} />
          <Button type="submit" disabled={isSubmitting}>
            Salvar perfil
          </Button>
          {feedback ? (
            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">
              {feedback}
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void logout();
            }}
          >
            Sair
          </Button>
        </form>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historico</h3>
        {history.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
          >
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.doctorName}</p>
            <p className="text-sm text-slate-500">
              {appointment.date} as {appointment.time} · {appointment.status}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
