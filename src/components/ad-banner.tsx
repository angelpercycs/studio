"use client";

import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const AdBanner = () => {
    const adLoaded = useRef(false);

    useEffect(() => {
      if (adLoaded.current) {
        return;
      }
      
      try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;
      } catch (err) {
          console.error(err);
      }
    }, []);

    return (
        <div className="flex justify-center items-center w-full min-h-[50px] bg-muted/30 rounded-lg overflow-hidden">
            <ins 
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}
                data-ad-client="ca-pub-5144766807318748"
                data-ad-slot="4349475283"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};
