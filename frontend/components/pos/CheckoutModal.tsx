"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    X,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Wallet,
    CreditCard,
    Banknote,
    Smartphone
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createOrder, addItemToOrder } from "@/services/orderService";
import { getAccounts, recordIncome, Account, createAccount } from "@/services/accountService";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Stage = "REVIEW" | "SENDING" | "CONFLICT" | "PAYMENT";

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { items, total, clearCart } = useCartStore();
    const [stage, setStage] = useState<Stage>("REVIEW");
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const [conflictItem, setConflictItem] = useState<{ name: string; id: string; qty: number } | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStage("REVIEW");
            setCreatedOrderId(null);
            setConflictItem(null);
        }
    }, [isOpen]);

    const processOrder = async (orderIdToUse: string | null = null, resumeIndex = 0) => {
        setStage("SENDING");

        try {
            // 1. Create Order if not exists
            let orderId = orderIdToUse;
            if (!orderId) {
                const order = await createOrder();
                orderId = order.id;
                setCreatedOrderId(orderId);
            }

            // 2. Add Items
            for (let i = resumeIndex; i < items.length; i++) {
                const item = items[i];
                try {
                    await addItemToOrder(orderId!, item.productId, item.quantity);
                } catch (error: any) {
                    if (error.response?.status === 409) {
                        setConflictItem({ name: item.name, id: item.productId, qty: item.quantity });
                        setStage("CONFLICT");
                        // We pause here. User determines next step.
                        return; // Stop processing
                    }
                    throw error;
                }
            }

            // Success
            toast.success("Order Sent to Kitchen!");
            clearCart();
            fetchAccounts();
            setStage("PAYMENT");

        } catch (error) {
            console.error(error);
            toast.error("Failed to place order");
            setStage("REVIEW"); // Go back?
        }
    };

    const handleOverrideConfirm = async () => {
        if (!createdOrderId || !conflictItem) return;

        try {
            setStage("SENDING");
            // Retry the conflicting item with override
            await addItemToOrder(createdOrderId, conflictItem.id, conflictItem.qty, true);

            // Continue with remaining items
            // Find index of conflict item
            const idx = items.findIndex(i => i.productId === conflictItem.id);
            if (idx !== -1 && idx < items.length - 1) {
                // Resume loop from next item
                await processOrder(createdOrderId, idx + 1);
            } else {
                // Done
                toast.success("Order Sent to Kitchen!");
                clearCart();
                fetchAccounts();
                setStage("PAYMENT");
            }
        } catch (error) {
            toast.error("Override failed");
            setStage("REVIEW");
        }
    };

    const fetchAccounts = async () => {
        try {
            let data = await getAccounts();

            // Auto-create defaults if missing (Quick fix because seed might miss accounts)
            if (data.length === 0) {
                try { await createAccount("Cash Box", "CASH"); } catch (e) { }
                try { await createAccount("UPI Scanner", "UPI"); } catch (e) { }
                data = await getAccounts();
            }

            setAccounts(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePayment = async (accountId: string) => {
        if (!createdOrderId) return;
        try {
            setStage("SENDING"); // Re-use sending loading state
            await recordIncome(createdOrderId, accountId);
            toast.success("Payment Recorded!");
            onClose();
        } catch (error) {
            toast.error("Payment failed");
            setStage("PAYMENT");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-border/50 relative z-10 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {stage === "REVIEW" && "Review Order"}
                        {stage === "SENDING" && "Processing..."}
                        {stage === "CONFLICT" && "Inventory Warning"}
                        {stage === "PAYMENT" && "Collect Payment"}
                    </h2>
                    {stage !== "SENDING" && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    )}
                </div>

                {/* Content based on Stage */}

                {stage === "REVIEW" && (
                    <>
                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                            {items.map(item => (
                                <div key={item.productId} className="flex justify-between items-center border-b border-border pb-2">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                                    </div>
                                    <div className="font-semibold">₹{item.price * item.quantity}</div>
                                </div>
                            ))}

                            <div className="flex justify-between pt-4 text-xl font-bold">
                                <span>Total</span>
                                <span>₹{total()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                This will send the order to Kitchen.
                            </p>

                            <Button
                                size="xl"
                                className="w-full text-lg h-16 rounded-xl"
                                onClick={() => processOrder()}
                                disabled={items.length === 0}
                            >
                                Confirm & Send to Kitchen
                            </Button>
                        </div>
                    </>
                )}

                {stage === "SENDING" && (
                    <div className="flex-1 flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">Please wait...</p>
                    </div>
                )}

                {stage === "CONFLICT" && conflictItem && (
                    <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Low Stock Alert</h3>
                            <p className="text-muted-foreground">
                                <span className="font-semibold text-foreground">"{conflictItem.name}"</span> has insufficient raw materials.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Do you want to force this order anyway? This will log an override.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
                                Cancel Order
                            </Button>
                            <Button variant="destructive" size="lg" className="flex-1" onClick={handleOverrideConfirm}>
                                Force Override
                            </Button>
                        </div>
                    </div>
                )}

                {stage === "PAYMENT" && (
                    <div className="flex-1 flex flex-col space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Order Sent to Kitchen</span>
                            </div>
                            <p className="text-muted-foreground">Collect payment to finalize.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {accounts.map(acc => (
                                <Button
                                    key={acc.id}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5"
                                    onClick={() => handlePayment(acc.id)}
                                >
                                    {acc.type === "CASH" ? <Banknote className="w-8 h-8" /> : (acc.type === "UPI" ? <Smartphone className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />)}
                                    <span className="font-semibold">{acc.name}</span>
                                </Button>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
                            Skip Payment (Pay Later)
                        </Button>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
