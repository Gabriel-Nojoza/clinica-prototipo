import { BellRing, CalendarCheck2, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { useClinicStore } from "@/shared/store/useClinicStore";

const highlights = [
  {
    icon: CalendarCheck2,
    title: "Agendamento em poucos toques",
    description: "Fluxo em etapas com foco em telas pequenas e pouca friccao.",
  },
  {
    icon: BellRing,
    title: "Lembretes automatizados",
    description: "Confirme por email e SMS, incluindo alertas 24h antes da consulta.",
  },
  {
    icon: ShieldCheck,
    title: "Cadastro seguro",
    description: "Validacao com formularios acessiveis e dados organizados por perfil.",
  },
];

export function HomePage() {
  const { authUser, appointments } = useClinicStore();
  const nextAppointment = appointments.find(
    (appointment) =>
      appointment.patientId === authUser?.id && appointment.status === "scheduled",
  );

  return (
    <div className="space-y-4">
      <Card className="space-y-3 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(158,220,199,0.18),rgba(201,194,236,0.18))] dark:bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,1))]">
        <p className="text-sm font-semibold text-primary">Proxima etapa</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {nextAppointment ? "Sua proxima consulta ja esta reservada" : "Vamos marcar sua consulta"}
        </h2>
        <p className="text-sm text-slate-500">
          {nextAppointment
            ? `${nextAppointment.doctorName} em ${nextAppointment.date} as ${nextAppointment.time}.`
            : "Escolha especialidade, data e horario com confirmacao instantanea."}
        </p>
      </Card>

      {highlights.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="flex gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-primary dark:bg-slate-800">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
