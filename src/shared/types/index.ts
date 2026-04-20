export type UserRole = "patient" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "scheduled" | "cancelled" | "completed";
  channel: "app";
  createdAt: string;
}

export interface ExamRecord {
  id: string;
  patientId: string;
  patientName?: string;
  examName: string;
  category: string;
  requestedBy: string;
  collectedAt: string;
  resultStatus: "available" | "processing";
  summary: string;
  observations: string[];
  pdfUrl?: string;
}

export interface ExamDeliveryPayload {
  patient: UserProfile;
  exam: ExamRecord;
}

export interface NotificationPayload {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  type: "confirmation" | "reminder" | "reschedule" | "cancellation";
}
