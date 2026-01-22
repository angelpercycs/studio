"use client";

import { useEffect, useRef } from 'react';

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
    const adContainerRef = useRef<HTMLDivElement>(null);
    const adLoaded = useRef(false);

    useEffect(() => {
        if (adContainerRef.current && !adLoaded.current) {
            const configScript = document.createElement('script');
            configScript.type = 'text/javascript';
            configScript.text = `
                atOptions = {
                    'key' : 'b31d670dfaea3679b33823f7f523a888',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            `;

            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = "https://www.highperformanceformat.com/b31d670dfaea3679b33823f7f523a888/invoke.js";
            invokeScript.async = true;

            adContainerRef.current.appendChild(configScript);
            adContainerRef.current.appendChild(invokeScript);
            
            adLoaded.current = true;
        }
    }, []);
    
    return (
        <div ref={adContainerRef} className="flex justify-center items-center min-h-[50px] w-full bg-muted/50 rounded-md" />
    );
};


export const AdBanner = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2 bg-muted/20 rounded-lg items-center">
            <AdsenseUnit />
            <SecondaryAdUnit />
        </div>
    );
};
