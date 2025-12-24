import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { addDays, subDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { type Metadata } from 'next'

export async function generateStaticParams() {
  return [{ fecha: 'hoy' }, { fecha: 'ayer' }, { fecha: 'manana' }];
}

function getDateFromFecha(fecha: string): Date {
  if (fecha === "ayer") return subDays(new Date(), 1);
  if (fecha === "manana") return addDays(new Date(), 1);
  return new Date();
}

export async function generateMetadata({ params }: { params: { fecha: string } }): Promise<Metadata> {
  const { fecha } = params;
  const date = getDateFromFecha(fecha);
  const formattedDate = format(date, "d 'de' MMMM", { locale: es });
  
  const fechaTitlePart = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const title = `Pronósticos de Fútbol para ${fechaTitlePart} ${formattedDate} - Fútbol Stats Zone`;
  const description = `Consulta los pronósticos y estadísticas de fútbol para hoy, ${formattedDate}. Análisis detallado, equipos favoritos, y resultados en vivo.`;

  return {
    title,
    description,
  };
}


export default async function Page({ params }: { params: { fecha: string } }) {
  const { fecha } = params;
  
  if (!["hoy", "ayer", "manana"].includes(fecha)) {
    return { notFound: true };
  }

  const date = getDateFromFecha(fecha);
  const dateString = format(date, "yyyy-MM-dd");
  const { data: initialMatches, error } = await getMatchesByDate(dateString);

  const generateJsonLd = (matches: any[]) => {
    if (!matches || matches.length === 0) return null;

    const events = matches.map(match => ({
      "@context": "https://schema.org",
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
    }));

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(events) }}
      />
    );
  };

  return (
    <>
      {generateJsonLd(initialMatches)}
      <PartidosClientPage
        initialMatches={initialMatches || []}
        error={error}
        fecha={fecha}
      />
    </>
  );
}
