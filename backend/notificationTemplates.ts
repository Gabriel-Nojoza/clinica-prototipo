import { ExamDeliveryPayload, NotificationPayload } from "../src/shared/types";

export function buildMessage(payload: NotificationPayload) {
  const intro =
    payload.type === "confirmation"
      ? "Sua consulta foi confirmada"
      : payload.type === "reminder"
        ? "Lembrete de consulta"
        : payload.type === "reschedule"
          ? "Sua consulta foi remarcada"
          : "Sua consulta foi cancelada";

  const text = `${intro}: ${payload.patientName}, atendimento com ${payload.doctorName} em ${payload.appointmentDate} as ${payload.appointmentTime}.`;

  return {
    subject: `[Clinica Viva] ${intro}`,
    text,
    html: `<p>${text}</p>`,
  };
}

export function buildExamDeliveryMessage(payload: ExamDeliveryPayload) {
  const text =
    `O exame ${payload.exam.examName} de ${payload.patient.fullName} esta disponivel. ` +
    `Enviamos o PDF em anexo por email e pelo WhatsApp.`;

  return {
    subject: `[Medicinar] Exame disponivel: ${payload.exam.examName}`,
    text,
    html: `<p>${text}</p>`,
  };
}
