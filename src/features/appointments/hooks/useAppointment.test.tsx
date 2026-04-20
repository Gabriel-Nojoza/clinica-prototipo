import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAppointment } from "@/features/appointments/hooks/useAppointment";
import { useClinicStore } from "@/shared/store/useClinicStore";

describe("useAppointment", () => {
  beforeEach(() => {
    useClinicStore.setState({
      theme: "light",
      authUser: {
        id: "patient-1",
        role: "patient",
        fullName: "Mariana Costa",
        cpf: "12345678910",
        birthDate: "1991-09-14",
        phone: "11999990000",
        email: "mariana@exemplo.com",
        address: "Rua das Flores, 120",
      },
      doctors: [
        { id: "doc-1", name: "Dra. Helena Prado", specialty: "Clinica Geral" },
      ],
      appointments: [],
      bookingDraft: {},
      bookingStep: 1,
      maxSimultaneousAppointments: 2,
    } as never);
  });

  it("avanca etapas e cria horarios disponiveis", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        {children}
      </MemoryRouter>
    );
    const { result } = renderHook(() => useAppointment(), { wrapper });

    act(() => {
      result.current.setBookingDoctor("doc-1");
      result.current.setBookingDate("2026-04-25");
    });

    expect(result.current.bookingStep).toBe(3);
    expect(result.current.availableSlots.length).toBeGreaterThan(0);
  });
});
