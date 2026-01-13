"use client";

import { useMemo } from 'react';
import { useCollection } from "@/firebase";
import { useFirestore, useUser } from "@/firebase/hooks";
import { collection, orderBy, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';

export function MyPredictions() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const betSlipsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/bet_slips`), orderBy('createdAt', 'desc'));
    }, [user, firestore]);

    const { data: betSlips, isLoading: slipsLoading, error: slipsError } = useCollection(betSlipsQuery);

    const handleDelete = (slipId: string) => {
        if (!user || !firestore) return;
        const slipRef = doc(firestore, `users/${user.uid}/bet_slips`, slipId);
        deleteDocumentNonBlocking(slipRef);
        toast({
            title: "Pronóstico Eliminado",
            description: "Tu combinada ha sido eliminada.",
        });
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


    if (isUserLoading || slipsLoading) {
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
                    <CardDescription>Para ver tus pronósticos guardados, por favor, inicia sesión.</CardDescription>
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
                            No se pudieron cargar tus pronósticos. Por favor, intenta de nuevo más tarde.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!betSlips || betSlips.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mis Pronósticos</CardTitle>
                    <CardDescription>Aquí aparecerán tus pronósticos combinados una vez que los guardes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
                        <p>Aún no tienes pronósticos guardados.</p>
                        <Button asChild variant="link" className="mt-2">
                           <Link href="/">¡Haz tu primer pronóstico!</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Pronósticos Guardados</CardTitle>
                <CardDescription>Revisa tu historial de pronósticos combinados.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full space-y-4">
                    {betSlips.map((slip: any) => {
                         if (!slip.selections || !Array.isArray(slip.selections)) {
                            return null; // Skip rendering if selections are invalid
                        }

                        const allSelectionsFinished = slip.selections.every((s: any) => getSelectionStatus(s) !== 'pending');
                        
                        const overallStatus = allSelectionsFinished
                            ? slip.selections.every((s: any) => getSelectionStatus(s) === 'won')
                                ? 'won'
                                : 'lost'
                            : 'pending';

                        const statusBadge = {
                            pending: <Badge variant="secondary">Pendiente</Badge>,
                            won: <Badge className="bg-green-600">Acertado</Badge>,
                            lost: <Badge variant="destructive">Fallado</Badge>,
                        }[overallStatus];

                        return (
                             <AccordionItem value={slip.id} key={slip.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold">{slip.selections.length} {slip.selections.length > 1 ? 'Selecciones' : 'Selección'}</span>
                                            <span className="text-sm text-muted-foreground">{format(slip.createdAt.toDate(), 'dd MMMM, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className='text-right'>
                                                <div className="font-semibold text-sm">Cuota Total</div>
                                                <div className="text-lg font-bold text-primary">{slip.totalOdds.toFixed(2)}</div>
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
                                                <TableHead>Cuota</TableHead>
                                                <TableHead>Resultado</TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {slip.selections.map((sel: any, selIdx: number) => {
                                                const selectionStatus = getSelectionStatus(sel);
                                                const selectionStatusBadge = {
                                                    pending: <Badge variant="secondary">Pendiente</Badge>,
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
                                                                : 'Pendiente'}
                                                        </TableCell>
                                                        <TableCell>{selectionStatusBadge}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end mt-4">
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(slip.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar Combinada
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
