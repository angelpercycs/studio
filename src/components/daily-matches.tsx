"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchesByDate } from "@/app/actions/getMatches";
import { MatchList } from "@/components/match-list";
import { startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DailyMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [showOnlyPredicted, setShowOnlyPredicted] = useState(false);

  const fetchMatches = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);
    setMatches([]);
    setShowOnlyPredicted(false); 

    let date;
    if (tab === 'yesterday') date = subDays(new Date(), 1);
    else if (tab === 'tomorrow') date = addDays(new Date(), 1);
    else date = new Date();

    const startDate = startOfDay(date).toISOString();
    const endDate = endOfDay(date).toISOString();

    const result = await getMatchesByDate(startDate, endDate);
    
    if (result && result.error) {
      setError(result.error);
    } else if (result && result.data) {
      setMatches(result.data);
    } else {
      setError("No se pudieron cargar los partidos. Por favor, inténtelo de nuevo más tarde.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches(activeTab);
  }, [activeTab, fetchMatches]);
  
  const handleTabChange = (value: string) => {
      setActiveTab(value);
  }

  const hasAnyPrediction = useMemo(() => {
    return !loading && matches.some(match => match.prediction?.has_prediction);
  }, [matches, loading]);

  const filteredMatches = useMemo(() => {
    if (showOnlyPredicted) {
      return matches.filter(match => match.prediction?.has_prediction);
    }
    return matches;
  }, [matches, showOnlyPredicted]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="today" className="w-full" onValueChange={handleTabChange} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yesterday">Ayer</TabsTrigger>
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="tomorrow">Mañana</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} key={activeTab} className="mt-4">
            {hasAnyPrediction && (
              <Alert variant="destructive" className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                  </div>
                  <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con pronóstico disponibles!</AlertTitle>
                </div>
                 <Button onClick={() => setShowOnlyPredicted(!showOnlyPredicted)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
                  {showOnlyPredicted ? 'Mostrar todos' : 'Mostrar solo con pronóstico'}
                </Button>
              </Alert>
            )}
             <MatchList matches={filteredMatches} error={error} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
