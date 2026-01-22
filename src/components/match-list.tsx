"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Pin, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getMatchStats } from "@/app/actions/getRoundData";
import { cn } from "@/lib/utils";
import { useBetSlip } from "@/context/BetSlipContext";
import { useUser } from "@/firebase/hooks";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "./ui/table";


const MatchDaySkeleton = () => (
  <div className="space-y-4 mt-6">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

const PredictionControls = ({ match }: { match: any }) => {
    const { addSelection, selections } = useBetSlip();
    const { user } = useUser();
    
    const handlePrediction = (prediction: 'team1' | 'team2' | 'draw', odds: number) => {
        if (!user) {
             // Optionally, show a toast or modal to prompt login
            return;
        }
        addSelection({
            matchId: match.id,
            match: match,
            prediction,
            odds,
        });
    };

    const getButtonClass = (prediction: 'team1' | 'team2' | 'draw') => {
        const currentSelection = selections.find(s => s.matchId === match.id);
        if (currentSelection && currentSelection.prediction === prediction) {
            return "bg-primary text-primary-foreground";
        }
        return "bg-muted/50 hover:bg-muted";
    };

    if (!match.odds) {
        return (
             <div className="sm:flex space-x-2 text-xs text-center text-muted-foreground w-36 justify-center items-center">
                Cuotas no disponibles
            </div>
        )
    }

    return (
        <div className="sm:flex space-x-1 text-sm text-muted-foreground w-36">
            <Button size="sm" className={cn("flex-1", getButtonClass('team1'))} onClick={() => handlePrediction('team1', match.odds.home_odds)}>{match.odds.home_odds}</Button>
            <Button size="sm" className={cn("flex-1", getButtonClass('draw'))} onClick={() => handlePrediction('draw', match.odds.draw_odds)}>{match.odds.draw_odds}</Button>
            <Button size="sm" className={cn("flex-1", getButtonClass('team2'))} onClick={() => handlePrediction('team2', match.odds.away_odds)}>{match.odds.away_odds}</Button>
        </div>
    );
};


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

  const handleShare = async () => {
    const predictionText = `Pronóstico: ${isFavoriteTeam1 ? 'Gana Local' : 'Gana Visita'}`;
    const analysisText = match.text_analysis ? `\n\nAnálisis: ${match.text_analysis}` : '';

    const shareData = {
      title: `Pronóstico para ${match.team1?.name} vs ${match.team2?.name}`,
      text: `⚽ ${match.team1?.name} vs ${match.team2?.name}\n🔥 ${predictionText}${analysisText}\n\nConoce más en fszscore.com`,
      url: window.location.href,
    };

    try {
      if (navigator.share) { await navigator.share(shareData); } 
      else { 
        await navigator.clipboard.writeText(shareData.text); 
        alert("¡Pronóstico copiado al portapapeles!"); 
      }
    } catch (err) { console.error("Error al compartir", err); }
  };


  const BlinkingLight = () => (
    <div className="relative flex h-3 w-3 mx-2">
      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
      <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
    </div>
  );
 
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPinToggle?.(match.id);
  }
  return (
    <>
      <div className="flex items-start w-full px-4 py-3 group">
        {onPinToggle && (
           <button onClick={handlePinClick} className="mr-4 p-2 flex items-center justify-center -ml-2 mt-1">
            <div className={cn(
              "h-4 w-4 rounded-full border-2 border-foreground/50 transition-colors",
              isPinned && "bg-foreground border-foreground"
            )}></div>
          </button>
        )}
        <div className="w-16 text-muted-foreground text-center text-sm pt-1">{timeDisplay}</div>
        <div className="flex-grow space-y-1 text-sm">
            <div onClick={handleOpenSheet} className="cursor-pointer hover:bg-muted/50 rounded p-2 -m-2">
                <div className="flex items-center font-medium">
                    <span>{match.team1?.name ?? 'Equipo no encontrado'}</span>
                    {isFavoriteTeam1 && <BlinkingLight />}
                </div>
                <div className="flex items-center font-medium">
                    <span>{match.team2?.name ?? 'Equipo no encontrado'}</span>
                    {isFavoriteTeam2 && <BlinkingLight />}
                </div>
            </div>
             {isFavorite && (
              <div className="pt-2 text-xs">
                <div className="font-semibold text-primary flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3"/>
                    <span>Pronóstico: {isFavoriteTeam1 ? 'Gana Local' : 'Gana Visita'}</span>
                </div>
                {match.text_analysis && (
                    <a href={`#analysis-${match.id}`} className="mt-1 flex items-center text-xs font-semibold text-primary/90 hover:underline">
                        Ver análisis detallado
                    </a>
                )}
              </div>
            )}
        </div>
        
        <PredictionControls match={match} />

        <div className="flex flex-col items-center w-8 text-sm font-bold ml-4 text-foreground pt-1">
            <span>{match.team1_score ?? '-'}</span>
            <span>{match.team2_score ?? '-'}</span>
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
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl text-sm font-bold w-full shadow-lg hover:opacity-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              COMPARTIR PRONÓSTICO
            </button>

            {(isFavorite) && (
              <div className="mt-4 space-y-2 text-left bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm font-bold text-primary">
                    Pronóstico: {isFavoriteTeam1 ? 'Gana Local' : 'Gana Visita'}
                  </p>
                  {match.text_analysis && (
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Análisis:</span> {match.text_analysis}
                    </p>
                  )}
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

const FinalMatchAd = () => {
    const adRef = React.useRef<HTMLDivElement>(null);
    const loaded = React.useRef(false);

    React.useEffect(() => {
        if (adRef.current && !loaded.current) {
            const script = document.createElement('script');
            script.async = true;
            script.setAttribute('data-cfasync', 'false');
            script.src = "https://pl28543851.effectivegatecpm.com/0ac3b63e502ad4397e51b7e598cf59b4/invoke.js";
            
            const div = document.createElement('div');
            div.id = "container-0ac3b63e502ad4397e51b7e598cf59b4";

            adRef.current.appendChild(script);
            adRef.current.appendChild(div);
            
            loaded.current = true;
        }
    }, []);

    return <div ref={adRef} className="flex justify-center my-4" />;
};


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
            {index === 0 && adBanner && <div className="my-4">{adBanner}</div>}
          </React.Fragment>
        )
      })}
      <FinalMatchAd />
    </div>
  );
};
