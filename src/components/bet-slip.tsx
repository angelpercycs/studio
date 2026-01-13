"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from 'lucide-react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export function BetSlip() {
    const { 
        selections, 
        removeSelection, 
        clearSelections, 
        isSlipOpen, 
        setIsSlipOpen,
        totalSelections,
        totalOdds
    } = useBetSlip();

    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [amount, setAmount] = useState<number | string>('');

    const handleSaveSlip = async () => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Debes iniciar sesión para guardar tus pronósticos.",
            });
            return;
        }
        if (selections.length === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No hay pronósticos para guardar.",
            });
            return;
        }
        
        try {
            const betSlipsCollection = collection(firestore, `users/${user.uid}/bet_slips`);
            await addDocumentNonBlocking(betSlipsCollection, {
                selections: selections.map(s => ({
                    matchId: s.matchId,
                    match: { 
                        team1: s.match.team1?.name,
                        team2: s.match.team2?.name,
                        team1_score: s.match.team1_score,
                        team2_score: s.match.team2_score,
                    },
                    prediction: s.prediction,
                    odds: s.odds,
                })),
                totalOdds: totalOdds,
                createdAt: new Date(),
                status: 'pending', // pending, won, lost
            });

            toast({
                title: "Pronóstico Guardado",
                description: "Tu combinada ha sido guardada en tu historial.",
            });
            clearSelections();
            setIsSlipOpen(false);

        } catch (error) {
             console.error("Error saving bet slip:", error);
            toast({
                variant: "destructive",
                title: "Error al guardar",
                description: "No se pudo guardar el pronóstico. Inténtalo de nuevo.",
            });
        }
    };


    return (
        <>
            {/* Floating button */}
            {!isSlipOpen && (
                 <Button
                    onClick={() => setIsSlipOpen(true)}
                    className={cn(
                        "fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg text-lg flex flex-col items-center justify-center transition-all duration-300",
                        totalSelections > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                >
                    <span className="font-bold -mb-1">{totalSelections}</span>
                    <span className="text-xs font-normal">PRO</span>
                </Button>
            )}

            <Sheet open={isSlipOpen} onOpenChange={setIsSlipOpen}>
                <SheetContent className="flex flex-col p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>Pronósticos</SheetTitle>
                    </SheetHeader>
                    {selections.length > 0 ? (
                        <ScrollArea className="flex-grow">
                            <div className="p-4 space-y-4">
                                {selections.map((selection, index) => (
                                    <div key={index}>
                                        <div className="text-sm font-semibold">
                                            {selection.match.team1.name} vs {selection.match.team2.name}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="text-primary text-sm font-bold">
                                                {selection.prediction === 'team1' ? `Gana ${selection.match.team1.name}` : selection.prediction === 'team2' ? `Gana ${selection.match.team2.name}`: 'Empate' }
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="font-semibold text-sm">{selection.odds.toFixed(2)}</div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSelection(selection.matchId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        {index < selections.length - 1 && <Separator className="mt-4"/>}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <p className="text-muted-foreground">No has seleccionado ningún pronóstico.</p>
                        </div>
                    )}
                    <SheetFooter className="p-4 border-t bg-background flex-row justify-end space-x-2">
                        <Button onClick={handleSaveSlip} className="w-full">Guardar Cupón</Button>
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">Cerrar</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
