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
        <div className="my-4 flex justify-center items-center w-full min-h-[60px] bg-muted/30 rounded-lg overflow-hidden">
            <ins 
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '60px', textAlign: 'center' }}
                data-ad-client="ca-pub-5144766807318748"
                data-ad-slot="4349475283"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};
