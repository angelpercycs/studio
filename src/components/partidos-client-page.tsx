"use client";

import { useMemo } from "react";
import { DailyMatches } from "@/components/daily-matches";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { addDays, subDays, format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export function PartidosClientPage({ initialMatches, error, fecha }: { initialMatches: any[], error: string | null, fecha: string }) {
  
  const { pageLinks } = useMemo(() => {
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

    const todayString = format(nowInLima, 'yyyy-MM-dd');

    const getPageData = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        
        let href: string;
        let value: string;
        let label: string;

        if (dateString === todayString) {
            href = '/';
            value = 'today';
            label = 'Hoy';
        } else if (dateString === format(subDays(nowInLima, 1), 'yyyy-MM-dd')) {
            href = '/partidos/ayer';
            value = 'ayer';
            label = 'Ayer';
        } else if (dateString === format(addDays(nowInLima, 1), 'yyyy-MM-dd')) {
            href = '/partidos/manana';
            value = 'manana';
            label = 'Mañana';
        } else {
            href = `/partidos/${dateString}`;
            value = dateString;
            const dayName = format(date, "EEEE", { locale: es });
            label = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        }
        return { href, value, label };
    };

    const prevDate = subDays(currentDate, 1);
    const nextDate = addDays(currentDate, 1);
    
    return { 
        pageLinks: {
            prev: getPageData(prevDate),
            current: getPageData(currentDate),
            next: getPageData(nextDate)
        }
    };
  }, [fecha]);

  const tabValue = fecha === 'hoy' ? 'today' : pageLinks.current.value;

  return (
    <div>
        <Tabs defaultValue={tabValue} className="w-full">
             <div className="flex items-center justify-center space-x-2">
                <Button asChild variant="outline" size="icon">
                    <Link href={pageLinks.prev.href} aria-label="Día anterior">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <TabsList className="grid w-full grid-cols-3 flex-grow">
                    <Link href={pageLinks.prev.href} className="flex-1">
                        <TabsTrigger value={pageLinks.prev.value} className="w-full">{pageLinks.prev.label}</TabsTrigger>
                    </Link>
                    <Link href={pageLinks.current.href} className="flex-1">
                        <TabsTrigger value={pageLinks.current.value} className="w-full">{pageLinks.current.label}</TabsTrigger>
                    </Link>
                    <Link href={pageLinks.next.href} className="flex-1">
                        <TabsTrigger value={pageLinks.next.value} className="w-full">{pageLinks.next.label}</TabsTrigger>
                    </Link>
                </TabsList>
                 <Button asChild variant="outline" size="icon">
                    <Link href={pageLinks.next.href} aria-label="Día siguiente">
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </Tabs>
      <DailyMatches initialMatches={initialMatches || []} error={error} />
    </div>
  );
}
