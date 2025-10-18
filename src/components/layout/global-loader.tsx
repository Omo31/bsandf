
'use client';

import { useUser } from "@/firebase";
import { Logo } from "../icons";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
    const { isUserLoading, areServicesAvailable } = useUser();

    if (isUserLoading || !areServicesAvailable) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Logo className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Connecting to services...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
