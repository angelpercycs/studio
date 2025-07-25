"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCountries, getLeaguesByCountry, getRoundsForLeague, getMatchesByRound } from "@/app/actions/getRoundData";
import { MatchList } from "./match-list";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";

interface Country {
  id: string;
  name: string;
}

interface League {
  id: string; // This will be composite `league_id-season`
  name: string;
  league_id: string; // The actual league_id from DB
  season: string;
}

export function MatchesByLeague() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [loading, setLoading] = useState({
    countries: true,
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
    setSelectedLeague(null);
    setSelectedRound(null);
    setLeagues([]);
    setRounds([]);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!countryId) return;

    setLoading(prev => ({ ...prev, leagues: true }));
    const result = await getLeaguesByCountry(countryId);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setLeagues(result.data as League[]);
    }
    setLoading(prev => ({ ...prev, leagues: false }));
  }, []);

  const handleLeagueChange = useCallback(async (leagueIdSeason: string) => {
    setSelectedLeague(leagueIdSeason);
    setSelectedRound(null);
    setRounds([]);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!leagueIdSeason) return;
    
    const leagueData = leagues.find(l => l.id === leagueIdSeason);
    if (!leagueData) return;
    
    setLoading(prev => ({ ...prev, rounds: true }));
    const result = await getRoundsForLeague(leagueData.league_id, leagueData.season);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setRounds(result.data as string[]);
    }
    setLoading(prev => ({ ...prev, rounds: false }));
  }, [leagues]);

  const handleRoundChange = useCallback(async (round: string) => {
    setSelectedRound(round);
    setMatches([]);
    setError(null);
    setShowOnlyFavorites(false);
    if (!round || !selectedLeague) return;

    const leagueData = leagues.find(l => l.id === selectedLeague);
    if (!leagueData) return;
    
    setLoading(prev => ({ ...prev, matches: true }));
    const result = await getMatchesByRound(leagueData.league_id, leagueData.season, round);
    if (result && result.error) {
      setError(result.error);
      setMatches([]);
    } else if (result && result.data) {
      setMatches(result.data);
    }
    setLoading(prev => ({ ...prev, matches: false }));
  }, [selectedLeague, leagues]);

  const hasAnyFavorite = useMemo(() => {
    return !loading.matches && matches.some(match => match.favorite);
  }, [matches, loading.matches]);

  const filteredMatches = useMemo(() => {
    if (showOnlyFavorites) {
      return matches.filter(match => match.favorite);
    }
    return matches;
  }, [matches, showOnlyFavorites]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Búsqueda por Jornada</CardTitle>
        <CardDescription>Selecciona un país, liga y jornada para ver los encuentros.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="grid gap-2">
            <Label htmlFor="country">País</Label>
            <Select onValueChange={handleCountryChange} value={selectedCountry ?? ''} disabled={loading.countries}>
              <SelectTrigger id="country" aria-label="Seleccionar país">
                <SelectValue placeholder={loading.countries ? "Cargando..." : "Seleccionar país"} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="league">Liga por año</Label>
            <Select onValueChange={handleLeagueChange} value={selectedLeague ?? ''} disabled={!selectedCountry || loading.leagues}>
              <SelectTrigger id="league" aria-label="Seleccionar liga">
                <SelectValue placeholder={loading.leagues ? "Cargando..." : (leagues.length > 0 ? "Seleccionar liga" : "No hay ligas")} />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>{league.name}</SelectItem>
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
        
        {hasAnyFavorite && (
            <Alert variant="destructive" className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                    <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                </div>
                <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con favorito disponibles!</AlertTitle>
              </div>
              <Button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                {showOnlyFavorites ? 'Mostrar todos' : 'Mostrar solo favoritos'}
              </Button>
            </Alert>
        )}

        {loading.matches ? (
            <div className="space-y-4 mt-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
        ) : selectedRound ? (
          <MatchList matches={filteredMatches} error={error} loading={loading.matches} />
        ) : (
          <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
            <p>Selecciona los filtros para buscar encuentros.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
