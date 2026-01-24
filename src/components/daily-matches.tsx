"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMatchesByDate } from "@/app/actions/getRoundData";
import { MatchList } from "@/components/match-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./ad-banner";
import { useUserProfile } from "@/hooks/use-user-profile";
import Link from "next/link";


const PINNED_MATCHES_STORAGE_KEY = 'pinnedDailyMatches';

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

export function DailyMatches({ initialMatches, error: initialError }: { initialMatches: any[], error: string | null }) {
  const { user, isDonor, isLoading: isProfileLoading } = useUserProfile();
  const [matches, setMatches] = useState<any[]>(initialMatches);
  const [loading, setLoading] = useState(isProfileLoading);
  const [error, setError] = useState<string | null>(initialError);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<Set<string>>(getInitialPinnedMatches);
  const [showAll, setShowAll] = useState(true);
  
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    setLoading(isProfileLoading);
  },[isProfileLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const expiry = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
        const dataToSave = JSON.stringify({ ids: Array.from(pinnedMatchIds), expiry });
        localStorage.setItem(PINNED_MATCHES_STORAGE_KEY, dataToSave);
    }
  }, [pinnedMatchIds]);
  
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

  const predictionMatches = useMemo(() => {
    return matches.filter(match => match.favorite);
  }, [matches]);
  
  const nonPredictionMatches = useMemo(() => {
    return matches.filter(match => !match.favorite);
  }, [matches]);

  const visiblePredictionMatches = useMemo(() => {
    if (isDonor) return predictionMatches;
    if (user) {
      const twentyPercentCount = Math.floor(predictionMatches.length * 0.2);
      return predictionMatches.slice(0, twentyPercentCount);
    }
    return [];
  }, [predictionMatches, user, isDonor]);

  useEffect(() => {
    setShowAll(visiblePredictionMatches.length === 0);
  }, [visiblePredictionMatches]);

  const displayedMatches = useMemo(() => {
    if (showAll) {
      const allDisplayable = [...nonPredictionMatches, ...visiblePredictionMatches];
      allDisplayable.sort((a, b) => new Date(a.match_date_iso).getTime() - new Date(b.match_date_iso).getTime());
      return allDisplayable;
    }
    return visiblePredictionMatches;
  }, [showAll, nonPredictionMatches, visiblePredictionMatches]);

  const { pinned, unpinned } = useMemo(() => {
    const pinnedSet = new Set(pinnedMatchIds);
    const pinned: any[] = [];
    const unpinned: any[] = [];

    displayedMatches.forEach(match => {
      if (pinnedSet.has(match.id)) {
        pinned.push(match);
      } else {
        unpinned.push(match);
      }
    });
    
    return { pinned, unpinned };
  }, [displayedMatches, pinnedMatchIds]);

  const analysisMatches = useMemo(() => {
    const visibleMatchIds = new Set(displayedMatches.map(m => m.id));
    return initialMatches.filter(match => match.text_analysis && visibleMatchIds.has(match.id));
  }, [initialMatches, displayedMatches]);


  return (
    <>
      <Card>
        <CardContent className="pt-6">
            <div className="mt-4">
              {predictionMatches.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3">
                          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                          <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                      </div>
                      <AlertTitle className="font-semibold text-destructive-foreground">¡Hay {predictionMatches.length} Partidos con Pronóstico Estadístico!</AlertTitle>
                    </div>
                     {nonPredictionMatches.length > 0 && (
                        <Button onClick={() => setShowAll(!showAll)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                        {showAll ? 'Mostrar solo pronósticos' : 'Mostrar todos los partidos'}
                        </Button>
                    )}
                  </div>
                   {!isDonor && (
                      <div className="text-destructive-foreground text-sm mt-2">
                          {user ? (
                              <span>Dona para ver todos los pronósticos. <Link href="https://ko-fi.com/futbolstatszone" target="_blank" rel="noopener noreferrer" className="font-bold underline">Apoya aquí</Link></span>
                          ) : (
                              <span><Link href="/login" className="font-bold underline">Regístrate gratis</Link> para ver el 20% de los pronósticos.</span>
                          )}
                      </div>
                  )}
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
                  user={user}
                  isDonor={isDonor}
              />
            </div>
        </CardContent>
      </Card>

      {analysisMatches.length > 0 && (
          <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Análisis Profundo de la Jornada</h2>
              <div className="space-y-6">
                  {analysisMatches.map(match => (
                      <Card key={match.id} id={`analysis-${match.id}`} className="scroll-mt-20">
                          <CardHeader>
                              <CardTitle>{match.team1?.name} vs {match.team2?.name}</CardTitle>
                              <CardDescription>{match.league?.name}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <p className="text-justify whitespace-pre-wrap">{match.text_analysis}</p>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      )}
    </>
  );
}
