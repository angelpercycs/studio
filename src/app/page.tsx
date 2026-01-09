import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { format } from "date-fns";
import { type Metadata } from 'next'

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Pronósticos de Fútbol para Hoy - Fútbol Stats Zone',
  description: 'Análisis estadístico y pronósticos de fútbol precisos para las principales ligas. Consulta las probabilidades de victoria hoy mismo.',
  alternates: {
    canonical: '/',
  },
};

export default async function Page() {
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const dateString = format(date, "yyyy-MM-dd");
  const { data: initialMatches, error } = await getMatchesByDate(dateString);

  const generateJsonLd = (matches: any[]) => {
    if (!matches || matches.length === 0) return null;

    const itemListElement = matches.map((match, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SportsEvent",
        "name": `${match.team1?.name} vs ${match.team2?.name}`,
        "startDate": match.match_date_iso,
        "description": `Pronóstico y estadísticas del partido de ${match.league?.name} entre ${match.team1?.name} y ${match.team2?.name}.`,
        "location": {
          "@type": "Place",
          "name": match.league?.countries?.name || "Estadio Desconocido"
        },
        "homeTeam": {
          "@type": "SportsTeam",
          "name": match.team1?.name
        },
        "awayTeam": {
          "@type": "SportsTeam",
          "name": match.team2?.name
        },
        "competitor": [
          {
            "@type": "SportsTeam",
            "name": match.team1?.name
          },
          {
            "@type": "SportsTeam",
            "name": match.team2?.name
          }
        ]
      }
    }));
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": itemListElement
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  };

  return (
    <>
      {generateJsonLd(initialMatches)}
      <PartidosClientPage
        initialMatches={initialMatches || []}
        error={error}
        fecha={'hoy'}
      />
    </>
  );
}
