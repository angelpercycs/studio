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
            <div>
                <div id="container-2f7c227362b55b9a8e03102434289895"></div>
                <Script
                    id="adsterra-invoke-script"
                    strategy="afterInteractive"
                    data-cfasync="false"
                    src="https://pl28567635.effectivegatecpm.com/2f7c227362b55b9a8e03102434289895/invoke.js"
                />
            </div>
        </div>
    );
};


export const AdBanner = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2 bg-muted/20 rounded-lg">
            <AdsenseUnit />
            <SecondaryAdUnit />
        </div>
    );
};
