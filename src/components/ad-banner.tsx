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
        <div className="grid grid-cols-1 gap-4 w-full justify-center items-center bg-muted/30 rounded-lg overflow-hidden p-2">
            <div className="flex justify-center items-center min-h-[250px] w-full">
                <ins 
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '250px', textAlign: 'center' }}
                    data-ad-client="ca-pub-5144766807318748"
                    data-ad-slot="4349475283"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                ></ins>
            </div>
        </div>
    );
};
