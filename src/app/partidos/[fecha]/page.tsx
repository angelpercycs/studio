import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { addDays, subDays, format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { type Metadata } from 'next'
import { redirect } from 'next/navigation';

export const revalidate = 1800; // Revalidate every 30 minutes

function getDateFromParam(fecha: string): Date | null {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));

  if (fecha === "ayer") return subDays(now, 1);
  if (fecha === "manana") return addDays(now, 1);
  if (fecha === "hoy") return now; // Although we redirect, handle it just in case.

  const parsedDate = parseISO(fecha);
  if (isValid(parsedDate)) {
    return parsedDate;
  }

  return null;
}

export async function generateMetadata({ params }: { params: { fecha: string } }): Promise<Metadata> {
  const { fecha } = params;
  
  const date = getDateFromParam(fecha);
  
  if (!date) {
    return {
      title: 'Fecha no válida - Fútbol Stats Zone',
      description: 'La fecha solicitada no es válida.',
    }
  }

  let fechaText: string;
  if (fecha === 'ayer' || fecha === 'manana' || fecha === 'hoy') {
    fechaText = fecha === 'manana' ? 'mañana' : fecha;
  } else {
    fechaText = format(date, "d 'de' MMMM", { locale: es });
  }
  
  const fechaTitlePart = fechaText.charAt(0).toUpperCase() + fechaText.slice(1);
  const title = `Pronósticos de Fútbol para ${fechaTitlePart} - Fútbol Stats Zone`;
  const description = `Consulta los pronósticos y estadísticas de fútbol para ${fechaText}. Análisis detallado, equipos favoritos, y resultados en vivo.`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    }
  };
}


export default async function Page({ params }: { params: { fecha: string } }) {
  const { fecha } = params;
  
  if (fecha === 'hoy') {
    redirect('/');
  }

  const date = getDateFromParam(fecha);
  
  if (!date) {
    redirect('/');
  }

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
        fecha={fecha}
      />
    </>
  );
}