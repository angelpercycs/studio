"use client";

import { DailyMatches } from "@/components/daily-matches";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PartidosClientPage({ initialMatches, error, fecha }: { initialMatches: any[], error: string | null, fecha: string }) {
  
  const tabMapping: { [key: string]: string } = {
    hoy: 'today',
    ayer: 'yesterday',
    manana: 'tomorrow'
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
                 <Link href="/partidos/manana" className="flex-1">
                    <TabsTrigger value="tomorrow" className="w-full">Mañana</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
      <DailyMatches initialMatches={initialMatches || []} error={error} />
    </div>
  );
}
