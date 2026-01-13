"use client";

import { useFirebase } from "@/firebase/provider";

/**
 * @deprecated useUser has been moved to src/firebase/hooks.ts. Please import from there.
 */
export function useUser() {
    const { user, isUserLoading, userError } = useFirebase();
    return { user, isUserLoading, userError };
}
