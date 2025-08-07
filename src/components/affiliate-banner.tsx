"use client";

import React, { useEffect, useRef } from 'react';

interface AffiliateBannerProps {
    scriptSrc: string;
}

export const AffiliateBanner: React.FC<AffiliateBannerProps> = ({ scriptSrc }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptAdded = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (container && !scriptAdded.current) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            
            container.appendChild(script);
            scriptAdded.current = true;

            // No es necesario un cleanup que elimine el script
            // porque estos scripts de banners suelen manejar su propio ciclo de vida
            // y eliminarlo podría causar problemas si el componente se re-renderiza.
        }
    }, [scriptSrc]);

    return <div ref={containerRef} className="w-[300px] h-[250px] flex justify-center items-center" />;
};
