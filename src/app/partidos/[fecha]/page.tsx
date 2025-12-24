import { getMatchesByDate } from "@/app/actions/getMatches";
import { PartidosClientPage } from "@/components/partidos-client-page";
import { addDays, subDays, format } from "date-fns";

export async function generateStaticParams() {
  return [{ fecha: 'hoy' }, { fecha: 'ayer' }, { fecha: 'manana' }];
}

export default async function Page({ params }: { params: { fecha: string } }) {
  const { fecha } = params;
  
  if (!["hoy", "ayer", "manana"].includes(fecha)) {
    // This should not happen with generateStaticParams, but as a fallback.
    return { notFound: true };
  }

  let date;
  if (fecha === "ayer") date = subDays(new Date(), 1);
  else if (fecha === "manana") date = addDays(new Date(), 1);
  else date = new Date();

  const dateString = format(date, "yyyy-MM-dd");
  const { data: initialMatches, error } = await getMatchesByDate(dateString);

  return (
    <PartidosClientPage
      initialMatches={initialMatches || []}
      error={error}
      fecha={fecha}
    />
  );
}
