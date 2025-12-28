"use client";

import { DailyMatches } from "@/components/daily-matches";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PartidosClientPage({ initialMatches, error, fecha }: { initialMatches: any[], error: string | null, fecha: string }) {
  
  const tabValue = fecha === 'hoy' ? 'today' : fecha;

  return (
    <div>
        <Tabs defaultValue={tabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <Link href="/partidos/ayer" className="flex-1">
                    <TabsTrigger value="ayer" className="w-full">Ayer</TabsTrigger>
                </Link>
                 <Link href="/" className="flex-1">
                    <TabsTrigger value="today" className="w-full">Hoy</TabsTrigger>
                </Link>
                 <Link href="/partidos/manana" className="flex-1">
                    <TabsTrigger value="manana" className="w-full">Mañana</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
      <DailyMatches initialMatches={initialMatches || []} error={error} />
    </div>
  );
}
