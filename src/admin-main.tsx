import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes, Navigate } from "react-router-dom";
import { AdminShell } from "@/shared/components/AdminShell";
import { AdminPage } from "@/features/admin/pages/AdminPage";
import { AdminExamsPage } from "@/features/admin/pages/AdminExamsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { AdminAuthGate } from "@/features/auth/components/AdminAuthGate";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthGate>
        <AdminShell>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/exames" element={<AdminExamsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminShell>
      </AdminAuthGate>
    </BrowserRouter>
  </React.StrictMode>,
);
