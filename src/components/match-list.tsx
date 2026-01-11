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
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  const timeDisplay = match.match_date_iso 
      ? new Date(match.match_date_iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
      : '--:--';

  const isFavoriteTeam1 = match.favorite === 'team1';
  const isFavoriteTeam2 = match.favorite === 'team2';
  const isFavorite = isFavoriteTeam1 || isFavoriteTeam2;
  const favoriteTeamName = isFavoriteTeam1 ? match.team1?.name : (isFavoriteTeam2 ? match.team2?.name : '');
  const predictionText = isFavoriteTeam1 ? 'Gana Local' : (isFavoriteTeam2 ? 'Gana Visita' : '');


  const handleOpenSheet = useCallback(async () => {
    setIsSheetOpen(true);
    if (!matchDetails) {
      setDetailsLoading(true);
      setDetailsError(null);
      const result = await getMatchStats(match);
      if (result.error) {
        setDetailsError(result.error);
      } else {
        setMatchDetails(result.data);
      }
      setDetailsLoading(false);
    }
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
      text: `🔥 ¡OJO CON ESTE DATO! 🔥\n🏟️ ${match.team1?.name} vs ${match.team2?.name}\n📊 Pronóstico: ${predictionText} (Probabilidad: 50%)\n📈 Mira las estadísticas tipo StatsZone aquí:`,
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
      // No loguear el error para evitar el overlay de Next.js en desarrollo.
      // El fallback al clipboard ya maneja la situación.
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
                <span className={cn(isFavoriteTeam1 && "font-bold text-primary")}>{match.team1?.name ?? 'Equipo no encontrado'}</span>
                {isFavoriteTeam1 && <BlinkingLight />}
            </div>
            <div className="flex items-center">
                <span className={cn(isFavoriteTeam2 && "font-bold text-primary")}>{match.team2?.name ?? 'Equipo no encontrado'}</span>
                {isFavoriteTeam2 && <BlinkingLight />}
            </div>
            {isFavorite && (
              <div className="mt-1 text-xs text-primary font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3"/>
                <span>Pronóstico: {predictionText}</span>
                <span>Prob: 50%</span>
              </div>
            )}
        </div>
        
        <div className="flex items-center justify-end w-[130px] flex-shrink-0 font-mono text-sm whitespace-nowrap pl-2">
            {match.odds ? (
                 <div className="flex justify-around items-center w-full text-center gap-2">
                     <span className="w-1/3 text-center">{match.odds.home_odds?.toFixed(2)}</span>
                     <span className="w-1/3 text-center">{match.odds.draw_odds?.toFixed(2)}</span>
                     <span className="w-1/3 text-center">{match.odds.away_odds?.toFixed(2)}</span>
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

            {isFavorite && (
               <button 
                onClick={handleShare}
                className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                COMPARTIR PRONÓSTICO
              </button>
            )}

            {isFavorite && (
              <div className="mt-4 space-y-2 text-left bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm font-bold text-primary">
                    Favorito a ganar: {favoriteTeamName}
                  </p>
                  <Progress value={50} className="h-2 bg-primary/20" indicatorClassName="bg-primary" />
                  <p className="text-xs font-semibold text-primary">Predicción con 50% de probabilidad</p>
              </div>
            )}
          </SheetHeader>
          {detailsLoading ? (
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


  return (
    <div className="w-full space-y-4 mt-4">
      <PinnedMatchesComponent />
      {sortedLeagues.map(([groupKey, { matches: leagueMatches, country, leagueName, flag }], index) => {
        const showAd = index === 0 && adBanner;
        return (
          <React.Fragment key={groupKey}>
            <Card>
              <CardContent className="p-0">
                <div className="p-4 font-bold flex items-center gap-2 border-b bg-muted/20">
                  {flag && <img src={flag} alt={country} className="h-5 w-5" />}
                  {country} - {leagueName}
                </div>
                <div>
                  <div className="divide-y">
                    {leagueMatches.map((match: any) => 
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
            {showAd && <div className="my-4">{adBanner}</div>}
          </React.Fragment>
        )
      })}
    </div>
  );
};
