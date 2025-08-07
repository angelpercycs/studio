"use client";

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full justify-center items-center bg-muted/30 rounded-lg overflow-hidden p-2">
            <div className="flex justify-center items-center min-h-[50px]">
               <iframe
                    src="https://c.bannerflow.net/a/66d093873ec9f495810c7166?did=657fff592225a91f2b2e2296&deeplink=on&adgroupid=66d093873ec9f495810c716b&redirecturl=https://record.betsson.com/_JVOvJkxHMMsyGSrLOh2Z726ly77WL6Qu/1/&media=208756&campaign=1"
                    scrolling="no"
                    style={{ border: 'none', width: '300px', height: '250px', overflow: 'hidden' }}
                ></iframe>
            </div>
            
            <div className="flex justify-center items-center min-h-[50px]">
                <ins 
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', textAlign: 'center' }}
                    data-ad-client="ca-pub-5144766807318748"
                    data-ad-slot="4349475283"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                ></ins>
            </div>

            <div className="flex justify-center items-center min-h-[50px]">
                <iframe
                    src="https://c.bannerflow.net/a/66a379674626d28804982c70?did=657fff592225a91f2b2e2296&deeplink=on&adgroupid=66a379674626d28804982c75&redirecturl=https://record.inkabet.pe/_JVOvJkxHMMsYx3xzOqdcQ_tY1Quv5xos/1/&media=208596&campaign=1"
                    scrolling="no"
                    style={{ border: 'none', width: '300px', height: '250px', overflow: 'hidden' }}
                ></iframe>
            </div>
        </div>
    );
};
