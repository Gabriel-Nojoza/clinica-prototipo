import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FlaskConical, Clock, Search, PlusCircle, X, UserCircle2, Upload, FileText } from "lucide-react";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { useClinicStore } from "@/shared/store/useClinicStore";
import { formatDate } from "@/shared/utils/format";
import { ExamRecord, UserProfile } from "@/shared/types";

/* ── schema cadastro ── */
const newExamSchema = z.object({
  examName: z.string().min(3, "Nome do exame obrigatorio."),
  category: z.string().min(2, "Categoria obrigatoria."),
  requestedBy: z.string().min(3, "Medico solicitante obrigatorio."),
  collectedAt: z.string().min(1, "Data de coleta obrigatoria."),
  summary: z.string().min(5, "Resumo do resultado obrigatorio."),
  observations: z.string(),
});
type NewExamForm = z.infer<typeof newExamSchema>;

/* ── schema liberar exame existente ── */
const readySchema = z.object({
  summary: z.string().min(5, "Informe um resumo do resultado."),
  observations: z.string(),
});
type ReadyForm = z.infer<typeof readySchema>;

/* ─────────────────────────────── */
function ExamCard({ exam }: { exam: ExamRecord }) {
  const { markExamReady } = useClinicStore();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReadyForm>({
    resolver: zodResolver(readySchema),
    defaultValues: { summary: exam.summary ?? "", observations: exam.observations?.join("\n") ?? "" },
  });

  if (exam.resultStatus === "available") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{exam.examName}</p>
          <p className="text-xs text-slate-500">{exam.patientName} · {exam.category} · Liberado</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
          Disponivel
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-white dark:border-orange-900/40 dark:bg-slate-800">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
          <Clock size={16} className="text-orange-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{exam.examName}</p>
          <p className="text-xs text-slate-500">{exam.patientName} · {exam.category} · Coletado em {formatDate(exam.collectedAt)}</p>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-2xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">
          {open ? "Cancelar" : "Liberar"}
        </button>
      </div>
      {open && (
        <form className="space-y-3 border-t border-orange-100 px-4 py-4 dark:border-orange-900/40"
          onSubmit={handleSubmit(async (values) => {
            const obs = values.observations.split("\n").map((o) => o.trim()).filter(Boolean);
            const result = await markExamReady(exam.id, values.summary, obs);
            setFeedback(result.message);
            if (result.success) { reset(); setOpen(false); }
          })}>
          <Input label="Resumo do resultado" error={errors.summary?.message} {...register("summary")} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Observacoes <span className="text-slate-400">(uma por linha)</span>
            </label>
            <textarea rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              {...register("observations")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Confirmar resultado"}
          </Button>
          {feedback && (
            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">{feedback}</p>
          )}
        </form>
      )}
    </div>
  );
}

/* ─────────────────────────────── */
function NewExamForm({ onClose }: { onClose: () => void }) {
  const { searchPatients, createExam, doctors } = useClinicStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<NewExamForm>({
    resolver: zodResolver(newExamSchema),
  });

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) ?? null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await searchPatients(value);
      setResults(found);
      setSearching(false);
    }, 400);
  }

  function handleDoctorSelect(doctorId: string) {
    setSelectedDoctorId(doctorId);
    const doc = doctors.find((d) => d.id === doctorId);
    if (doc) setValue("requestedBy", doc.name);
  }

  return (
    <Card className="space-y-5 border border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar resultado de exame</h3>
          <p className="text-xs text-slate-500">Busque o paciente, selecione o medico e anexe o PDF.</p>
        </div>
        <button type="button" onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800">
          <X size={16} />
        </button>
      </div>

      {/* ── 1. Busca de paciente ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">1. Paciente</p>
        {selected ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {selected.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selected.fullName}</p>
                  <p className="text-xs text-slate-500">CPF: {selected.cpf}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setSelected(null); setQuery(""); setResults([]); }}
                className="mt-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-white/60 p-3 dark:bg-slate-800/60">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Data de nascimento</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {selected.birthDate ? formatDate(selected.birthDate) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Telefone</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{selected.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Email</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{selected.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="Buscar por nome ou CPF..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              {searching && <span className="text-xs text-slate-400">Buscando...</span>}
            </div>
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {results.map((p) => (
                  <button key={p.id} type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => { setSelected(p); setQuery(p.fullName); setResults([]); }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {p.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.fullName}</p>
                      <p className="text-xs text-slate-500">
                        CPF: {p.cpf}
                        {p.birthDate ? ` · Nasc: ${formatDate(p.birthDate)}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {results.length === 0 && query.length >= 2 && !searching && (
              <p className="mt-2 text-xs text-slate-400">Nenhum paciente encontrado.</p>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Médico ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">2. Medico solicitante</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {doctors.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => handleDoctorSelect(doc.id)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                selectedDoctorId === doc.id
                  ? "border-primary bg-primary/5 dark:border-primary"
                  : "border-slate-200 bg-white hover:border-primary/40 dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                selectedDoctorId === doc.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}>
                {doc.name.split(" ").find((p, i) => i > 0 && p.length > 2)?.charAt(0) ?? doc.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.specialty}</p>
              </div>
            </button>
          ))}
        </div>
        {selectedDoctor && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2">
            <CheckCircle2 size={14} className="text-primary" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{selectedDoctor.name}</span> · {selectedDoctor.specialty}
            </p>
          </div>
        )}
      </div>

      {/* ── 3. Dados do exame ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">3. Dados do exame</p>
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (values) => {
            if (!selected) { setFeedback("Selecione um paciente."); return; }
            if (!selectedDoctorId) { setFeedback("Selecione o medico solicitante."); return; }
            const obs = values.observations.split("\n").map((o) => o.trim()).filter(Boolean);
            const result = await createExam({ patientId: selected.id, ...values, observations: obs, pdfFile: pdfFile ?? undefined });
            setFeedback(result.message);
            if (result.success) { reset(); setSelected(null); setQuery(""); setPdfFile(null); setSelectedDoctorId(""); onClose(); }
          })}
        >
          {/* campo hidden para requestedBy */}
          <input type="hidden" {...register("requestedBy")} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome do exame" error={errors.examName?.message} {...register("examName")} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                {...register("category")}
              >
                <option value="">Selecione...</option>
                <option>Hemograma</option>
                <option>Bioquimica</option>
                <option>Imagem</option>
                <option>Urina</option>
                <option>Microbiologia</option>
                <option>Hormonal</option>
                <option>Outro</option>
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <Input label="Data de coleta" type="date" error={errors.collectedAt?.message} {...register("collectedAt")} />
          <Input label="Resumo do resultado" error={errors.summary?.message} {...register("summary")} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Observacoes <span className="text-slate-400">(uma por linha, opcional)</span>
            </label>
            <textarea rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              {...register("observations")} />
          </div>

          {/* Upload PDF */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Arquivo PDF do exame
            </label>
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
            {pdfFile ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <FileText size={18} className="shrink-0 text-primary" />
                <p className="flex-1 truncate text-sm font-medium text-slate-900 dark:text-white">{pdfFile.name}</p>
                <button type="button" onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-5 text-sm font-medium text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-700">
                <Upload size={18} />
                Clique para anexar o PDF do laboratorio
              </button>
            )}
          </div>

          {feedback && (
            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-100">{feedback}</p>
          )}
          <Button type="submit" disabled={isSubmitting || !selected || !selectedDoctorId}>
            {isSubmitting ? "Enviando..." : "Cadastrar e liberar para o paciente"}
          </Button>
        </form>
      </div>
    </Card>
  );
}

/* ─────────────────────────────── */
export function AdminExamsPage() {
  const { exams } = useClinicStore();
  const [tab, setTab] = useState<"pending" | "done">("pending");
  const [showForm, setShowForm] = useState(false);

  const pending = exams.filter((e) => e.resultStatus === "processing");
  const done = exams.filter((e) => e.resultStatus === "available");
  const list = tab === "pending" ? pending : done;

  return (
    <div className="space-y-5">
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Aguardando</span>
            <div className="rounded-2xl bg-orange-100 p-2 text-orange-500 dark:bg-orange-950"><Clock size={16} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{pending.length}</p>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Liberados</span>
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-500 dark:bg-emerald-950"><CheckCircle2 size={16} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{done.length}</p>
        </Card>
      </div>

      {/* Botão novo exame */}
      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 py-4 text-sm font-semibold text-primary transition hover:bg-primary/5">
          <PlusCircle size={18} />
          Cadastrar resultado de exame
        </button>
      )}

      {showForm && <NewExamForm onClose={() => setShowForm(false)} />}

      {/* Lista */}
      <Card className="space-y-4">
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["pending", "done"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white" : "text-slate-500"
              }`}>
              {t === "pending" ? <><Clock size={14} /> Pendentes {pending.length > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 dark:bg-orange-900 dark:text-orange-300">{pending.length}</span>
              )}</> : <><CheckCircle2 size={14} /> Liberados</>}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <FlaskConical size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              {tab === "pending" ? "Nenhum exame pendente no momento." : "Nenhum exame liberado ainda."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
          </div>
        )}
      </Card>
    </div>
  );
}
