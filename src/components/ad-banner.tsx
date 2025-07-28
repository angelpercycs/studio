"use client";

import React, { useEffect, useState } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const AdBanner = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error(err);
            }
        }
    }, [isMounted]);

    if (!isMounted) {
      return <div className="w-full min-h-[50px] rounded-lg bg-muted/30 animate-pulse" />;
    }

    return (
        <div key={Math.random()} className="flex justify-center items-center w-full min-h-[50px] bg-muted/30 rounded-lg overflow-hidden">
            <ins 
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '50px', textAlign: 'center' }}
                data-ad-client="ca-pub-5144766807318748"
                data-ad-slot="4349475283"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};
