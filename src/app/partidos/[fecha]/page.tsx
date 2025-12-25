import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { addDays, subDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { type Metadata } from 'next'

export async function generateStaticParams() {
  return [{ fecha: 'hoy' }, { fecha: 'ayer' }, { fecha: 'manana' }];
}

function getDateFromFecha(fecha: string): Date {
  const nowInUTC = new Date();
  const peruTime = new Date(nowInUTC.getTime() - (5 * 60 * 60 * 1000));
  
  if (fecha === "ayer") return subDays(peruTime, 1);
  if (fecha === "manana") return addDays(peruTime, 1);
  return peruTime;
}

export async function generateMetadata({ params }: { params: { fecha: string } }): Promise<Metadata> {
  const { fecha } = params;
  let fechaText = fecha;
  if(fecha === 'manana') fechaText = 'mañana';

  const date = getDateFromFecha(fecha);
  const formattedDate = format(date, "d 'de' MMMM", { locale: es });
  
  const fechaTitlePart = fechaText.charAt(0).toUpperCase() + fechaText.slice(1);
  const title = `Pronósticos de Fútbol para ${fechaTitlePart} ${formattedDate} - Fútbol Stats Zone`;
  const description = `Consulta los pronósticos y estadísticas de fútbol para ${fechaText}, ${formattedDate}. Análisis detallado, equipos favoritos, y resultados en vivo.`;

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
