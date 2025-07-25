"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

const MatchDaySkeleton = () => (
  <div className="space-y-4 mt-6">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

const StandingsTable = ({ title, homeStats, awayStats, homeName, awayName }: { title: string, homeStats: any, awayStats: any, homeName: string, awayName: string }) => {
    if (!homeStats || !awayStats) {
        return (
            <div className="my-4 text-center text-muted-foreground">
                Datos de clasificación no disponibles.
            </div>
        );
    }
    return (
        <div className="my-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Equipo</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>G</TableHead>
                <TableHead>E</TableHead>
                <TableHead>P</TableHead>
                <TableHead>GF</TableHead>
                <TableHead>GC</TableHead>
                <TableHead className="font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{homeName}</TableCell>
                <TableCell>{homeStats.played}</TableCell>
                <TableCell>{homeStats.won}</TableCell>
                <TableCell>{homeStats.drawn}</TableCell>
                <TableCell>{homeStats.lost}</TableCell>
                <TableCell>{homeStats.goalsFor}</TableCell>
                <TableCell>{homeStats.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{homeStats.points}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{awayName}</TableCell>
                <TableCell>{awayStats.played}</TableCell>
                <TableCell>{awayStats.won}</TableCell>
                <TableCell>{awayStats.drawn}</TableCell>
                <TableCell>{awayStats.lost}</TableCell>
                <TableCell>{awayStats.goalsFor}</TableCell>
                <TableCell>{awayStats.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{awayStats.points}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
    );
};

const MatchRow = ({ match }: { match: any }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const timeDisplay = match.match_date_iso 
      ? new Date(match.match_date_iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
      : '--:--';

  const isFavoriteTeam1 = match.favorite === 'team1';
  const isFavoriteTeam2 = match.favorite === 'team2';

  const BlinkingLight = () => (
    <div className="relative flex h-3 w-3 mx-2">
      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
      <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
    </div>
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
         <div className="flex items-center w-full px-4 py-3 hover:bg-muted/50 cursor-pointer">
            <div className="w-16 text-muted-foreground text-center text-sm">{timeDisplay}</div>
            <div className="flex-grow space-y-1 text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex-grow text-left flex items-center">
                        <span>{match.team1?.name ?? 'Equipo no encontrado'}</span>
                        {isFavoriteTeam1 && <BlinkingLight />}
                    </div>
                    <span className="font-bold w-6 text-center">{match.team1_score ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex-grow text-left flex items-center">
                        <span>{match.team2?.name ?? 'Equipo no encontrado'}</span>
                        {isFavoriteTeam2 && <BlinkingLight />}
                    </div>
                    <span className="font-bold w-6 text-center">{match.team2_score ?? '-'}</span>
                </div>
            </div>
          </div>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[90vw] sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle>{match.team1?.name} vs {match.team2?.name}</SheetTitle>
          <SheetDescription>
              {match.league?.name}
              <br />
              <span className="font-semibold">Todas las estadísticas son Pre-Jornada</span>
              <br />
              <span className="text-xs">Resultados de liga, dentro de los 90 minutos reglamentarios.</span>
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          {match.team1_standings && match.team2_standings && (
            <>
              <StandingsTable 
                title="Clasificación General"
                homeStats={match.team1_standings}
                awayStats={match.team2_standings}
                homeName={match.team1?.name}
                awayName={match.team2?.name}
              />
              <StandingsTable 
                title="Clasificación Local/Visitante"
                homeStats={match.team1_standings?.home}
                awayStats={match.team2_standings?.away}
                homeName={match.team1?.name}
                awayName={match.team2?.name}
              />
            </>
          )}
          {match.team1_last_3 && match.team2_last_3 && (
            <StandingsTable 
              title="Últimos 3 encuentros (General)"
              homeStats={match.team1_last_3}
              awayStats={match.team2_last_3}
              homeName={match.team1?.name}
              awayName={match.team2?.name}
            />
          )}
          {match.team1_last_3_home_away && match.team2_last_3_home_away && (
            <StandingsTable 
              title="Últimos 3 encuentros (Local/Visitante)"
              homeStats={match.team1_last_3_home_away}
              awayStats={match.team2_last_3_home_away}
              homeName={match.team1?.name}
              awayName={match.team2?.name}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


export const MatchList = ({ matches, error, loading }: { matches: any[], error: string | null, loading: boolean }) => {

  if (loading) {
    return <MatchDaySkeleton />;
  }
  
  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
        <p>No hay encuentros para mostrar para esta fecha.</p>
      </div>
    );
  }

  const groupedByLeague = matches.reduce((acc, match) => {
    const leagueName = match.league?.name || 'Unknown League';
    if (!acc[leagueName]) {
      acc[leagueName] = {
        matches: [],
        country: match.league?.countries?.name || 'Unknown Country'
      };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, { matches: any[], country: string }>);

  const sortedLeagues = Object.entries(groupedByLeague).sort(([leagueA, dataA]: [string, any], [leagueB, dataB]: [string, any]) => {
    const countryCompare = dataA.country.localeCompare(dataB.country);
    if (countryCompare !== 0) {
      return countryCompare;
    }
    return leagueA.localeCompare(leagueB);
  });

  return (
    <div className="w-full space-y-4 mt-4">
      {sortedLeagues.map(([leagueName, { matches: leagueMatches, country }]: [string, any]) => {
        return (
          <Card key={leagueName}>
            <CardContent className="p-0">
              <div className="p-4 font-bold flex items-center gap-2 border-b bg-muted/20">
                <Flag className="h-5 w-5"/> {country} - {leagueName}
              </div>
              <div>
                <div className="divide-y">
                  {leagueMatches.map((match: any) => <MatchRow key={match.id} match={match} />)}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
};
