"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from "@/firebase/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Share2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { getMatchesByIds } from '@/app/actions/getRoundData';
import { supabase } from '@/lib/supabase';

export function MyPredictions() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [betSlips, setBetSlips] = useState<any[] | null>(null);
    const [slipsLoading, setSlipsLoading] = useState(true);
    const [slipsError, setSlipsError] = useState<string | null>(null);
    
    const [freshMatchesData, setFreshMatchesData] = useState<Record<string, any>>({});
    const [isFetchingMatches, setIsFetchingMatches] = useState(false);

    const fetchBetSlips = useCallback(async () => {
        if (!user) {
            setSlipsLoading(false);
            setBetSlips([]);
            return;
        }
        setSlipsLoading(true);
        const { data, error } = await supabase
            .from('bet_slips')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

        if (error) {
            setSlipsError('No se pudieron cargar tus pronósticos.');
            console.error('Error fetching bet slips:', error);
        } else {
            setBetSlips(data);
        }
        setSlipsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchBetSlips();
    }, [fetchBetSlips]);


    useEffect(() => {
        if (betSlips && betSlips.length > 0) {
            const fetchFreshData = async () => {
                setIsFetchingMatches(true);
                const allMatchIds = betSlips.flatMap(slip => 
                    slip.selections?.map((sel: any) => sel.matchId) ?? []
                );
                const uniqueMatchIds = [...new Set(allMatchIds.filter(id => id))];

                if (uniqueMatchIds.length > 0) {
                    const { data } = await getMatchesByIds(uniqueMatchIds);
                    if (data) {
                        setFreshMatchesData(data);
                    }
                }
                setIsFetchingMatches(false);
            };
            fetchFreshData();
        }
    }, [betSlips]);

    const enrichedBetSlips = useMemo(() => {
        if (!betSlips) return null;
        return betSlips.map(slip => {
            if (!slip.selections) return slip;
            const enrichedSelections = slip.selections.map((sel: any) => {
                const freshMatch = freshMatchesData[sel.matchId];
                if (freshMatch) {
                    return {
                        ...sel,
                        match: {
                            ...sel.match,
                            team1_score: freshMatch.team1_score,
                            team2_score: freshMatch.team2_score,
                        }
                    };
                }
                return sel;
            });
            return { ...slip, selections: enrichedSelections };
        });
    }, [betSlips, freshMatchesData]);

    const handleDelete = async (slipId: string) => {
        if (!user) return;
        const { error } = await supabase.from('bet_slips').delete().eq('id', slipId);
        
        if (error) {
             toast({
                variant: "destructive",
                title: "Error al Eliminar",
                description: "No se pudo eliminar el pronóstico.",
            });
        } else {
            setBetSlips(prev => prev?.filter(s => s.id !== slipId) ?? null);
            toast({
                title: "Pronóstico Eliminado",
                description: "Tu pronóstico múltiple ha sido eliminado.",
            });
        }
    };

    const getSelectionStatus = (selection: any) => {
        if (!selection.match || selection.match.team1_score === null || selection.match.team2_score === null) {
            return 'pending';
        }
        const { team1_score, team2_score } = selection.match;
        const { prediction } = selection;

        if (prediction === 'team1' && team1_score > team2_score) return 'won';
        if (prediction === 'team2' && team2_score > team1_score) return 'won';
        if (prediction === 'draw' && team1_score === team2_score) return 'won';

        return 'lost';
    };
    
    const renderPrediction = (selection: any) => {
        const { prediction, match } = selection;
        if (!match) return "Datos del partido no disponibles";
        if (prediction === 'team1') return `Gana ${match.team1?.name || 'Local'}`;
        if (prediction === 'team2') return `Gana ${match.team2?.name || 'Visitante'}`;
        return 'Empate';
    };

     const handleShare = async (slip: any) => {
        if (!slip || !slip.selections) return;
        
        const selectionLines = slip.selections.map((sel: any) => {
            const teams = sel.match ? `${sel.match.team1?.name || 'Local'} vs ${sel.match.team2?.name || 'Visitante'}` : 'Partido no especificado';
            const predictionText = renderPrediction(sel);
            return `- ${predictionText} (${teams})`;
        }).join('\n');

        const shareText = `Mi Pronóstico (Valor: ${slip.total_odds.toFixed(2)}):\n${selectionLines}\n\nPronóstico deportivo (opinión personal).\nNo es una apuesta ni implica dinero real.`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mi Pronóstico Deportivo',
                    text: shareText,
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                toast({
                    title: "¡Copiado!",
                    description: "Tu pronóstico ha sido copiado al portapapeles.",
                });
            }
        } catch (error) {
            console.error("Error al compartir:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo compartir el pronóstico.",
            });
        }
    };


    if (isUserLoading || slipsLoading || isFetchingMatches) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-16 w-full" />
                     <Skeleton className="h-16 w-full" />
                     <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (!user) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Inicia Sesión</CardTitle>
                    <CardDescription>Para ver tu bitácora de pronósticos, por favor, inicia sesión.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login">Ir a Iniciar Sesión</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (slipsError) {
        return (
             <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error al cargar pronósticos</AlertTitle>
                        <AlertDescription>
                            {slipsError}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!enrichedBetSlips || enrichedBetSlips.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mi Bitácora de Pronósticos</CardTitle>
                    <CardDescription>Aquí aparecerán tus pronósticos múltiples una vez que los guardes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
                        <p>Aún no tienes pronósticos en tu bitácora.</p>
                        <Button asChild variant="link" className="mt-2">
                           <Link href="/">¡Crea tu primer pronóstico!</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Mi Bitácora de Pronósticos</CardTitle>
                <CardDescription>Revisa tu historial de pronósticos múltiples.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full space-y-4">
                    {enrichedBetSlips.map((slip: any) => {
                         if (!slip.selections || !Array.isArray(slip.selections)) {
                            return null;
                        }

                        const allSelectionsFinished = slip.selections.every((s: any) => getSelectionStatus(s) !== 'pending');
                        
                        const overallStatus = allSelectionsFinished
                            ? slip.selections.every((s: any) => getSelectionStatus(s) === 'won')
                                ? 'won'
                                : 'lost'
                            : 'pending';

                        const statusBadge = {
                            pending: <Badge variant="secondary">Por jugar</Badge>,
                            won: <Badge className="bg-green-600">Acertado</Badge>,
                            lost: <Badge variant="destructive">Fallado</Badge>,
                        }[overallStatus];

                        return (
                             <AccordionItem value={slip.id} key={slip.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold">{slip.selections.length} {slip.selections.length > 1 ? 'Selecciones' : 'Selección'}</span>
                                            <span className="text-sm text-muted-foreground">{format(new Date(slip.created_at), 'dd MMMM, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className='text-right'>
                                                <div className="font-semibold text-sm">Valor total (referencial)</div>
                                                <div className="text-lg font-bold text-primary">{slip.total_odds.toFixed(2)}</div>
                                            </div>
                                            {statusBadge}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Partido</TableHead>
                                                <TableHead>Pronóstico</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Estado del partido</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {slip.selections.map((sel: any, selIdx: number) => {
                                                const selectionStatus = getSelectionStatus(sel);
                                                const selectionStatusBadge = {
                                                    pending: <Badge variant="secondary">Por jugar</Badge>,
                                                    won: <Badge className="bg-green-600">Acertado</Badge>,
                                                    lost: <Badge variant="destructive">Fallado</Badge>,
                                                }[selectionStatus];
                                                
                                                return (
                                                     <TableRow key={selIdx}>
                                                        <TableCell>
                                                            {sel.match?.team1?.name || 'Equipo 1'} vs {sel.match?.team2?.name || 'Equipo 2'}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">{renderPrediction(sel)}</TableCell>
                                                        <TableCell>{sel.odds.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            {sel.match && sel.match.team1_score !== null && sel.match.team2_score !== null 
                                                                ? `${sel.match.team1_score} - ${sel.match.team2_score}` 
                                                                : 'Por jugar'}
                                                        </TableCell>
                                                        <TableCell>{selectionStatusBadge}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleShare(slip)}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Compartir
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(slip.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar pronóstico
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}
