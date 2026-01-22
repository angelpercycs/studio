"use client";

import React, { useEffect } from 'react';
import { AffiliateBanner } from './affiliate-banner';

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
        <div className="flex justify-center items-center bg-muted/50 rounded-md flex-1 min-h-[250px] min-w-0">
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-5144766807318748"
                data-ad-slot="YOUR_AD_SLOT_HERE" // User needs to replace this
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
}

const TerraAdUnit = () => {
    // This component will render the Terra/Betsson ad.
    // The script is from effectivegatecpm.com, which the user refers to as 'Terra'.
    return (
        <div className="flex justify-center items-center bg-muted/50 rounded-md flex-1 min-h-[250px] min-w-0">
             <AffiliateBanner scriptSrc="//pl28541828.effectivegatecpm.com/64/dc/83/64dc83486d297efc52e9102186b3a5e4.js" />
        </div>
    );
};

export const AdBanner = () => {
    return (
        <div className="flex flex-col md:flex-row gap-4 w-full p-2 bg-muted/20 rounded-lg items-stretch justify-center">
            <TerraAdUnit />
            <AdsenseUnit />
            <TerraAdUnit />
        </div>
    );
};
