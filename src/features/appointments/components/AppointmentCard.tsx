import { Appointment } from "@/shared/types";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { formatDateTime } from "@/shared/utils/format";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            {appointment.specialty}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {appointment.doctorName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(appointment.date, appointment.time)}
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {appointment.status === "scheduled"
            ? "Agendada"
            : appointment.status === "completed"
              ? "Realizada"
              : "Cancelada"}
        </span>
      </div>

      {appointment.status === "scheduled" ? (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onReschedule?.(appointment.id)}>
            Remarcar
          </Button>
          <Button variant="danger" onClick={() => onCancel?.(appointment.id)}>
            Cancelar
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
