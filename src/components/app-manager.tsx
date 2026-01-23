'use client';

import { useNagScreen } from "@/hooks/use-nag-screen";
import { NagScreen } from "./nag-screen";
import Script from "next/script";

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

    const shouldShowAds = !isDonor;

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
            
            {!isLoading && shouldShowAds && false && (
                <>
                    <Script src="//pl28541828.effectivegatecpm.com/64/dc/83/64dc83486d297efc52e9102186b3a5e4.js" strategy="afterInteractive" />
                    <Script src="https://pl28543748.effectivegatecpm.com/1e/99/84/1e9984d12d9bf39e479deff29d5fcab9.js" strategy="afterInteractive" />
                    <Script src="https://www.effectivegatecpm.com/ige1e32sn7?key=1f87fff757404ef8ec600cb62cffdf98" strategy="afterInteractive" />
                </>
            )}
        </>
    );
}
