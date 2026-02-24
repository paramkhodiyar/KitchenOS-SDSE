"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Delete, Lock } from "lucide-react";

interface PinPadProps {
    onPress: (digit: string) => void;
    onDelete: () => void;
    onSubmit: () => void;
    isLoading?: boolean;
    length: number;
}

export function PinPad({ onPress, onDelete, onSubmit, isLoading, length }: PinPadProps) {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    return (
        <div className="w-full max-w-xs mx-auto mt-8">
            <div className="grid grid-cols-3 gap-4">
                {digits.map((digit) => {
                    if (digit === "") return <div key="empty" />;
                    if (digit === "del") {
                        return (
                            <Button
                                key="del"
                                variant="ghost"
                                size="xl"
                                className="h-20 w-full rounded-2xl text-2xl"
                                onClick={onDelete}
                                disabled={isLoading}
                            >
                                <Delete className="w-8 h-8" />
                            </Button>
                        );
                    }
                    return (
                        <Button
                            key={digit}
                            variant="secondary"
                            size="xl"
                            className="h-20 w-full rounded-2xl text-3xl font-medium shadow-sm border border-black/10 active:scale-95 transition-all"
                            onClick={() => onPress(digit)}
                            disabled={isLoading}
                        >
                            {digit}
                        </Button>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: length >= 4 ? 1 : 0, y: length >= 4 ? 0 : 20 }}
                className="mt-6"
            >
                <Button
                    className="w-full h-14 text-lg rounded-xl shadow-lg"
                    onClick={onSubmit}
                    disabled={isLoading || length < 4}
                >
                    {isLoading ? "Unlocking..." : "Enter KitchenOS"}
                </Button>
            </motion.div>
        </div>
    );
}
