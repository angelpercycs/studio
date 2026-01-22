"use client";

import React from 'react';
import { AffiliateBanner } from './affiliate-banner';

const TerraAdUnit = () => {
    // This component will render the Terra/Betsson ad.
    // The script is from effectivegatecpm.com, which the user refers to as 'Terra'.
    return (
        <div className="flex justify-center bg-muted/50 rounded-md flex-1 min-h-[100px] min-w-0">
             <AffiliateBanner scriptSrc="//pl28541828.effectivegatecpm.com/64/dc/83/64dc83486d297efc52e9102186b3a5e4.js" />
        </div>
    );
};

export const AdBanner = () => {
    return (
        <div className="flex flex-col md:flex-row gap-4 w-full p-2 bg-muted/20 rounded-lg items-stretch justify-center">
            <TerraAdUnit />
            <TerraAdUnit />
        </div>
    );
};
