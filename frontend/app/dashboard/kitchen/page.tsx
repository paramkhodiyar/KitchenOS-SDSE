"use client";

import { useEffect, useState } from "react";
import { getKitchenOrders, updateOrderStatus, Order } from "@/services/orderService";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await getKitchenOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch kitchen orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus as any } : o
            ));

            await updateOrderStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus}`);

            // If completed/cancelled, remove from view after delay
            if (["READY", "COMPLETED", "CANCELLED"].includes(newStatus)) {
                setTimeout(fetchOrders, 2000);
            }
        } catch (error) {
            toast.error("Failed to update status");
            fetchOrders(); // Revert
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <ChefHat className="w-12 h-12 mb-4 animate-bounce" />
                <p>Loading Kitchen...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mb-4 text-green-500/50" />
                <h2 className="text-xl font-medium text-foreground">All Clear, Chef!</h2>
                <p>No active orders in queue.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold px-1">Kitchen Queue ({orders.length})</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                    {orders.map((order) => {
                        const elapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);

                        return (
                            <motion.div
                                layout
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "bg-card rounded-2xl border p-5 shadow-sm relative overflow-hidden",
                                    order.status === "PREPARING" ? "border-orange-200 ring-2 ring-orange-100" : "border-border"
                                )}
                            >
                                {order.status === "PREPARING" && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-bl-xl">
                                        PREPARING
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{elapsed}m ago</span>
                                    </div>
                                    <div className="font-mono text-xs text-muted-foreground">
                                        #{order.id.slice(-4)}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <span className="text-lg font-medium">
                                                {item.quantity}x {item.product.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {order.status === "PENDING" && (
                                        <Button
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                            onClick={() => handleStatusUpdate(order.id, "PREPARING")}
                                        >
                                            Start Cooking
                                        </Button>
                                    )}
                                    {order.status === "PREPARING" && (
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleStatusUpdate(order.id, "READY")}
                                        >
                                            Mark Ready
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
