import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { addDays, subDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { type Metadata } from 'next'

function getDateFromFecha(fecha: string): Date {
  const now = new Date();
  const peruOffset = -5 * 60 * 60 * 1000; // UTC-5 en milisegundos
  const peruTime = new Date(now.getTime() + peruOffset);
  
  if (fecha === "ayer") return subDays(peruTime, 1);
  if (fecha === "manana") return addDays(peruTime, 1);
  
  // Para 'hoy', simplemente usamos la fecha ajustada a Perú
  if (fecha === 'hoy') return peruTime;

  // Si es una fecha específica como '2023-12-25', la parseamos
  // Esto asume que la fecha viene sin zona horaria, y la tratamos como tal.
  const parsedDate = parseISO(fecha);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // Fallback a la hora de Perú si nada coincide
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
  
  // Ya no restringimos a solo hoy, ayer, mañana
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
