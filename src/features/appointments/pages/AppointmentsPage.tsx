import { useNavigate } from "react-router-dom";
import { AppointmentCard } from "@/features/appointments/components/AppointmentCard";
import { Card } from "@/shared/components/Card";
import { useClinicStore } from "@/shared/store/useClinicStore";

export function AppointmentsPage() {
  const navigate = useNavigate();
  const { authUser, appointments, cancelAppointment, setRescheduleTarget } = useClinicStore();

  const userAppointments = appointments.filter(
    (appointment) => appointment.patientId === authUser?.id,
  );

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Minhas consultas</h2>
        <p className="mt-2 text-sm text-slate-500">
          Acompanhe consultas agendadas, realizadas e canceladas.
        </p>
      </Card>

      {userAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={(appointmentId) => {
            void cancelAppointment(appointmentId);
          }}
          onReschedule={(appointmentId) => {
            setRescheduleTarget(appointmentId);
            navigate("/agendar");
          }}
        />
      ))}
    </div>
  );
}
