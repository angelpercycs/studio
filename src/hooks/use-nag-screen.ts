'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserProfile } from './use-user-profile';
import { useLocalStorageWithExpiry } from './use-local-storage-with-expiry';

const NAG_FREQUENCY_PAGE_VIEWS = 2; // Show every 2 page views
const NAG_DECLINE_EXPIRY_DAYS = 7; // Don't show for 7 days if declined

export function useNagScreen() {
    const { isDonor, isLoading: isProfileLoading } = useUserProfile();
    const [pageViews, setPageViews] = useLocalStorageWithExpiry<number>('nagPageViews', 0, 30);
    const [declined, setDeclined] = useLocalStorageWithExpiry<boolean>('nagDeclined', false, NAG_DECLINE_EXPIRY_DAYS);

    const [showNag, setShowNag] = useState(false);
    const pathname = usePathname();
    
    // Increment page views on navigation
    useEffect(() => {
        if (isProfileLoading || isDonor) return;

        const ignoredPaths = ['/login', '/politica-de-privacidad', '/terminos-y-condiciones', '/mis-pronosticos'];
        if (ignoredPaths.includes(pathname)) {
            return;
        }
        const timer = setTimeout(() => {
            setPageViews(views => (views || 0) + 1);
        }, 500);

        return () => clearTimeout(timer);
    }, [pathname, setPageViews, isProfileLoading, isDonor]);

    // Determine if the nag screen should be shown
    useEffect(() => {
        if (isProfileLoading) return;
        if (isDonor || declined) {
             setShowNag(false);
             return;
        }
        
        if (pageViews >= NAG_FREQUENCY_PAGE_VIEWS) {
            setShowNag(true);
        }
    }, [isDonor, declined, pageViews, isProfileLoading]);

    const handleClose = () => {
        setShowNag(false);
        setPageViews(0);
        setDeclined(true);
    };
    
    const handleAccept = () => {
        setShowNag(false);
        setPageViews(0);
    };

    return { 
        showNag, 
        handleClose,
        handleAccept,
        isDonor, 
        isLoading: isProfileLoading 
    };
}
