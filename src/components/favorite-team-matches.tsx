"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MatchDay = ({ matchday, matches, selectedTeamId }: { matchday: string, matches: any[], selectedTeamId: string | null }) => {
    if (!matches || matches.length === 0) return null;

    const match = matches[0];
    const team1Stats = match.team1_standings;
    const team2Stats = match.team2_standings;
    const isUpcoming = match.team1_score === null || match.team2_score === null;
    
    const isTeam1Selected = selectedTeamId === match.team1.id;

    const upcomingDate = isUpcoming 
        ? format(new Date(match.match_date_iso), "d MMM", { locale: es })
        : null;

    const fullMatchdayName = `Jornada ${match.matchday || 'Desconocida'}`;

    return (
        <Card className="mb-4">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px] text-sm font-medium text-muted-foreground">
                                <div className="flex items-baseline">
                                  <span>{fullMatchdayName}</span>
                                  {isUpcoming && upcomingDate && <span className="text-xs ml-2">({upcomingDate})</span>}
                                </div>
                            </TableHead>
                            <TableHead className="text-center">PJ</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">E</TableHead>
                            <TableHead className="text-center">P</TableHead>
                            <TableHead className="text-center">GF</TableHead>
                            <TableHead className="text-center">GC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className={cn("font-medium", !isTeam1Selected && "text-muted-foreground")}>
                                <div className="flex items-center">
                                    <span>{match.team1.name}</span>
                                    <span className="ml-auto">{match.team1_score}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{team1Stats?.played ?? '-'}</TableCell>
                            <TableCell className="text-center">{team1Stats?.won ?? '-'}</TableCell>
                            <TableCell className="text-center">{team1Stats?.drawn ?? '-'}</TableCell>
                            <TableCell className="text-center">{team1Stats?.lost ?? '-'}</TableCell>
                            <TableCell className="text-center">{team1Stats?.goalsFor ?? '-'}</TableCell>
                            <TableCell className="text-center">{team1Stats?.goalsAgainst ?? '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                           <TableCell className={cn("font-medium", isTeam1Selected && "text-muted-foreground")}>
                                <div className="flex items-center">
                                    <span>{match.team2.name}</span>
                                    <span className="ml-auto">{match.team2_score}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{team2Stats?.played ?? '-'}</TableCell>
                            <TableCell className="text-center">{team2Stats?.won ?? '-'}</TableCell>
                            <TableCell className="text-center">{team2Stats?.drawn ?? '-'}</TableCell>
                            <TableCell className="text-center">{team2Stats?.lost ?? '-'}</TableCell>
                            <TableCell className="text-center">{team2Stats?.goalsFor ?? '-'}</TableCell>
                            <TableCell className="text-center">{team2Stats?.goalsAgainst ?? '-'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
};


export const FavoriteTeamMatches = ({ matches, error, loading, selectedTeamId }: { matches: any[], error: string | null, loading: boolean, selectedTeamId: string | null }) => {
  if (loading) {
    return null;
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
    return null;
  }

  const groupedByMatchday = matches.reduce((acc, match) => {
    const matchday = match.matchday || 'Sin Jornada';
    if (!acc[matchday]) {
        acc[matchday] = [];
    }
    acc[matchday].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedMatchdays = Object.keys(groupedByMatchday).sort((a,b) => {
      const isUpcomingA = groupedByMatchday[a][0].team1_score === null;
      if (isUpcomingA) return -1;
      const numA = parseInt(a.toString().replace( /^\D+/g, '') || '0');
      const numB = parseInt(b.toString().replace( /^\D+/g, '') || '0');
      return numB - numA;
  });
  
  const upcomingMatch = matches.find(m => m.team1_score === null);

  return (
    <div className="w-full space-y-4 mt-4">
       {upcomingMatch && <h3 className="text-lg font-semibold">Próximo Partido</h3>}
       {sortedMatchdays.map(matchday => {
            const match = groupedByMatchday[matchday][0];
            const isUpcoming = match.team1_score === null;
            if (isUpcoming) {
                return <MatchDay key={matchday} matchday={matchday} matches={groupedByMatchday[matchday]} selectedTeamId={selectedTeamId} />;
            }
            return null;
       })}

       {matches.some(m => m.team1_score !== null) && <h3 className="text-lg font-semibold mt-6">Partidos Jugados</h3>}
       {sortedMatchdays.map(matchday => {
           const match = groupedByMatchday[matchday][0];
           const isUpcoming = match.team1_score === null;
           if (!isUpcoming) {
             return <MatchDay key={matchday} matchday={matchday} matches={groupedByMatchday[matchday]} selectedTeamId={selectedTeamId} />;
           }
           return null;
       })}
    </div>
  );
};
