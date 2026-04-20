import { CalendarDays, Clock3, Stethoscope } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { StepBadge } from "@/features/appointments/components/StepBadge";
import { useAppointment } from "@/features/appointments/hooks/useAppointment";
import { formatDate } from "@/shared/utils/format";

export function BookingPage() {
  const {
    bookingStep,
    bookingDraft,
    doctors,
    selectedDoctor,
    availableSlots,
    loading,
    feedback,
    setBookingDoctor,
    setBookingDate,
    setBookingTime,
    resetBooking,
    confirmAppointment,
  } = useAppointment();

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-500">Fluxo de agendamento</p>
        <div className="grid gap-3">
          <StepBadge current={bookingStep === 1} index={1} label="Escolha o medico" />
          <StepBadge current={bookingStep === 2} index={2} label="Selecione a data" />
          <StepBadge current={bookingStep === 3} index={3} label="Escolha o horario" />
          <StepBadge current={bookingStep === 4} index={4} label="Confirme a consulta" />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-teal-50 p-3 text-primary dark:bg-teal-950">
            <Stethoscope size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Especialidade e medico</h2>
            <p className="text-sm text-slate-500">Disponibilidade atualizada em tempo real.</p>
          </div>
        </div>
        <div className="grid gap-3">
          {doctors.map((doctor) => (
            <button
              type="button"
              key={doctor.id}
              onClick={() => setBookingDoctor(doctor.id)}
              className={`rounded-3xl border p-4 text-left transition ${
                bookingDraft.doctorId === doctor.id
                  ? "border-primary bg-teal-50 dark:bg-teal-950"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{doctor.specialty}</p>
              <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">{doctor.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {bookingStep >= 2 ? (
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-50 p-3 text-accent dark:bg-orange-950">
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Data</h2>
              <p className="text-sm text-slate-500">Escolha uma data conveniente para o paciente.</p>
            </div>
          </div>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={bookingDraft.date ?? ""}
            onChange={(event) => setBookingDate(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
          />
        </Card>
      ) : null}

      {bookingStep >= 3 ? (
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-950">
              <Clock3 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Horario</h2>
              <p className="text-sm text-slate-500">Selecione um horario disponivel para {selectedDoctor?.name}.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {availableSlots.map((slot) => (
              <button
                type="button"
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setBookingTime(slot.time)}
                className={`min-h-12 rounded-2xl border px-3 py-2 text-sm font-semibold ${
                  bookingDraft.time === slot.time
                    ? "border-primary bg-primary text-white"
                    : slot.available
                      ? "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {bookingStep === 4 ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Confirmacao</h2>
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Resumo</p>
            <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
              {selectedDoctor?.name}
            </p>
            <p className="text-sm text-slate-500">{selectedDoctor?.specialty}</p>
            {bookingDraft.date ? (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {formatDate(bookingDraft.date)} as {bookingDraft.time}
              </p>
            ) : null}
          </div>
          {feedback ? (
            <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:bg-teal-950 dark:text-teal-200">
              {feedback}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetBooking}>
              Reiniciar
            </Button>
            <Button onClick={confirmAppointment} disabled={loading}>
              {loading ? "Confirmando..." : "Confirmar consulta"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
