import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableSlots } from "@/features/appointments/utils/slots";
import { useClinicStore } from "@/shared/store/useClinicStore";
import { NotificationPayload } from "@/shared/types";

export function useAppointment() {
  const navigate = useNavigate();
  const {
    authUser,
    doctors,
    appointments,
    bookingDraft,
    bookingStep,
    setBookingDoctor,
    setBookingDate,
    setBookingTime,
    resetBooking,
    createAppointment,
  } = useClinicStore();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedDoctor = doctors.find((doctor) => doctor.id === bookingDraft.doctorId);
  const availableSlots = useMemo(() => {
    if (!bookingDraft.date || !bookingDraft.doctorId) {
      return [];
    }

    return getAvailableSlots(bookingDraft.date, bookingDraft.doctorId, appointments);
  }, [appointments, bookingDraft.date, bookingDraft.doctorId]);

  async function confirmAppointment() {
    if (!authUser || !selectedDoctor || !bookingDraft.date || !bookingDraft.time) {
      setFeedback("Complete todas as etapas antes de confirmar.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    const result = await createAppointment();
    if (!result.success) {
      setLoading(false);
      setFeedback(result.message);
      return;
    }

    const notificationPayload: NotificationPayload = {
      patientName: authUser.fullName,
      patientEmail: authUser.email,
      patientPhone: authUser.phone,
      doctorName: selectedDoctor.name,
      appointmentDate: bookingDraft.date,
      appointmentTime: bookingDraft.time,
      type: "confirmation",
    };

    try {
      await fetch("http://localhost:4000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      setFeedback("Consulta confirmada. Email e SMS foram enfileirados.");
      navigate("/consultas");
    } catch (_error) {
      setFeedback("Consulta criada, mas nao foi possivel disparar as notificacoes.");
      navigate("/consultas");
    } finally {
      setLoading(false);
    }
  }

  return {
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
  };
}
