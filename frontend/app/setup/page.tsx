"use client";

import { useState, useEffect } from "react";
import { setupStore } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Store, ShieldCheck, CreditCard, ChefHat, CheckCircle } from "lucide-react";
import Link from "next/link";

type Step = "NAME" | "OWNER_PIN" | "CASHIER_PIN" | "KITCHEN_PIN" | "SUCCESS";

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("NAME");
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [storeName, setStoreName] = useState("");
    const [ownerPin, setOwnerPin] = useState("");
    const [cashierPin, setCashierPin] = useState("");
    const [kitchenPin, setKitchenPin] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const handleSetup = async () => {
        if (kitchenPin.length < 4) {
            toast.error("PIN too short");
            return;
        }

        try {
            setIsLoading(true);
            const data = await setupStore({
                storeName,
                ownerPin,
                cashierPin,
                kitchenPin,
            });
            setGeneratedCode(data.storeCode);
            setStep("SUCCESS");
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || "Setup failed");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === "NAME" && storeName.length > 2) setStep("OWNER_PIN");
        else if (step === "OWNER_PIN" && ownerPin.length >= 4) setStep("CASHIER_PIN");
        else if (step === "CASHIER_PIN" && cashierPin.length >= 4) setStep("KITCHEN_PIN");
        else if (step === "KITCHEN_PIN") handleSetup();
        else toast.error("Please fill the details correctly");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md">

                {step !== "SUCCESS" && (
                    <div className="mb-8">
                        <Link href="/login" className="text-sm text-muted-foreground flex items-center gap-1 mb-6">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                        <h1 className="text-2xl font-bold">New Store Setup</h1>
                        <p className="text-muted-foreground">step {["NAME", "OWNER_PIN", "CASHIER_PIN", "KITCHEN_PIN"].indexOf(step) + 1} of 4</p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === "NAME" && (
                        <motion.div
                            key="name"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <label className="text-sm font-medium">What is your store name?</label>
                            <Input
                                placeholder="My Awesome Café"
                                className="h-14 text-lg"
                                value={storeName}
                                onChange={e => setStoreName(e.target.value)}
                                autoFocus
                            />
                            <Button size="xl" className="w-full mt-4" onClick={nextStep}>Next</Button>
                        </motion.div>
                    )}

                    {step === "OWNER_PIN" && (
                        <motion.div
                            key="owner"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 text-stone-600 mb-2">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="font-medium">Owner PIN</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">You will use this to access reports and settings.</p>

                            <Input
                                type="tel"
                                placeholder="Enter 4-6 digit PIN"
                                className="h-14 text-lg tracking-widest text-center"
                                value={ownerPin}
                                onChange={e => setOwnerPin(e.target.value)}
                                maxLength={6}
                                autoFocus
                            />
                            <Button size="xl" className="w-full mt-4" onClick={nextStep}>Next</Button>
                        </motion.div>
                    )}

                    {step === "CASHIER_PIN" && (
                        <motion.div
                            key="cashier"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="font-medium">Cashier PIN</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Give this to staff who take orders.</p>

                            <Input
                                type="tel"
                                placeholder="Enter 4-6 digit PIN"
                                className="h-14 text-lg tracking-widest text-center"
                                value={cashierPin}
                                onChange={e => setCashierPin(e.target.value)}
                                maxLength={6}
                                autoFocus
                            />
                            <Button size="xl" className="w-full mt-4" onClick={nextStep}>Next</Button>
                        </motion.div>
                    )}

                    {step === "KITCHEN_PIN" && (
                        <motion.div
                            key="kitchen"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 text-stone-500 mb-2">
                                <ChefHat className="w-5 h-5" />
                                <span className="font-medium">Kitchen PIN</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">For the kitchen display screen.</p>

                            <Input
                                type="tel"
                                placeholder="Enter 4-6 digit PIN"
                                className="h-14 text-lg tracking-widest text-center"
                                value={kitchenPin}
                                onChange={e => setKitchenPin(e.target.value)}
                                maxLength={6}
                                autoFocus
                            />
                            <Button
                                size="xl"
                                className="w-full mt-4"
                                onClick={handleSetup}
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating..." : "Complete Setup"}
                            </Button>
                        </motion.div>
                    )}

                    {step === "SUCCESS" && (
                        <SuccessView generatedCode={generatedCode} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function SuccessView({ generatedCode }: { generatedCode: string }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
        >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-foreground">You are all set!</h2>
                <p className="text-muted-foreground mt-2">Save this code securely.</p>
            </div>

            <div className="bg-card border border-primary/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Your Store Code</p>
                <p className="text-4xl font-mono font-bold tracking-widest text-primary">{generatedCode}</p>

                {timeLeft > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="h-full bg-primary"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {timeLeft > 0
                        ? `Please write this down. You can proceed in ${timeLeft}s`
                        : "Ensure you have recorded the code before proceeding."}
                </p>

                <Button
                    size="xl"
                    className="w-full"
                    onClick={() => router.push("/login")}
                    disabled={timeLeft > 0}
                >
                    {timeLeft > 0 ? `Wait ${timeLeft}s` : "I have noted the code"}
                </Button>
            </div>
        </motion.div>
    );
}
