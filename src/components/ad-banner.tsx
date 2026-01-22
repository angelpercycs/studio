"use client";

import React, { useEffect, useRef } from 'react';

const HighPerformanceAdUnit = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptsAdded = useRef(false);

    useEffect(() => {
        const container = containerRef.current;

        if (container && !scriptsAdded.current) {
            const configScript = document.createElement('script');
            configScript.type = 'text/javascript';
            configScript.innerHTML = `
                atOptions = {
                    'key' : 'b31d670dfaea3679b33823f7f523a888',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            `;
            container.appendChild(configScript);

            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = 'https://www.highperformanceformat.com/b31d670dfaea3679b33823f7f523a888/invoke.js';
            invokeScript.async = true;
            container.appendChild(invokeScript);
            
            scriptsAdded.current = true;
        }
    }, []);

    return <div ref={containerRef} className="flex justify-center items-center w-[320px] h-[50px] min-w-[320px]" />;
};

export const AdBanner = () => {
    return (
        <div className="flex flex-col md:flex-row gap-4 w-full p-2 bg-muted/20 rounded-lg items-stretch justify-center">
            <HighPerformanceAdUnit />
            <HighPerformanceAdUnit />
        </div>
    );
};
