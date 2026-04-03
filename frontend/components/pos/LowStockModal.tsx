"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getRawMaterials } from "@/services/inventoryService";
import { cn } from "@/lib/utils";

interface LowStockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LowStockModal({ isOpen, onClose }: LowStockModalProps) {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const data = await getRawMaterials();
            setMaterials(data.filter((m: any) => m.status === "LOW" || m.status === "OUT"));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 max-h-[80vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Low Stock Items
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {loading ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="text-center p-10 text-muted-foreground">
                                No low stock items!
                            </div>
                        ) : (
                            materials.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-3 rounded-xl border">
                                    <span className="font-medium">{m.name}</span>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-1 rounded-full",
                                        m.status === "OUT" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {m.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
