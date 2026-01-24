'use client';

// This component is now a simple wrapper.
// The previous logic for the nag screen and ad management has been removed
// based on recent user requests to implement a new content gating strategy.

export function AppManager({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
