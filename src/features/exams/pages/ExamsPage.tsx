import { useState } from "react";
import { ExamCard } from "@/features/exams/components/ExamCard";
import { generateExamPdf } from "@/features/exams/utils/generateExamPdf";
import { Card } from "@/shared/components/Card";
import { useClinicStore } from "@/shared/store/useClinicStore";
import { ExamRecord } from "@/shared/types";

export function ExamsPage() {
  const { authUser, exams } = useClinicStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deliveringExamId, setDeliveringExamId] = useState<string | null>(null);

  if (!authUser) {
    return null;
  }

  const patientExams = exams.filter((exam) => exam.patientId === authUser.id);

  async function deliverExamPdf(exam: ExamRecord) {
    try {
      setDeliveringExamId(exam.id);
      setFeedback(null);

      const response = await fetch("http://localhost:4000/api/exams/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient: authUser,
          exam,
        }),
      });

      const data = (await response.json()) as { success: boolean; message?: string };
      setFeedback(
        data.success
          ? "PDF enviado para o email do paciente e encaminhado no WhatsApp."
          : data.message ?? "Nao foi possivel entregar o PDF do exame.",
      );
    } catch (_error) {
      setFeedback("Nao foi possivel enviar o PDF agora. Tente novamente em instantes.");
    } finally {
      setDeliveringExamId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meus exames</h2>
        <p className="text-sm text-slate-500">
          Acesse seus laudos e gere o PDF dos exames liberados pela clinica.
        </p>
        {feedback ? (
          <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">
            {feedback}
          </p>
        ) : null}
      </Card>

      {patientExams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          onGeneratePdf={(selectedExam) => generateExamPdf(authUser, selectedExam)}
          onDeliverPdf={(selectedExam) => {
            void deliverExamPdf(selectedExam);
          }}
          delivering={deliveringExamId === exam.id}
        />
      ))}
    </div>
  );
}
