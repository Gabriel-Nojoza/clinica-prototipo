import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/shared/components/AppShell";
import { AdminShell } from "@/shared/components/AdminShell";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { HomePage } from "@/features/home/pages/HomePage";
import { BookingPage } from "@/features/appointments/pages/BookingPage";
import { AppointmentsPage } from "@/features/appointments/pages/AppointmentsPage";
import { ExamsPage } from "@/features/exams/pages/ExamsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { AdminPage } from "@/features/admin/pages/AdminPage";
import { useClinicStore } from "@/shared/store/useClinicStore";

export function App() {
  const { authUser } = useClinicStore();
  const isAdmin = authUser?.role === "admin";

  return (
    <AuthGate>
      {isAdmin ? (
        <AdminShell>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/consultas" element={<AdminPage />} />
            <Route path="/agendar" element={<AdminPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminShell>
      ) : (
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agendar" element={<BookingPage />} />
            <Route path="/consultas" element={<AppointmentsPage />} />
            <Route path="/exames" element={<ExamsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      )}
    </AuthGate>
  );
}
