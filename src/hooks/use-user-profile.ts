'use client';

import { useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase/hooks';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, type Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

// Define the shape of the user profile data from Firestore
interface UserProfileData {
    donationExpiry?: Timestamp;
}

export function useUserProfile() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfileData>(userDocRef);

  const isDonor = useMemo(() => {
    if (!userProfile || !userProfile.donationExpiry) return false;
    // Firestore Timestamps have a toDate() method
    const expiryDate = userProfile.donationExpiry.toDate();
    return expiryDate > new Date();
  }, [userProfile]);

  return {
    user,
    userProfile,
    isLoading: isUserLoading || isProfileLoading,
    error: profileError,
    isDonor,
    donationExpiry: userProfile?.donationExpiry,
  };
}
