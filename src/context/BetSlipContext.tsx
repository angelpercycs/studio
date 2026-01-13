'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { useUser } from '@/firebase/hooks';

interface MatchSelection {
  matchId: string;
  match: any;
  prediction: 'team1' | 'team2' | 'draw';
  odds: number;
}

interface BetSlipContextType {
  selections: MatchSelection[];
  addSelection: (selection: MatchSelection) => void;
  removeSelection: (matchId: string) => void;
  clearSelections: () => void;
  isSlipOpen: boolean;
  setIsSlipOpen: (isOpen: boolean) => void;
  totalSelections: number;
  totalOdds: number;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const BetSlipProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [selections, setSelections] = useState<MatchSelection[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const addSelection = useCallback(
    (newSelection: MatchSelection) => {
      if (!user) {
        // Here you could trigger a toast or a modal to ask the user to log in
        console.log('User must be logged in to make a prediction.');
        return;
      }
      setSelections((prev) => {
        const existingIndex = prev.findIndex(
          (s) => s.matchId === newSelection.matchId
        );
        if (existingIndex > -1) {
          // If the same prediction, remove it (toggle)
          if (prev[existingIndex].prediction === newSelection.prediction) {
            return prev.filter((s) => s.matchId !== newSelection.matchId);
          }
          // If different prediction for the same match, replace it
          const updatedSelections = [...prev];
          updatedSelections[existingIndex] = newSelection;
          return updatedSelections;
        }
        // Add new selection
        return [...prev, newSelection];
      });
      setIsSlipOpen(true);
    },
    [user]
  );

  const removeSelection = useCallback((matchId: string) => {
    setSelections((prev) => prev.filter((s) => s.matchId !== matchId));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
  }, []);

  const totalSelections = selections.length;
  const totalOdds = useMemo(
    () => selections.reduce((acc, s) => acc * s.odds, 1),
    [selections]
  );

  const value = {
    selections,
    addSelection,
    removeSelection,
    clearSelections,
    isSlipOpen,
    setIsSlipOpen,
    totalSelections,
    totalOdds,
  };

  return (
    <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
};
