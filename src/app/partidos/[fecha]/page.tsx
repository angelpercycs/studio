import { getMatchesByDate } from "@/app/actions/getMatches";
import { DailyMatches } from "@/components/daily-matches";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, subDays, format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { fecha: string } }) {
  const { fecha } = params;

  if (!["hoy", "ayer", "mañana"].includes(fecha)) {
    notFound();
  }

  let date;
  if (fecha === "ayer") date = subDays(new Date(), 1);
  else if (fecha === "mañana") date = addDays(new Date(), 1);
  else date = new Date();

  const dateString = format(date, "yyyy-MM-dd");
  const { data: initialMatches, error } = await getMatchesByDate(dateString);

  const tabMapping: { [key: string]: string } = {
    hoy: 'today',
    ayer: 'yesterday',
    mañana: 'tomorrow'
  }

  return (
    <div>
        <Tabs defaultValue={tabMapping[fecha]} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <Link href="/partidos/ayer" className="flex-1">
                    <TabsTrigger value="yesterday" className="w-full">Ayer</TabsTrigger>
                </Link>
                 <Link href="/partidos/hoy" className="flex-1">
                    <TabsTrigger value="today" className="w-full">Hoy</TabsTrigger>
                </Link>
                 <Link href="/partidos/mañana" className="flex-1">
                    <TabsTrigger value="tomorrow" className="w-full">Mañana</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
      <DailyMatches initialMatches={initialMatches || []} error={error} />
    </div>
  );
}

export function generateStaticParams() {
  return [{ fecha: 'hoy' }, { fecha: 'ayer' }, { fecha: 'mañana' }];
}
