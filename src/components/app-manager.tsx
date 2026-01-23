'use client';

import { useNagScreen } from "@/hooks/use-nag-screen";
import { NagScreen } from "./nag-screen";

// This component now only manages the display of the nag screen.
// Ezoic-specific logic has been removed.
export function AppManager({ children }: { children: React.ReactNode }) {
    const { 
      showNag,
      handleClose,
      handleAccept,
    } = useNagScreen();

    return (
        <>
            <NagScreen 
                open={showNag} 
                onClose={handleClose}
                onAccept={handleAccept}
            />
            
            {children}
        </>
    );
}
