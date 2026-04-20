import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/integrations/supabase/client";
import { doctors as fallbackDoctors } from "@/shared/data/mockData";
import { Appointment, Doctor, ExamRecord, UserProfile } from "@/shared/types";

type BookingStep = 1 | 2 | 3 | 4;
type Theme = "light" | "dark";

interface BookingDraft {
  doctorId?: string;
  date?: string;
  time?: string;
  appointmentIdToReschedule?: string;
}

interface ActionResult<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

interface ClinicState {
  theme: Theme;
  authUser: UserProfile | null;
  doctors: Doctor[];
  appointments: Appointment[];
  exams: ExamRecord[];
  bookingDraft: BookingDraft;
  bookingStep: BookingStep;
  maxSimultaneousAppointments: number;
  isAuthReady: boolean;
  isBootstrapping: boolean;
  configurationError: string | null;
  toggleTheme: () => void;
  initializeAuth: () => Promise<void>;
  loadAppData: () => Promise<void>;
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  registerPatient: (
    payload: UserProfile,
    password: string,
  ) => Promise<ActionResult>;
  updateProfile: (payload: UserProfile) => Promise<ActionResult>;
  setBookingDoctor: (doctorId: string) => void;
  setBookingDate: (date: string) => void;
  setBookingTime: (time: string) => void;
  resetBooking: () => void;
  setRescheduleTarget: (appointmentId: string) => void;
  createAppointment: () => Promise<ActionResult<Appointment>>;
  cancelAppointment: (appointmentId: string) => Promise<ActionResult>;
  completeAppointment: (appointmentId: string) => Promise<ActionResult>;
  addDoctor: (doctor: Omit<Doctor, "id">) => Promise<ActionResult>;
  markExamReady: (examId: string, summary: string, observations: string[]) => Promise<ActionResult>;
  searchPatients: (query: string) => Promise<UserProfile[]>;
  createExam: (payload: {
    patientId: string;
    examName: string;
    category: string;
    requestedBy: string;
    collectedAt: string;
    summary: string;
    observations: string[];
    pdfFile?: File;
  }) => Promise<ActionResult>;
  applyAuthSession: (userId: string | null) => Promise<void>;
}

function mapProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    role: String(row.role) as UserProfile["role"],
    fullName: String(row.full_name ?? ""),
    cpf: String(row.cpf ?? ""),
    birthDate: String(row.birth_date ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    address: String(row.address ?? ""),
  };
}

function mapDoctorRow(row: Record<string, unknown>): Doctor {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    specialty: String(row.specialty ?? ""),
  };
}

function mapAppointmentRow(row: Record<string, unknown>): Appointment {
  const doctor = (row.doctors ?? {}) as Record<string, unknown>;
  const patient = (row.patient ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: String(patient.full_name ?? ""),
    doctorId: String(row.doctor_id),
    doctorName: String(doctor.name ?? ""),
    specialty: String(doctor.specialty ?? ""),
    date: String(row.appointment_date),
    time: String(row.appointment_time).slice(0, 5),
    status: String(row.status) as Appointment["status"],
    channel: String(row.channel ?? "app") as Appointment["channel"],
    createdAt: String(row.created_at),
  };
}

function mapExamRow(row: Record<string, unknown>): ExamRecord {
  const patient = (row.patient ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: String(patient.full_name ?? ""),
    examName: String(row.exam_name),
    category: String(row.category),
    requestedBy: String(row.requested_by),
    collectedAt: String(row.collected_at),
    resultStatus: String(row.result_status) as ExamRecord["resultStatus"],
    summary: String(row.summary),
    observations: Array.isArray(row.observations)
      ? row.observations.map((item) => String(item))
      : [],
    pdfUrl: row.pdf_url ? String(row.pdf_url) : undefined,
  };
}

async function fetchProfileByUserId(userId: string) {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data ? mapProfileRow(data) : null;
}

export const useClinicStore = create<ClinicState>()(
  persist(
    (set, get) => ({
      theme: "light",
      authUser: null,
      doctors: fallbackDoctors,
      appointments: [],
      exams: [],
      bookingDraft: {},
      bookingStep: 1,
      maxSimultaneousAppointments: 2,
      isAuthReady: false,
      isBootstrapping: false,
      configurationError: isSupabaseConfigured
        ? null
        : "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar dados reais.",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      initializeAuth: async () => {
        if (!supabase) {
          set({ isAuthReady: true });
          return;
        }

        set({ isBootstrapping: true });
        const { data } = await supabase.auth.getUser();
        await get().applyAuthSession(data.user?.id ?? null);
      },
      applyAuthSession: async (userId) => {
        if (!supabase) {
          set({
            isBootstrapping: false,
            isAuthReady: true,
            authUser: null,
            appointments: [],
            exams: [],
            doctors: fallbackDoctors,
          });
          return;
        }

        if (!userId) {
          const { data: doctorsData } = await supabase
            .from("doctors")
            .select("*")
            .order("name", { ascending: true });

          set({
            authUser: null,
            doctors: doctorsData?.map(mapDoctorRow) ?? fallbackDoctors,
            appointments: [],
            exams: [],
            isBootstrapping: false,
            isAuthReady: true,
          });
          return;
        }

        const profile = await fetchProfileByUserId(userId);
        const { data: doctorsData } = await supabase
          .from("doctors")
          .select("*")
          .order("name", { ascending: true });

        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(
            "id, patient_id, doctor_id, appointment_date, appointment_time, status, channel, created_at, doctors(id, name, specialty), patient:profiles!appointments_patient_id_fkey(full_name)",
          )
          .order("appointment_date", { ascending: true });

        const { data: examsData } = await supabase
          .from("exams")
          .select("*, patient:profiles!exams_patient_id_fkey(full_name)")
          .order("collected_at", { ascending: false });

        set({
          authUser: profile,
          doctors: doctorsData?.map(mapDoctorRow) ?? fallbackDoctors,
          appointments: appointmentsData?.map(mapAppointmentRow) ?? [],
          exams: examsData?.map(mapExamRow) ?? [],
          isBootstrapping: false,
          isAuthReady: true,
        });
      },
      loadAppData: async () => {
        const userId = get().authUser?.id ?? null;
        await get().applyAuthSession(userId);
      },
      login: async (email, password) => {
        if (!supabase) {
          return {
            success: false,
            message: "Supabase nao configurado no projeto.",
          };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error || !data.user) {
          return {
            success: false,
            message: error?.message ?? "Nao foi possivel entrar com este usuario.",
          };
        }

        await get().applyAuthSession(data.user.id);
        return {
          success: true,
          message: `Bem-vindo, ${get().authUser?.fullName.split(" ")[0] ?? ""}.`,
        };
      },
      logout: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }

        set({
          authUser: null,
          appointments: [],
          exams: [],
          bookingDraft: {},
          bookingStep: 1,
        });
      },
      registerPatient: async (payload, password) => {
        if (!supabase) {
          return {
            success: false,
            message: "Supabase nao configurado no projeto.",
          };
        }

        const { data, error } = await supabase.auth.signUp({
          email: payload.email.trim().toLowerCase(),
          password,
          options: {
            data: {
              role: "patient",
              full_name: payload.fullName,
              cpf: payload.cpf,
              birth_date: payload.birthDate,
              phone: payload.phone,
              address: payload.address,
            },
          },
        });

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        if (!data.user) {
          return {
            success: false,
            message: "Nao foi possivel concluir o cadastro.",
          };
        }

        if (data.session) {
          await get().applyAuthSession(data.user.id);
          return {
            success: true,
            message: "Cadastro concluido com sucesso.",
          };
        }

        return {
          success: true,
          message:
            "Cadastro criado. Verifique seu email para confirmar a conta antes de entrar.",
        };
      },
      updateProfile: async (payload) => {
        if (!supabase) {
          return {
            success: false,
            message: "Usuario nao autenticado.",
          };
        }

        const currentUser = get().authUser;
        if (!currentUser) {
          return {
            success: false,
            message: "Usuario nao autenticado.",
          };
        }
        const emailChanged = currentUser.email !== payload.email.trim().toLowerCase();

        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: payload.fullName,
            cpf: payload.cpf,
            birth_date: payload.birthDate,
            phone: payload.phone,
            email: payload.email.trim().toLowerCase(),
            address: payload.address,
          })
          .eq("id", currentUser.id);

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        if (emailChanged) {
          const { error: authError } = await supabase.auth.updateUser({
            email: payload.email.trim().toLowerCase(),
          });

          if (authError) {
            return {
              success: false,
              message: authError.message,
            };
          }
        }

        await get().loadAppData();
        return {
          success: true,
          message: emailChanged
            ? "Perfil salvo. Confirme o novo email na mensagem enviada pelo Supabase."
            : "Perfil atualizado com sucesso.",
        };
      },
      setBookingDoctor: (doctorId) =>
        set({
          bookingDraft: { ...get().bookingDraft, doctorId },
          bookingStep: 2,
        }),
      setBookingDate: (date) =>
        set((state) => ({
          bookingDraft: { ...state.bookingDraft, date },
          bookingStep: 3,
        })),
      setBookingTime: (time) =>
        set((state) => ({
          bookingDraft: { ...state.bookingDraft, time },
          bookingStep: 4,
        })),
      resetBooking: () => set({ bookingDraft: {}, bookingStep: 1 }),
      setRescheduleTarget: (appointmentId) =>
        set({
          bookingDraft: { appointmentIdToReschedule: appointmentId },
          bookingStep: 1,
        }),
      createAppointment: async () => {
        const state = get();
        const user = state.authUser;
        const { doctorId, date, time, appointmentIdToReschedule } = state.bookingDraft;

        if (!supabase || !user || !doctorId || !date || !time) {
          return {
            success: false,
            message: "Complete todas as etapas antes de confirmar.",
          };
        }

        const activeAppointments = state.appointments.filter(
          (appointment) =>
            appointment.patientId === user.id && appointment.status === "scheduled",
        );

        if (
          !appointmentIdToReschedule &&
          activeAppointments.length >= state.maxSimultaneousAppointments
        ) {
          return {
            success: false,
            message: "Voce atingiu o limite de agendamentos simultaneos.",
          };
        }

        if (appointmentIdToReschedule) {
          const { error: oldAppointmentError } = await supabase
            .from("appointments")
            .update({ status: "cancelled" })
            .eq("id", appointmentIdToReschedule);

          if (oldAppointmentError) {
            return {
              success: false,
              message: oldAppointmentError.message,
            };
          }
        }

        const { data, error } = await supabase
          .from("appointments")
          .insert({
            patient_id: user.id,
            doctor_id: doctorId,
            appointment_date: date,
            appointment_time: `${time}:00`,
            status: "scheduled",
            channel: "app",
          })
          .select(
            "id, patient_id, doctor_id, appointment_date, appointment_time, status, channel, created_at, doctors(id, name, specialty), patient:profiles!appointments_patient_id_fkey(full_name)",
          )
          .single();

        if (error || !data) {
          return {
            success: false,
            message: error?.message ?? "Nao foi possivel criar a consulta.",
          };
        }

        const appointment = mapAppointmentRow(data);
        set({
          bookingDraft: {},
          bookingStep: 1,
        });
        await get().loadAppData();

        return {
          success: true,
          message: "Consulta confirmada com sucesso.",
          data: appointment,
        };
      },
      cancelAppointment: async (appointmentId) => {
        if (!supabase) {
          return {
            success: false,
            message: "Supabase nao configurado.",
          };
        }

        const { error } = await supabase
          .from("appointments")
          .update({ status: "cancelled" })
          .eq("id", appointmentId);

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        await get().loadAppData();
        return {
          success: true,
          message: "Consulta cancelada com sucesso.",
        };
      },
      completeAppointment: async (appointmentId) => {
        if (!supabase) {
          return {
            success: false,
            message: "Supabase nao configurado.",
          };
        }

        const { error } = await supabase
          .from("appointments")
          .update({ status: "completed" })
          .eq("id", appointmentId);

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        await get().loadAppData();
        return {
          success: true,
          message: "Consulta marcada como realizada.",
        };
      },
      addDoctor: async (doctor) => {
        if (!supabase) {
          return {
            success: false,
            message: "Supabase nao configurado.",
          };
        }

        const { error } = await supabase.from("doctors").insert({
          name: doctor.name,
          specialty: doctor.specialty,
        });

        if (error) {
          return {
            success: false,
            message: error.message,
          };
        }

        await get().loadAppData();
        return {
          success: true,
          message: "Medico adicionado com sucesso.",
        };
      },
      markExamReady: async (examId, summary, observations) => {
        if (!supabase) {
          return { success: false, message: "Supabase nao configurado." };
        }

        const { error } = await supabase
          .from("exams")
          .update({ result_status: "available", summary, observations })
          .eq("id", examId);

        if (error) {
          return { success: false, message: error.message };
        }

        await get().loadAppData();
        return { success: true, message: "Exame liberado com sucesso." };
      },
      searchPatients: async (query) => {
        if (!supabase) return [];
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "patient")
          .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%`)
          .limit(10);
        return data?.map(mapProfileRow) ?? [];
      },
      createExam: async (payload) => {
        if (!supabase) return { success: false, message: "Supabase nao configurado." };

        let pdfUrl: string | undefined;

        if (payload.pdfFile) {
          const fileName = `${payload.patientId}/${Date.now()}-${payload.pdfFile.name.replace(/\s+/g, "_")}`;
          const { error: uploadError } = await (supabaseAdmin ?? supabase).storage
            .from("exams")
            .upload(fileName, payload.pdfFile, { contentType: "application/pdf", upsert: false });

          if (uploadError) return { success: false, message: `Erro ao enviar PDF: ${uploadError.message}` };

          const { data: urlData } = (supabaseAdmin ?? supabase).storage.from("exams").getPublicUrl(fileName);
          pdfUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from("exams").insert({
          patient_id: payload.patientId,
          exam_name: payload.examName,
          category: payload.category,
          requested_by: payload.requestedBy,
          collected_at: payload.collectedAt,
          result_status: "available",
          summary: payload.summary,
          observations: payload.observations,
          pdf_url: pdfUrl ?? null,
        });

        if (error) return { success: false, message: error.message };
        await get().loadAppData();
        return { success: true, message: "Exame cadastrado e disponivel para o paciente." };
      },
    }),
    {
      name: "medicinar-store",
      partialize: (state) => ({
        theme: state.theme,
        authUser: state.authUser,
        bookingDraft: state.bookingDraft,
        bookingStep: state.bookingStep,
      }),
    },
  ),
);
