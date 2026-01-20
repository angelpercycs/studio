"use client";

import { useMemo } from "react";
import { DailyMatches } from "@/components/daily-matches";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { addDays, subDays, format, parseISO, isValid } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export function PartidosClientPage({ initialMatches, error, fecha }: { initialMatches: any[], error: string | null, fecha: string }) {
  
  const tabValue = fecha === 'hoy' ? 'today' : fecha;

  const { prevLink, nextLink } = useMemo(() => {
    const nowInLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    let currentDate: Date;
    if (fecha === 'hoy') {
        currentDate = nowInLima;
    } else if (fecha === 'ayer') {
        currentDate = subDays(nowInLima, 1);
    } else if (fecha === 'manana') {
        currentDate = addDays(nowInLima, 1);
    } else {
        const parsed = parseISO(fecha);
        currentDate = isValid(parsed) ? parsed : nowInLima;
    }

    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);

    const todayString = format(nowInLima, 'yyyy-MM-dd');
    const yesterdayString = format(subDays(nowInLima, 1), 'yyyy-MM-dd');
    const tomorrowString = format(addDays(nowInLima, 1), 'yyyy-MM-dd');

    const prevDateString = format(prevDate, 'yyyy-MM-dd');
    const nextDateString = format(nextDate, 'yyyy-MM-dd');

    let finalPrevLink: string;
    if (prevDateString === todayString) {
        finalPrevLink = '/';
    } else if (prevDateString === yesterdayString) {
        finalPrevLink = '/partidos/ayer';
    } else {
        finalPrevLink = `/partidos/${prevDateString}`;
    }

    let finalNextLink: string;
    if (nextDateString === todayString) {
        finalNextLink = '/';
    } else if (nextDateString === tomorrowString) {
        finalNextLink = '/partidos/manana';
    } else {
        finalNextLink = `/partidos/${nextDateString}`;
    }
    
    return { prevLink: finalPrevLink, nextLink: finalNextLink };
  }, [fecha]);

  return (
    <div>
        <Tabs defaultValue={tabValue} className="w-full">
             <div className="flex items-center justify-center space-x-2">
                <Button asChild variant="outline" size="icon">
                    <Link href={prevLink} aria-label="Día anterior">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <TabsList className="grid w-full grid-cols-3 flex-grow">
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
                 <Button asChild variant="outline" size="icon">
                    <Link href={nextLink} aria-label="Día siguiente">
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </Tabs>
      <DailyMatches initialMatches={initialMatches || []} error={error} />
    </div>
  );
}
