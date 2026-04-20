import PDFDocument from "pdfkit";
import { ExamDeliveryPayload } from "../src/shared/types";

export async function buildExamPdf(payload: ExamDeliveryPayload) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, 90).fill("#1999dd");
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold").text("Medicinar", 40, 30);
    doc.fontSize(12).font("Helvetica").text("multiespecialidades", 40, 62);

    doc.moveDown(4);
    doc.fillColor("#22415a").fontSize(20).font("Helvetica-Bold").text("Resultado de Exame");
    doc.moveDown(1.2);

    doc.fontSize(11).font("Helvetica");
    doc.text(`Paciente: ${payload.patient.fullName}`);
    doc.text(`CPF: ${payload.patient.cpf}`);
    doc.text(`Email: ${payload.patient.email}`);
    doc.text(`Telefone: ${payload.patient.phone}`);
    doc.moveDown(0.8);
    doc.text(`Exame: ${payload.exam.examName}`);
    doc.text(`Categoria: ${payload.exam.category}`);
    doc.text(`Solicitante: ${payload.exam.requestedBy}`);
    doc.text(`Data da coleta: ${payload.exam.collectedAt}`);
    doc.text(
      `Status do resultado: ${payload.exam.resultStatus === "available" ? "Disponivel" : "Em processamento"}`,
    );
    doc.moveDown(1.2);

    doc.font("Helvetica-Bold").text("Resumo clinico");
    doc.moveDown(0.5);
    doc.font("Helvetica").text(payload.exam.summary, {
      align: "left",
    });
    doc.moveDown(1.2);

    doc.font("Helvetica-Bold").text("Observacoes");
    doc.moveDown(0.5);
    payload.exam.observations.forEach((item) => {
      doc.font("Helvetica").text(`• ${item}`);
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#7a8aa0").text(
      "Documento gerado digitalmente pela plataforma Medicinar.",
      { align: "left" },
    );

    doc.end();
  });
}
