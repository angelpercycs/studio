import { MatchesByFavorite } from "@/components/matches-by-favorite";
import { type Metadata } from "next";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata: Metadata = {
    title: 'Búsqueda de Partidos por Equipo Favorito | Fútbol Stats Zone',
    description: 'Encuentra y sigue los partidos de tu equipo favorito. Consulta su próximo encuentro, resultados y estadísticas detalladas.',
};


export default function PorFavoritoPage() {
    return <MatchesByFavorite />;
}
