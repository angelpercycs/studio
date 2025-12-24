"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getMatchesByDate } from "@/app/actions/getMatches";
import { MatchList } from "@/components/match-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const [matches, setMatches] = useState<any[]>(initialMatches);
  const [loading, setLoading] = useState(false); // No loading initially as data is passed
  const [error, setError] = useState<string | null>(initialError);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<Set<string>>(getInitialPinnedMatches);
  
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

  const favoriteMatchesCount = useMemo(() => {
    if (loading) return 0;
    return matches.filter(match => match.favorite).length;
  }, [matches, loading]);

  const { pinned, unpinned } = useMemo(() => {
    const pinnedSet = new Set(pinnedMatchIds);
    const pinned: any[] = [];
    const unpinned: any[] = [];

    const sourceMatches = showOnlyFavorites ? matches.filter(match => match.favorite) : matches;

    matches.forEach(match => {
      if (pinnedSet.has(match.id)) {
        pinned.push(match);
      }
    });

    const unpinnedSource = sourceMatches.filter(m => !pinnedSet.has(m.id));
    unpinned.push(...unpinnedSource);
    
    return { pinned, unpinned };
  }, [matches, pinnedMatchIds, showOnlyFavorites]);

  return (
    <Card>
      <CardContent className="pt-6">
          <div className="mt-4">
            {favoriteMatchesCount > 0 && (
              <Alert variant="destructive" className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                        <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                    </div>
                    <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con favorito disponibles! ({favoriteMatchesCount})</AlertTitle>
                  </div>
                   <Button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                    {showOnlyFavorites ? 'Mostrar todos' : 'Mostrar solo favoritos'}
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
            />
          </div>
      </CardContent>
    </Card>
  );
}
