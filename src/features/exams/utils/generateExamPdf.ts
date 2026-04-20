import { jsPDF } from "jspdf";
import { ExamRecord, UserProfile } from "@/shared/types";

export function generateExamPdf(patient: UserProfile, exam: ExamRecord) {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  pdf.setFillColor(25, 153, 221);
  pdf.rect(0, 0, 210, 28, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("Medicinar", 14, 16);
  pdf.setFontSize(10);
  pdf.text("multiespecialidades", 14, 22);

  pdf.setTextColor(34, 65, 90);
  pdf.setFontSize(18);
  pdf.text("Resultado de Exame", 14, 40);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Paciente: ${patient.fullName}`, 14, 52);
  pdf.text(`CPF: ${patient.cpf}`, 14, 59);
  pdf.text(`Exame: ${exam.examName}`, 14, 66);
  pdf.text(`Categoria: ${exam.category}`, 14, 73);
  pdf.text(`Solicitante: ${exam.requestedBy}`, 14, 80);
  pdf.text(`Data da coleta: ${exam.collectedAt}`, 14, 87);
  pdf.text(
    `Status: ${exam.resultStatus === "available" ? "Disponivel" : "Em processamento"}`,
    14,
    94,
  );

  pdf.setFont("helvetica", "bold");
  pdf.text("Resumo clinico", 14, 108);
  pdf.setFont("helvetica", "normal");
  const summaryLines = pdf.splitTextToSize(exam.summary, 180);
  pdf.text(summaryLines, 14, 116);

  pdf.setFont("helvetica", "bold");
  pdf.text("Observacoes", 14, 136);
  pdf.setFont("helvetica", "normal");

  let y = 144;
  exam.observations.forEach((item) => {
    const lines = pdf.splitTextToSize(`- ${item}`, 180);
    pdf.text(lines, 14, y);
    y += lines.length * 6 + 2;
  });

  pdf.setDrawColor(201, 194, 236);
  pdf.line(14, 270, 196, 270);
  pdf.setFontSize(9);
  pdf.setTextColor(120, 134, 156);
  pdf.text(
    "Documento gerado digitalmente no portal do paciente Medicinar.",
    14,
    277,
  );

  pdf.save(`exame-${exam.examName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
