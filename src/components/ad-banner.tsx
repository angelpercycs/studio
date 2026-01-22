"use client";

import Script from 'next/script';
import { useEffect } from 'react';

const AdsenseUnit = () => {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Adsense push error', e);
        }
    }, []);

    return (
        <div className="flex justify-center items-center min-h-[250px] w-full bg-muted/50 rounded-md">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '300px', height: '250px' }}
                data-ad-client="ca-pub-5144766807318748"
                data-ad-slot="YOUR_AD_SLOT_HERE"
                data-ad-format="auto"
                data-full-width-responsive="false"></ins>
        </div>
    );
}

const SecondaryAdUnit = () => {
    return (
         <div className="flex justify-center items-center min-h-[250px] w-full bg-muted/50 rounded-md">
            <Script src="https://pl28541828.effectivegatecpm.com/64/dc/83/64dc83486d297efc52e9102186b3a5e4.js" />
        </div>
    )
}

export const AdBanner = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2 bg-muted/20 rounded-lg">
            <AdsenseUnit />
            <SecondaryAdUnit />
        </div>
    );
};
