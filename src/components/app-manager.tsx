'use client';

import { useNagScreen } from "@/hooks/use-nag-screen";
import { NagScreen } from "./nag-screen";
import { useEffect } from "react";

declare global {
    interface Window {
        ezstandalone?: any;
    }
}

export function AppManager({ children }: { children: React.ReactNode }) {
    const { 
      showNag,
      handleClose,
      handleAccept,
      isDonor
    } = useNagScreen();

    useEffect(() => {
        if (isDonor && window.ezstandalone) {
            console.log("Ezoic ads disabled for donor.");
            window.ezstandalone.cmd.push(function() {
                window.ezstandalone.disable();
            });
        }
    }, [isDonor]);

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
