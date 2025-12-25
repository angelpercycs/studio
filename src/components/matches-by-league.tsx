"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCountries, getSeasonsByCountry, getLeaguesByCountryAndSeason, getRoundsForLeague, getMatchesByRound } from "@/app/actions/getRoundData";
import { MatchList } from "./match-list";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";

interface Country {
  id: string;
  name: string;
  flag: string | null;
}

interface League {
  id: string;
  name: string;
}

const PINNED_MATCHES_STORAGE_KEY = 'pinnedLeagueMatches';

const getInitialPinnedMatches = (): Set<string> => {
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


export function MatchesByLeague() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<Set<string>>(getInitialPinnedMatches());

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const expiry = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
        const dataToSave = JSON.stringify({ ids: Array.from(pinnedMatchIds), expiry });
        localStorage.setItem(PINNED_MATCHES_STORAGE_KEY, dataToSave);
    }
  }, [pinnedMatchIds]);


  const [loading, setLoading] = useState({
    countries: true,
    seasons: false,
    leagues: false,
    rounds: false,
    matches: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(prev => ({ ...prev, countries: true }));
      setError(null);
      const result = await getCountries();
      if (result && result.error) {
        setError(result.error);
      } else if (result && result.data) {
        setCountries(result.data as Country[]);
      }
      setLoading(prev => ({ ...prev, countries: false }));
    };
    fetchCountries();
  }, []);

  const handleCountryChange = useCallback(async (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedSeason(null);
    setSelectedLeague(null);
    setSelectedRound(null);
    setSeasons([]);
    setLeagues([]);
    setRounds([]);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!countryId) return;

    setLoading(prev => ({ ...prev, seasons: true }));
    const result = await getSeasonsByCountry(countryId);
    if (result && result.error) {
      setError(result.error);
      setSeasons([]);
    } else if (result && result.data && result.data.length > 0) {
      setSeasons(result.data as string[]);
      // Automatically select the most recent season
      handleSeasonChange(result.data[0], countryId);
    }
    setLoading(prev => ({ ...prev, seasons: false }));
  }, []);

  const handleSeasonChange = useCallback(async (season: string, countryId?: string) => {
    const finalCountryId = countryId || selectedCountry;
    setSelectedSeason(season);
    setSelectedLeague(null);
    setSelectedRound(null);
    setLeagues([]);
    setRounds([]);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!season || !finalCountryId) return;

    setLoading(prev => ({ ...prev, leagues: true }));
    const result = await getLeaguesByCountryAndSeason(finalCountryId, season);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setLeagues(result.data as League[]);
    }
    setLoading(prev => ({ ...prev, leagues: false }));
  }, [selectedCountry]);

  const handleLeagueChange = useCallback(async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedRound(null);
    setRounds([]);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!leagueId || !selectedSeason) return;
    
    setLoading(prev => ({ ...prev, rounds: true }));
    const result = await getRoundsForLeague(leagueId, selectedSeason);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setRounds(result.data as string[]);
    }
    setLoading(prev => ({ ...prev, rounds: false }));
  }, [selectedSeason]);

  const handleRoundChange = useCallback(async (round: string) => {
    setSelectedRound(round);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!round || !selectedLeague || !selectedSeason) return;
    
    setLoading(prev => ({ ...prev, matches: true }));
    const result = await getMatchesByRound(selectedLeague, selectedSeason, round);
    if (result && result.error) {
      setError(result.error);
      setMatches([]);
    } else if (result && result.data) {
      setMatches(result.data);
    }
    setLoading(prev => ({ ...prev, matches: false }));
  }, [selectedLeague, selectedSeason]);

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
    if (loading.matches) return 0;
    return matches.filter(match => match.favorite).length;
  }, [matches, loading.matches]);

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
      <CardHeader>
        <CardTitle>Búsqueda por Jornada</CardTitle>
        <CardDescription>Selecciona un país, temporada, liga y jornada para ver los encuentros.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="grid gap-2">
            <Label htmlFor="country">País</Label>
            <Select onValueChange={handleCountryChange} value={selectedCountry ?? ''} disabled={loading.countries}>
              <SelectTrigger id="country" aria-label="Seleccionar país">
                <SelectValue placeholder={loading.countries ? "Cargando..." : "Seleccionar país"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    <div className="flex items-center gap-2">
                      {country.flag && (
                        <img 
                          src={country.flag}
                          alt={country.name}
                          className="h-5 w-5"
                        />
                      )}
                      <span>{country.name}</span>
                    </div>
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="season">Temporada</Label>
            <Select onValueChange={(value) => handleSeasonChange(value)} value={selectedSeason ?? ''} disabled={!selectedCountry || loading.seasons}>
              <SelectTrigger id="season" aria-label="Seleccionar temporada">
                <SelectValue placeholder={loading.seasons ? "Cargando..." : (seasons.length > 0 ? "Seleccionar temporada" : "No hay temporadas")} />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="league">Liga</Label>
            <Select onValueChange={handleLeagueChange} value={selectedLeague ?? ''} disabled={!selectedSeason || loading.leagues}>
              <SelectTrigger id="league" aria-label="Seleccionar liga">
                <SelectValue placeholder={loading.leagues ? "Cargando..." : (leagues.length > 0 ? "Seleccionar liga" : "No hay ligas")} />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id.toString()}>{league.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="round">Jornada</Label>
            <Select onValueChange={handleRoundChange} value={selectedRound ?? ''} disabled={!selectedLeague || loading.rounds}>
              <SelectTrigger id="round" aria-label="Seleccionar jornada">
                <SelectValue placeholder={loading.rounds ? "Cargando..." : (rounds.length > 0 ? "Seleccionar jornada" : "No hay jornadas")} />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round} value={round}>{round}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {favoriteMatchesCount > 0 && (
            <Alert variant="destructive" className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                  </div>
                  <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con Pronostico disponibles! ({favoriteMatchesCount})</AlertTitle>
                </div>
                <Button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                  {showOnlyFavorites ? 'Mostrar todos' : 'Mostrar solo favoritos'}
                </Button>
              </div>
            </Alert>
        )}

        {loading.matches ? (
            <div className="space-y-4 mt-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
        ) : selectedRound ? (
          <MatchList 
            matches={unpinned}
            pinnedMatches={pinned}
            error={error} 
            loading={loading.matches}
            onPinToggle={handlePinToggle}
            pinnedMatchIds={pinnedMatchIds}
          />
        ) : (
          <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
            <p>Selecciona los filtros para buscar encuentros.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
