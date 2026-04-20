import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, CalendarClock, FileWarning, Stethoscope, Users } from "lucide-react";
import { z } from "zod";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useClinicStore } from "@/shared/store/useClinicStore";
import { formatDate } from "@/shared/utils/format";

const doctorSchema = z.object({
  name: z.string().min(3, "Nome do medico obrigatorio."),
  specialty: z.string().min(3, "Especialidade obrigatoria."),
});

type DoctorForm = z.infer<typeof doctorSchema>;

const metricIcons = [Users, Stethoscope, CalendarClock, FileWarning];

export function AdminPage() {
  const { authUser, doctors, addDoctor, appointments, exams } = useClinicStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  const today = new Date().toISOString().slice(0, 10);
  const scheduledAppointments = appointments.filter((appointment) => appointment.status === "scheduled");
  const todayAppointments = scheduledAppointments.filter(
    (appointment) => appointment.date === today,
  );
  const pendingExams = exams.filter((exam) => exam.resultStatus === "processing");

  const metrics = useMemo(
    () => [
      {
        label: "Pacientes ativos",
        value: new Set(appointments.map((appointment) => appointment.patientId)).size,
      },
      {
        label: "Medicos",
        value: doctors.length,
      },
      {
        label: "Consultas hoje",
        value: todayAppointments.length,
      },
      {
        label: "Exames pendentes",
        value: pendingExams.length,
      },
    ],
    [appointments, doctors.length, pendingExams.length, todayAppointments.length],
  );

  if (authUser?.role !== "admin") {
    return (
      <Card>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Acesso restrito</h2>
        <p className="mt-2 text-sm text-slate-500">
          Esta area e destinada a recepcao e administracao da clinica.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metricIcons[index];
          return (
            <Card key={metric.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {metric.label}
                </span>
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Grid principal */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-5">
          <Card className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Adicionar medico</h3>
              <p className="mt-0.5 text-sm text-slate-500">Cadastre novos profissionais na agenda.</p>
            </div>
            <form
              className="space-y-3"
              onSubmit={handleSubmit(async (values) => {
                const result = await addDoctor(values);
                setFeedback(result.message);
                if (result.success) reset();
              })}
            >
              <Input label="Nome do medico" error={errors.name?.message} {...register("name")} />
              <Input
                label="Especialidade"
                error={errors.specialty?.message}
                {...register("specialty")}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Adicionar medico"}
              </Button>
              {feedback ? (
                <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">
                  {feedback}
                </p>
              ) : null}
            </form>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Equipe medica</h3>
            {doctors.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum medico cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {doctor.name.split(" ").find((p, i) => i > 0 && p.length > 2)?.charAt(0) ?? doctor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{doctor.name}</p>
                      <p className="text-xs text-slate-500">{doctor.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Agenda de hoje</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800">
                {formatDate(today)}
              </span>
            </div>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma consulta agendada para hoje.</p>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {appointment.doctorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {appointment.time} · {appointment.specialty}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {appointment.patientName || appointment.patientId.slice(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Exames pendentes</h3>
              <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                <Activity size={11} />
                {pendingExams.length} aguardando
              </div>
            </div>
            {pendingExams.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum exame pendente no momento.</p>
            ) : (
              <div className="space-y-2">
                {pendingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{exam.examName}</p>
                    <p className="text-xs text-slate-500">
                      {exam.patientName || exam.patientId.slice(0, 8)} · {exam.requestedBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
