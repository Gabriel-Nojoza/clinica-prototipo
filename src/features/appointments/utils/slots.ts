import { Appointment } from "@/shared/types";

const baseSlots = ["08:00", "09:00", "10:30", "14:00", "15:30", "17:00"];

export function getAvailableSlots(
  date: string,
  doctorId: string,
  appointments: Appointment[],
) {
  const occupied = appointments
    .filter(
      (appointment) =>
        appointment.date === date &&
        appointment.doctorId === doctorId &&
        appointment.status === "scheduled",
    )
    .map((appointment) => appointment.time);

  return baseSlots.map((time) => ({
    time,
    available: !occupied.includes(time),
  }));
}
