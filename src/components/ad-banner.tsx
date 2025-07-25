"use client";

import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const AdBanner = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error(err);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-5144766807318748" // Este es tu ID de publicador
             data-ad-slot="PON_TU_AD_SLOT_ID_AQUI"      // <-- IMPORTANTE: Reemplaza esto
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    );
};
