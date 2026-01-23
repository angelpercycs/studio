"use client";

import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from './ui/skeleton';

export const AdBanner = () => {
    const { isDonor, isLoading } = useUserProfile();

    if (isLoading) {
        return (
            <div className="flex justify-center gap-4 w-full p-2">
                <Skeleton className="w-[320px] h-[50px]" />
                <Skeleton className="w-[320px] h-[50px] hidden md:block" />
            </div>
        );
    }
    
    if (isDonor) {
        return null;
    }

    // IMPORTANTE: Reemplaza estos IDs con los IDs reales de tu panel de Ezoic.
    const placeholderIds = [101, 102];

    return (
        <div className="flex flex-col md:flex-row gap-4 w-full p-2 bg-muted/20 rounded-lg items-stretch justify-center">
            {/* Contenedores de anuncios para Ezoic */}
            <div id={`ezoic-pub-ad-placeholder-${placeholderIds[0]}`} />
            <div id={`ezoic-pub-ad-placeholder-${placeholderIds[1]}`} className="hidden md:block" />
        </div>
    );
};
