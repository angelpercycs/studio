"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMatchesByDate } from "@/app/actions/getRoundData";
import { MatchList } from "@/components/match-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./ad-banner";
import { useUserProfile } from "@/hooks/use-user-profile";

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
    if (loading) return [];
    return matches.filter(match => match.favorite);
  }, [matches, loading]);

  const visiblePredictionIds = useMemo(() => {
    // Donors see all predictions (handled by canViewPrediction prop), registered users see 20%
    if (isDonor || !user) {
        return new Set<string>();
    }
    const twentyPercentCount = Math.floor(predictionMatches.length * 0.2);
    return new Set(predictionMatches.slice(0, twentyPercentCount).map(m => m.id));
  }, [predictionMatches, user, isDonor]);

  const { pinned, unpinned } = useMemo(() => {
    const pinnedSet = new Set(pinnedMatchIds);
    const pinned: any[] = [];
    const unpinned: any[] = [];

    matches.forEach(match => {
      if (pinnedSet.has(match.id)) {
        pinned.push(match);
      } else {
        unpinned.push(match);
      }
    });
    
    return { pinned, unpinned };
  }, [matches, pinnedMatchIds]);

  const analysisMatches = useMemo(() => {
    return initialMatches.filter(match => match.text_analysis);
  }, [initialMatches]);


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
                  user={user}
                  isDonor={isDonor}
                  visiblePredictionIds={visiblePredictionIds}
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
