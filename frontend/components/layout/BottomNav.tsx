"use client";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UtensilsCrossed,
    ChefHat,
    History,
    Package,
    Settings,
    LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
    const { role } = useAuthStore();
    const pathname = usePathname();

    if (!role) return null;

    const navItems = {
        OWNER: [
            { href: "/dashboard/reports", label: "Overview", icon: LayoutDashboard },
            { href: "/dashboard/products", label: "Menu", icon: UtensilsCrossed },
            { href: "/dashboard/inventory", label: "Stock", icon: Package },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ],
        CASHIER: [
            { href: "/dashboard/pos", label: "New Order", icon: UtensilsCrossed },
            { href: "/dashboard/orders", label: "History", icon: History },
            { href: "/dashboard/inventory", label: "Stock", icon: Package },
        ],
        KITCHEN: [
            { href: "/dashboard/kitchen", label: "Queue", icon: ChefHat },
            { href: "/dashboard/inventory", label: "Stock", icon: Package },
        ]
    };

    const items = navItems[role] || [];

    return (
        <div className="bg-white/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 z-50 safe-area-bottom">
            {items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-pill"
                                className="absolute -top-[1px] w-12 h-1 bg-primary rounded-b-full"
                            />
                        )}
                        <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
