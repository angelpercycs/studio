import { MatchesByDate } from "@/components/matches-by-date";
import { type Metadata } from "next";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata: Metadata = {
  title: 'Partidos de fútbol por fecha | Hoy, mañana y ayer – Fútbol Stats Zone',
  description: 'Consulta todos los partidos de fútbol organizados por fecha. Resultados, horarios y estadísticas actualizadas en tiempo real.',
};

export default function PorFechaPage() {
  return <MatchesByDate />;
}
