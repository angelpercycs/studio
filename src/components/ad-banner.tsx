"use client";

import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from './ui/skeleton';
import Script from 'next/script';

export const AdBanner = () => {
    const { isDonor, isLoading } = useUserProfile();

    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full p-2">
                <Skeleton className="w-[320px] h-[50px]" />
                <Skeleton className="w-[300px] h-[250px]" />
            </div>
        );
    }
    
    if (isDonor) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full p-2 bg-muted/20 rounded-lg">
            {/* Adsterra 320x50 Banner */}
            <div className="flex justify-center items-center min-h-[50px]">
                <Script 
                    id="adsterra-banner-script-320-50"
                    async={true} 
                    data-cfasync="false" 
                    src="//pl23681433.highcpmgate.com/0c8733b83b3e39930f701c36bde4355a/invoke.js"
                    strategy="lazyOnload"
                />
                <div id="container-0c8733b83b3e39930f701c36bde4355a" />
            </div>

            {/* Adsterra Native Banner */}
            <div className="flex justify-center items-center min-h-[250px]">
                 <Script 
                    id="adsterra-native-banner-script"
                    async={true} 
                    data-cfasync="false" 
                    src="//pl23681467.highcpmgate.com/2b397c7689d0739c9f69748b375b4f00/invoke.js"
                    strategy="lazyOnload"
                />
                <div id="container-2b397c7689d0739c9f69748b375b4f00" />
            </div>
        </div>
    );
};
