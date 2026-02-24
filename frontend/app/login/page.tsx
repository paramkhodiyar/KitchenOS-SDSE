"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, CreditCard, Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { PinPad } from "@/components/login/PinPad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "STORE_CODE" | "ROLE_SELECT" | "PIN_ENTRY";
type Role = "OWNER" | "CASHIER" | "KITCHEN";

export default function LoginPage() {
    const router = useRouter();
    const { login, token } = useAuthStore();

    const [step, setStep] = useState<Step>("STORE_CODE");
    const [storeCode, setStoreCode] = useState("");
    const [role, setRole] = useState<Role | null>(null);
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (token) {
            router.replace("/dashboard");
        }
    }, [token, router]);

    // Check for persisted store code
    useEffect(() => {
        const savedCode = localStorage.getItem("kitchenos_store_code");
        if (savedCode && !token) {
            setStoreCode(savedCode);
            setStep("ROLE_SELECT");
        }
    }, [token]);

    const handleDigitPress = (digit: string) => {
        if (pin.length < 6) {
            setPin((prev) => prev + digit);
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    const handleLogin = async () => {
        if (!role || !storeCode) return;

        try {
            setIsLoading(true);
            await login(storeCode, pin, role);

            // Persist store code on successful login
            localStorage.setItem("kitchenos_store_code", storeCode);

            toast.success(`Welcome back, ${role.toLowerCase()}!`);
            router.replace("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || "Invalid PIN or Store Code");
            setPin("");
        } finally {
            setIsLoading(false);
        }
    };

    const MaskedChar = ({ char, isLast }: { char: string, isLast: boolean }) => {
        const [show, setShow] = useState(isLast); // Only show last initially

        useEffect(() => {
            if (isLast) {
                setShow(true);
                const timer = setTimeout(() => setShow(false), 800); // Hide after 800ms
                return () => clearTimeout(timer);
            } else {
                setShow(false);
            }
        }, [isLast]);

        return (
            <div className="w-8 h-12 flex items-center justify-center text-2xl font-mono font-bold border-b-2 border-primary/50">
                {show ? char : "•"}
            </div>
        );
    };

    const roles = [
        { id: "OWNER", label: "Owner", icon: ShieldCheck, color: "bg-stone-800 text-stone-100" },
        { id: "CASHIER", label: "Cashier", icon: CreditCard, color: "bg-orange-100 text-orange-900" },
        { id: "KITCHEN", label: "Kitchen", icon: ChefHat, color: "bg-stone-200 text-stone-800" },
    ];

    const handleSwitchStore = () => {
        localStorage.removeItem("kitchenos_store_code");
        setStoreCode("");
        setStep("STORE_CODE");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md">

                {/* Header */}
                <motion.div
                    layout
                    className="text-center mb-12"
                >
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                            <Store className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">KitchenOS</h1>
                    <p className="text-muted-foreground mt-2">Operating System for Modern Cafés</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === "STORE_CODE" && (
                        <motion.div
                            key="store-code"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium pl-1">Enter Store Code</label>
                                <Input
                                    placeholder="e.g. KOS-1234"
                                    className="h-14 text-lg text-center tracking-widest uppercase font-mono"
                                    value={storeCode}
                                    onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <Button
                                size="xl"
                                className="w-full"
                                onClick={() => {
                                    if (storeCode.length > 3) setStep("ROLE_SELECT");
                                    else toast.error("Please enter a valid store code");
                                }}
                            >
                                Continue
                            </Button>

                            <div className="text-center pt-4">
                                <Link href="/setup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    New store? <span className="font-medium underline underline-offset-4">Setup here</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {step === "ROLE_SELECT" && (
                        <motion.div
                            key="role-select"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-semibold ml-2">Who are you?</h2>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleSwitchStore} className="text-muted-foreground text-xs hover:text-destructive">
                                    Switch Store
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {roles.map((r) => (
                                    <motion.button
                                        key={r.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setRole(r.id as Role);
                                            setStep("PIN_ENTRY");
                                        }}
                                        className={cn(
                                            "flex items-center p-6 rounded-2xl shadow-sm border border-border transition-all hover:shadow-md",
                                            "text-left bg-card w-full"
                                        )}
                                    >
                                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mr-5", r.color)}>
                                            <r.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">{r.label}</div>
                                            <div className="text-sm text-muted-foreground">Tap to login</div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === "PIN_ENTRY" && (
                        <motion.div
                            key="pin-entry"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="flex items-center mb-8 justify-between">
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setStep("ROLE_SELECT");
                                    setPin("");
                                }} className="-ml-2">
                                    <ArrowLeft />
                                </Button>
                                <div className="text-center flex-1 pr-8">
                                    <h2 className="text-lg font-medium">Enter {role?.toLowerCase()} PIN</h2>
                                    <div className="flex justify-center mt-4">
                                        <div className="relative w-32 h-12 flex justify-center items-center gap-2">
                                            {pin.split('').map((char, index) => (
                                                <MaskedChar key={index} char={char} isLast={index === pin.length - 1} />
                                            ))}
                                            {[...Array(Math.max(0, 4 - pin.length))].map((_, i) => (
                                                <div key={`empty-${i}`} className="w-3 h-3 bg-secondary rounded-full" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <PinPad
                                onPress={handleDigitPress}
                                onDelete={handleDelete}
                                onSubmit={handleLogin}
                                isLoading={isLoading}
                                length={pin.length}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
