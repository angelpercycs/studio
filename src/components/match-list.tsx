"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, Loader2, Pin, Share2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "./ui/progress";
import { getMatchStats } from "@/app/actions/getRoundData";
import { cn } from "@/lib/utils";
import { getMatchPrediction } from "@/ai/flows/get-match-prediction-flow";
import type { MatchPredictionOutput } from "@/ai/schemas/match-prediction-schemas";


const MatchDaySkeleton = () => (
  <div className="space-y-4 mt-6">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

const StatsSkeleton = () => (
    <div className="space-y-6 p-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/2 rounded" />
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
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

const MatchRow = ({ match, onPinToggle, isPinned }: { match: any, onPinToggle?: (matchId: string) => void, isPinned?: boolean }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);
  const [prediction, setPrediction] = useState<MatchPredictionOutput | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  const timeDisplay = match.match_date_iso 
      ? new Date(match.match_date_iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
      : '--:--';
  
  const isFavorite = prediction?.has_prediction && prediction.winner_name;
  const isFavoriteTeam1 = isFavorite && prediction?.winner_name === match.team1?.name;
  const isFavoriteTeam2 = isFavorite && prediction?.winner_name === match.team2?.name;

  const handleOpenSheet = useCallback(async () => {
    setIsSheetOpen(true);
    if (matchDetails) return;
    
    setDetailsLoading(true);
    setDetailsError(null);
    setPrediction(null);

    const result = await getMatchStats(match);
    
    if (result.error) {
      setDetailsError(result.error);
      setDetailsLoading(false);
      return;
    } 
    
    setMatchDetails(result.data);

    if (result.data?.team1_standings && result.data?.team2_standings && result.data?.team1_last_3 && result.data?.team2_last_3 && result.data?.team1_last_3_home_away && result.data?.team2_last_3_home_away) {
        try {
            const predictionInput = {
                team1Name: match.team1?.name,
                team2Name: match.team2?.name,
                team1_standings: result.data.team1_standings,
                team2_standings: result.data.team2_standings,
                team1_last_3: result.data.team1_last_3,
                team2_last_3: result.data.team2_last_3,
                team1_last_3_home_away: result.data.team1_last_3_home_away,
                team2_last_3_home_away: result.data.team2_last_3_home_away,
            };
            const pred = await getMatchPrediction(predictionInput);
            setPrediction(pred);
        } catch (e) {
            console.error("Error getting prediction", e);
        }
    }
    
    setDetailsLoading(false);

  }, [match, matchDetails]);

  const BlinkingLight = () => (
    <div className="relative flex h-2 w-2 ml-2">
      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
      <div className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></div>
    </div>
  );
  
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPinToggle?.(match.id);
  }

  const handleShare = async () => {
    if (!isFavorite) {
      alert("Este partido no tiene un pronóstico claro para compartir.");
      return;
    }
    const shareData = {
      title: `${match.team1?.name} vs ${match.team2?.name} - fszscore`,
      text: prediction?.prediction_text ? `🔥 ¡OJO CON ESTE DATO! 🔥\n🏟️ ${match.team1?.name} vs ${match.team2?.name}\n📊 Pronóstico: ${prediction.prediction_text}\n📈 Mira las estadísticas tipo StatsZone aquí:` : `Mira este partido en fszscore`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert("¡Pronóstico copiado! Pégalo en tu WhatsApp.");
      }
    } catch (err) {
       console.error("Share failed", err);
       alert("No se pudo compartir. Intenta copiar el texto.");
    }
  };

  return (
    <>
      <div onClick={handleOpenSheet} className="flex items-center w-full px-2 py-3 hover:bg-muted/50 cursor-pointer group">
        {onPinToggle && (
           <button onClick={handlePinClick} className="p-2 flex items-center justify-center">
            <div className={cn(
              "h-4 w-4 rounded-full border-2 border-foreground/50 transition-colors",
              isPinned && "bg-foreground border-foreground"
            )}></div>
          </button>
        )}
        <div className="w-14 text-muted-foreground text-center text-sm font-mono">{timeDisplay}</div>
        
        <div className="flex-grow space-y-1 text-sm pl-2">
            <div className="flex items-center">
                <span>{match.team1?.name ?? 'Equipo no encontrado'}</span>
            </div>
            <div className="flex items-center">
                <span>{match.team2?.name ?? 'Equipo no encontrado'}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-end w-[130px] flex-shrink-0 font-mono text-sm whitespace-nowrap pl-2">
            {match.odds ? (
                 <div className="flex justify-around items-center w-full text-center gap-2">
                     <span className="text-center w-1/3">{match.odds.home_odds?.toFixed(2)}</span>
                     <span className="text-center w-1/3">{match.odds.draw_odds?.toFixed(2)}</span>
                     <span className="text-center w-1/3">{match.odds.away_odds?.toFixed(2)}</span>
                </div>
            ) : <div className="w-[80px] h-4"></div>}
             <div className="flex flex-col items-center w-[40px] pl-2 text-base">
                 <span className="font-bold">{match.team1_score ?? '-'}</span>
                 <span className="font-bold">{match.team2_score ?? '-'}</span>
            </div>
        </div>

      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-[90vw] sm:max-w-xl overflow-y-auto">
          <SheetHeader className="text-left pb-4 border-b">
            <SheetTitle>{`${match.team1?.name} vs ${match.team2?.name} - Estadísticas de Fútbol (Tipo StatsZone) | fszscore`}</SheetTitle>
            
            <SheetDescription>
                {match.league?.name}
                <br />
                <span className="font-semibold">Todas las estadísticas son Pre-Jornada</span>
            </SheetDescription>

            {(detailsLoading || isFavorite) && (
               <button 
                onClick={handleShare}
                disabled={!isFavorite}
                className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Share2 className="h-4 w-4" />
                {detailsLoading ? <Loader2 className="animate-spin" /> : 'COMPARTIR PRONÓSTICO'}
              </button>
            )}
            
            {detailsLoading && <Progress value={undefined} className="h-2 w-full mt-4" />}

            {isFavorite && (
              <div className="mt-4 space-y-2 text-left bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm font-bold text-primary flex items-center">
                    <span className={cn(isFavoriteTeam1 && "font-bold text-primary")}>{prediction.winner_name}</span>
                    <BlinkingLight />
                  </p>
                  <p className="text-xs text-primary/80">{prediction.prediction_text}</p>
              </div>
            )}
          </SheetHeader>
          {detailsLoading && !matchDetails ? (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : detailsError ? (
              <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{detailsError}</AlertDescription>
              </Alert>
          ) : matchDetails ? (
              <div className="p-4">
                  <StandingsTable 
                      title="Clasificación General"
                      homeStats={matchDetails.team1_standings}
                      awayStats={matchDetails.team2_standings}
                      homeName={match.team1?.name}
                      awayName={match.team2?.name}
                  />
                  <StandingsTable 
                      title="Clasificación Local/Visitante"
                      homeStats={matchDetails.team1_standings?.home}
                      awayStats={matchDetails.team2_standings?.away}
                      homeName={match.team1?.name}
                      awayName={match.team2?.name}
                  />
                  <StandingsTable 
                      title="Últimos 3 encuentros (General)"
                      homeStats={matchDetails.team1_last_3}
                      awayStats={matchDetails.team2_last_3}
                      homeName={match.team1?.name}
                      awayName={match.team2?.name}
                  />
                  <StandingsTable 
                      title="Últimos 3 encuentros (Local/Visitante)"
                      homeStats={matchDetails.team1_last_3_home_away}
                      awayStats={matchDetails.team2_last_3_home_away}
                      homeName={match.team1?.name}
                      awayName={match.team2?.name}
                  />
              </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}


export const MatchList = ({ matches, pinnedMatches, error, loading, onPinToggle, pinnedMatchIds, adBanner }: { matches: any[], pinnedMatches?: any[], error: string | null, loading: boolean, onPinToggle?: (matchId: string) => void, pinnedMatchIds?: Set<string>, adBanner?: React.ReactNode }) => {
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

  if ((!matches || matches.length === 0) && (!pinnedMatches || pinnedMatches.length === 0)) {
    return (
      <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
        <p>No hay encuentros para mostrar para esta fecha.</p>
      </div>
    );
  }
  
  const PinnedMatchesComponent = () => (
    pinnedMatches && pinnedMatches.length > 0 && (
       <Card className="bg-primary/10">
          <CardContent className="p-0">
            <div className="p-4 font-bold flex items-center gap-2 border-b">
              <Pin className="h-5 w-5" />
              Partidos Fijados
            </div>
            <div>
              <div className="divide-y">
                {pinnedMatches.map((match: any) => 
                  <MatchRow 
                    key={match.id} 
                    match={match} 
                    onPinToggle={onPinToggle} 
                    isPinned={pinnedMatchIds?.has(match.id)}
                  />)}
              </div>
            </div>
          </CardContent>
        </Card>
    )
  );
  
  const groupedByLeague = matches.reduce((acc, match) => {
    const countryName = match.league?.countries?.name || 'Unknown Country';
    const leagueName = match.league?.name || 'Unknown League';
    const groupKey = `${countryName}-${leagueName}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        matches: [],
        country: countryName,
        leagueName: leagueName,
        flag: match.league?.countries?.flag || null
      };
    }
    acc[groupKey].matches.push(match);
    return acc;
  }, {} as Record<string, { matches: any[], country: string, leagueName: string, flag: string | null }>);

  const sortedLeagues = Object.entries(groupedByLeague).sort(([, dataA], [, dataB]) => {
    if (dataA.country === 'Unknown Country' || dataB.country === 'Unknown Country') return dataA.leagueName.localeCompare(dataB.leagueName);
    const countryCompare = dataA.country.localeCompare(dataB.country);
    if (countryCompare !== 0) {
      return countryCompare;
    }
    return dataA.leagueName.localeCompare(dataB.leagueName);
  });
  
  const renderedContent: React.ReactNode[] = [];
  let matchesCount = 0;
  let adShown = false;
  const adAfterMatchCount = 2; 

  sortedLeagues.forEach(([groupKey, { matches: leagueMatches, country, leagueName, flag }]) => {
    const leagueMatchRows: React.ReactNode[] = [];
    
    leagueMatches.forEach((match: any) => {
      leagueMatchRows.push(
        <MatchRow 
          key={match.id} 
          match={match}
          onPinToggle={onPinToggle}
          isPinned={pinnedMatchIds?.has(match.id)}
        />
      );
      matchesCount++;

      if (adBanner && !adShown && matchesCount >= adAfterMatchCount) {
        leagueMatchRows.push(<div key={`ad-${match.id}`} className="my-4 px-2">{adBanner}</div>);
        adShown = true;
      }
    });

    renderedContent.push(
      <Card key={groupKey}>
        <CardContent className="p-0">
          <div className="p-4 font-bold flex items-center gap-2 border-b bg-muted/20">
            {flag && <img src={flag} alt={country} className="h-5 w-5" />}
            {country} - {leagueName}
          </div>
          <div>
            <div className="divide-y">
              {leagueMatchRows}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });


  return (
    <div className="w-full space-y-4 mt-4">
      <PinnedMatchesComponent />
      {renderedContent}
    </div>
  );
};
