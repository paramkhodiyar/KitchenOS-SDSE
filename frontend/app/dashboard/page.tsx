"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { role } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (role === "OWNER") router.replace("/dashboard/reports");
        else if (role === "CASHIER") router.replace("/dashboard/pos");
        else if (role === "KITCHEN") router.replace("/dashboard/kitchen");
        else router.replace("/login");
    }, [role, router]);

    return null;
}
