import { MatchesByLeague } from "@/components/matches-by-league";
import { type Metadata } from "next";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata: Metadata = {
    title: 'Partidos de fútbol por liga | Estadísticas y pronósticos',
    description: 'Explora partidos de fútbol por liga. Encuentra estadísticas detalladas, análisis y pronósticos para tus competiciones favoritas.',
};

export default function PorLigaPage() {
    return <MatchesByLeague />;
}
