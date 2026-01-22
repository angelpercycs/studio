"use client";

import Script from 'next/script';

export const AdBanner = () => {
    return (
        <div className="grid grid-cols-1 gap-4 w-full justify-center items-center bg-muted/30 rounded-lg overflow-hidden p-2">
            <div className="flex justify-center items-center min-h-[250px] w-full">
                <Script src="https://pl28541828.effectivegatecpm.com/64/dc/83/64dc83486d297efc52e9102186b3a5e4.js" />
            </div>
        </div>
    );
};
