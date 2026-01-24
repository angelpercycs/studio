'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/firebase/hooks';
import { supabase } from '@/lib/supabase';

// Define the shape of the user profile data from Supabase
interface UserProfileData {
    id: string;
    email?: string;
    name?: string;
    photo_url?: string;
    donation_expiry?: string; // Supabase returns timestamps as ISO strings
}

export function useUserProfile() {
  const { user, isUserLoading } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  
  useEffect(() => {
    // If Firebase user is loading, we wait.
    if (isUserLoading) {
        setProfileLoading(true);
        return;
    }

    // If there is no Firebase user, there is no profile to fetch.
    if (!user) {
        setUserProfile(null);
        setProfileLoading(false);
        return;
    }
    
    const fetchUserProfile = async () => {
        setProfileLoading(true);
        setProfileError(null);

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.uid)
            .single();

        if (error) {
            // It's possible the profile doesn't exist yet if signup flow is interrupted.
            // We don't treat "not found" as a critical error.
            if (error.code !== 'PGRST116') {
                 console.error("Error fetching user profile from Supabase", error);
                 setProfileError(error as any);
            }
        }
        
        setUserProfile(data);
        setProfileLoading(false);
    };

    fetchUserProfile();

  }, [user, isUserLoading]);


  const isDonor = useMemo(() => {
    // Hardcode owner email as premium
    if (user?.email === 'percycsa@hotmail.com') {
        return true;
    }
    if (!userProfile || !userProfile.donation_expiry) return false;
    const expiryDate = new Date(userProfile.donation_expiry);
    return expiryDate > new Date();
  }, [userProfile, user]);

  return {
    user,
    userProfile,
    isLoading: isUserLoading || isProfileLoading,
    error: profileError,
    isDonor,
    donationExpiry: userProfile?.donation_expiry ? new Date(userProfile.donation_expiry) : null,
  };
}
