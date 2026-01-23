'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNagScreen } from "@/hooks/use-nag-screen";
import { NagScreen } from "./nag-screen";

// Añade una declaración global para el objeto `window` de Ezoic para satisfacer a TypeScript
declare global {
    interface Window {
        ezstandalone?: {
            cmd?: any[];
            showAds: () => void;
        };
    }
}

export function AppManager({ children }: { children: React.ReactNode }) {
    const { 
      showNag, 
      nagStep,
      handleDeclineDonation,
      handleFinalClose,
      handleAccept,
      isDonor, 
      isLoading 
    } = useNagScreen();

    const pathname = usePathname();
    const shouldShowAds = !isDonor;

    // Este efecto se ejecuta en cada cambio de página (gracias a `pathname`) y cuando
    // el estado de los anuncios del usuario cambia. Le dice a Ezoic que muestre los anuncios.
    useEffect(() => {
        if (!isLoading && shouldShowAds && window.ezstandalone?.cmd) {
            window.ezstandalone.cmd.push(function () {
                if (window.ezstandalone) {
                    window.ezstandalone.showAds();
                }
            });
        }
    }, [pathname, isLoading, shouldShowAds]);

    return (
        <>
            <NagScreen 
                open={showNag} 
                step={nagStep}
                onDeclineDonation={handleDeclineDonation}
                onFinalClose={handleFinalClose}
                onAccept={handleAccept}
            />
            
            {children}
        </>
    );
}
