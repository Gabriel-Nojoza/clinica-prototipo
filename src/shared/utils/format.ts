export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(date: string, time: string) {
  return `${formatDate(date)} as ${time}`;
}

export function isPastAppointment(date: string) {
  const now = new Date();
  return new Date(`${date}T23:59:59`) < now;
}
