import { FileDown, FlaskConical } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { ExamRecord } from "@/shared/types";

interface ExamCardProps {
  exam: ExamRecord;
  onGeneratePdf: (exam: ExamRecord) => void;
  onDeliverPdf: (exam: ExamRecord) => void;
  delivering?: boolean;
}

export function ExamCard({ exam, onGeneratePdf, onDeliverPdf, delivering = false }: ExamCardProps) {
  const available = exam.resultStatus === "available";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl bg-sky-50 p-3 text-primary dark:bg-slate-800">
            <FlaskConical size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">{exam.category}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {exam.examName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Solicitado por {exam.requestedBy} em {exam.collectedAt}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-slate-800 dark:text-sky-200">
          {available ? "Disponivel" : "Processando"}
        </span>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        {exam.summary}
      </div>

      <div className="grid gap-2">
        {available && exam.pdfUrl ? (
          <a
            href={exam.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FileDown size={16} />
            Baixar PDF do exame
          </a>
        ) : (
          <Button
            variant={available ? "primary" : "secondary"}
            onClick={() => onGeneratePdf(exam)}
            disabled={!available}
          >
            <span className="inline-flex items-center gap-2">
              <FileDown size={16} />
              {available ? "Gerar PDF do exame" : "PDF liberado quando o laudo estiver pronto"}
            </span>
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => onDeliverPdf(exam)}
          disabled={!available || delivering}
        >
          {delivering ? "Enviando PDF..." : "Enviar PDF por email e WhatsApp"}
        </Button>
      </div>
    </Card>
  );
}
