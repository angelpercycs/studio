"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { getMatchesByDate } from "@/app/actions/getRoundData";
import { MatchList } from "@/components/match-list";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdBanner } from "./ad-banner";

const PINNED_MATCHES_STORAGE_KEY = 'pinnedDateMatches';

function getInitialPinnedMatches(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const saved = localStorage.getItem(PINNED_MATCHES_STORAGE_KEY);
  if (saved) {
    try {
      const { ids, expiry } = JSON.parse(saved);
      if (new Date().getTime() < expiry) {
        return new Set(ids);
      }
       localStorage.removeItem(PINNED_MATCHES_STORAGE_KEY);
    } catch (e) {
      console.error("Error parsing pinned matches", e);
    }
  }
  return new Set();
};


export function MatchesByDate() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAll, setShowAll] = useState(true);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<Set<string>>(getInitialPinnedMatches);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const expiry = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
        const dataToSave = JSON.stringify({ ids: Array.from(pinnedMatchIds), expiry });
        localStorage.setItem(PINNED_MATCHES_STORAGE_KEY, dataToSave);
    }
  }, [pinnedMatchIds]);


  const fetchMatches = useCallback(async (date: Date | undefined) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    setMatches([]);

    const dateString = format(date, 'yyyy-MM-dd');
    const result = await getMatchesByDate(dateString);

    if (result && result.error) {
      setError(result.error);
      setShowAll(true);
    } else if (result && result.data) {
      setMatches(result.data);
      setShowAll(!result.data.some(m => m.favorite));
    } else {
        setError("No se pudieron cargar los partidos. Por favor, inténtelo de nuevo más tarde.");
        setShowAll(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchMatches(selectedDate);
    }
  }, [selectedDate, fetchMatches]);

  const handlePinToggle = useCallback((matchId: string) => {
    setPinnedMatchIds(prev => {
        const newPinned = new Set(prev);
        if (newPinned.has(matchId)) {
            newPinned.delete(matchId);
        } else {
            newPinned.add(matchId);
        }
        return newPinned;
    });
  }, []);

  const favoriteMatchesCount = useMemo(() => {
    if (loading) return 0;
    return matches.filter(match => match.favorite).length;
  }, [matches, loading]);

  const { pinned, unpinned } = useMemo(() => {
    const pinnedSet = new Set(pinnedMatchIds);
    const pinned: any[] = [];
    const unpinned: any[] = [];

    const sourceMatches = showAll ? matches : matches.filter(match => match.favorite);

    matches.forEach(match => {
      if (pinnedSet.has(match.id)) {
        pinned.push(match);
      }
    });

    const unpinnedSource = sourceMatches.filter(m => !pinnedSet.has(m.id));
    unpinned.push(...unpinnedSource);

    return { pinned, unpinned };
  }, [matches, pinnedMatchIds, showAll]);


  const formatDateWithDay = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Búsqueda por Fecha</CardTitle>
        <CardDescription>Selecciona una fecha para ver todos los encuentros programados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? formatDateWithDay(selectedDate) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        {favoriteMatchesCount > 0 && (
          <Alert variant="destructive" className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                    <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                </div>
                <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con Pronóstico Estadístico! ({favoriteMatchesCount})</AlertTitle>
              </div>
              <Button onClick={() => setShowAll(!showAll)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                {showAll ? 'Mostrar solo pronósticos' : 'Mostrar todos los partidos'}
              </Button>
            </div>
          </Alert>
        )}
        <MatchList 
            matches={unpinned}
            pinnedMatches={pinned}
            error={error} 
            loading={loading}
            onPinToggle={handlePinToggle}
            pinnedMatchIds={pinnedMatchIds}
            adBanner={<AdBanner />}
        />
      </CardContent>
    </Card>
  );
}
