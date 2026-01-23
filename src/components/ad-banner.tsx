"use client";

import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from './ui/skeleton';

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

    // Ads are currently disabled as per user request.
    // Returning null until Ezoic is fully approved and ads are re-enabled.
    return null;
};
