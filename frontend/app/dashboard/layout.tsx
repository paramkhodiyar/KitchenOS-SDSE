"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { role, checkAuth, logout, isLoading } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        checkAuth();
        setMounted(true);
    }, [checkAuth]);

    useEffect(() => {
        if (mounted && !isLoading && !role) {
            router.replace("/login");
        }
    }, [mounted, isLoading, role, router]);

    if (!mounted || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-secondary rounded-xl mb-4" />
                    <div className="h-4 w-32 bg-secondary rounded" />
                </div>
            </div>
        );
    }

    if (!role) return null;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Top Header for Mobile Context */}
            <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
                <div className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary rounded-full" />
                    {useAuthStore.getState().storeName || "KitchenOS"}
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-secondary rounded-full text-xs font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {role}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        logout();
                        router.replace("/login");
                    }}>
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-2xl px-4 py-6">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
