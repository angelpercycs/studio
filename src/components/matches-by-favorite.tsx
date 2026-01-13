"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCountries, getSeasonsByCountry, getLeaguesByCountryAndSeason, getTeamsByLeague, getTeamMatches } from "@/app/actions/getRoundData";
import { Skeleton } from "./ui/skeleton";
import { FavoriteTeamMatches } from "./favorite-team-matches";
import { Alert, AlertTitle } from "./ui/alert";
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

interface Team {
  id: string;
  name: string;
}

export function MatchesByFavorite() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);


  const [loading, setLoading] = useState({
    countries: true,
    seasons: false,
    leagues: false,
    teams: false,
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
    setSelectedTeam(null);
    setSeasons([]);
    setLeagues([]);
    setTeams([]);
    setMatches([]);
    setError(null);
    if (!countryId) return;

    setLoading(prev => ({ ...prev, seasons: true }));
    const result = await getSeasonsByCountry(countryId);
    if (result && result.error) {
      setError(result.error);
      setSeasons([]);
    } else if (result && result.data && result.data.length > 0) {
      setSeasons(result.data as string[]);
      handleSeasonChange(result.data[0], countryId);
    }
    setLoading(prev => ({ ...prev, seasons: false }));
  }, []);

  const handleSeasonChange = useCallback(async (season: string, countryId?: string) => {
    const finalCountryId = countryId || selectedCountry;
    setSelectedSeason(season);
    setSelectedLeague(null);
    setSelectedTeam(null);
    setLeagues([]);
    setTeams([]);
    setMatches([]);
    setError(null);
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
    setSelectedTeam(null);
    setTeams([]);
    setMatches([]);
    setError(null);
    if (!leagueId || !selectedSeason) return;

    setLoading(prev => ({ ...prev, teams: true }));
    const result = await getTeamsByLeague(leagueId, selectedSeason);
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setTeams(result.data as Team[]);
    }
    setLoading(prev => ({ ...prev, teams: false }));
  }, [selectedSeason]);

  const handleTeamChange = useCallback(async (teamId: string) => {
    setSelectedTeam(teamId);
    setMatches([]);
    setError(null);
    if (!teamId || !selectedLeague || !selectedSeason) return;

    setLoading(prev => ({ ...prev, matches: true }));
    const result = await getTeamMatches(teamId, selectedLeague, selectedSeason);
    if (result && result.error) {
      setError(result.error);
      setMatches([]);
    } else if (result && result.data) {
      setMatches(result.data);
    }
    setLoading(prev => ({ ...prev, matches: false }));
  }, [selectedLeague, selectedSeason]);
  
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
        <CardTitle>Búsqueda por Equipo Favorito</CardTitle>
        <CardDescription>Filtra para encontrar los partidos de tu equipo favorito.</CardDescription>
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
            <Label htmlFor="team">Equipo Favorito</Label>
            <Select onValueChange={handleTeamChange} value={selectedTeam ?? ''} disabled={!selectedLeague || loading.teams}>
              <SelectTrigger id="team" aria-label="Seleccionar equipo">
                <SelectValue placeholder={loading.teams ? "Cargando..." : (teams.length > 0 ? "Seleccionar equipo" : "No hay equipos")} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {hasAnyFavorite && (
            <Alert variant="destructive" className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                  </div>
                  <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con Pronóstico Estadístico!</AlertTitle>
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
        ) : selectedTeam ? (
          <FavoriteTeamMatches matches={filteredMatches} error={error} loading={loading.matches} selectedTeamId={selectedTeam} />
        ) : (
          <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
            <p>Selecciona los filtros para buscar un equipo.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
