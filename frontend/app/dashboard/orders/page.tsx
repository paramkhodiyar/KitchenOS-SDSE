"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, Order } from "@/services/orderService";
import { Loader2, RefreshCw, ShoppingBag, Clock, CheckCircle2, XCircle, ChefHat, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
    PREPARING: { label: "In Kitchen", icon: ChefHat, color: "text-blue-600 bg-blue-50 border-blue-200" },
    READY: { label: "Ready to Serve", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, color: "text-gray-600 bg-gray-50 border-gray-200" },
    CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
};

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOrders = async () => {
        // Only set main loading on initial fetch if empty
        if (orders.length === 0) setLoading(true);
        try {
            const data = await getOrders();

            // Priority for sorting: READY > PREPARING > PENDING > COMPLETED > CANCELLED
            const statusPriority: Record<string, number> = {
                READY: 0,
                PREPARING: 1,
                PENDING: 2,
                COMPLETED: 3,
                CANCELLED: 4
            };

            const sorted = [...data].sort((a, b) => {
                const pA = statusPriority[a.status] ?? 99;
                const pB = statusPriority[b.status] ?? 99;

                if (pA !== pB) return pA - pB;

                // If same status, show newest first
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setOrders(sorted);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleMarkCompleted = async (orderId: string) => {
        setActionLoading(orderId);
        try {
            await updateOrderStatus(orderId, "COMPLETED");
            toast.success("Order marked as completed");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const [activeFilter, setActiveFilter] = useState("ALL");
    const filters = [
        { label: "All", value: "ALL" },
        { label: "Ready", value: "READY" },
        { label: "In Kitchen", value: "PREPARING" },
        { label: "Pending", value: "PENDING" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" },
    ];

    const filteredOrders = orders.filter(order => {
        if (activeFilter === "ALL") return true;
        return order.status === activeFilter;
    });

    return (
        <div className="space-y-6 p-6 pb-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                    <p className="text-muted-foreground mt-1">View and track past orders</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 pb-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => {
                            setActiveFilter(filter.value);
                            setCurrentPage(1);
                        }}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors ring-1 ring-inset",
                            activeFilter === filter.value
                                ? "bg-primary text-primary-foreground ring-primary"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted ring-border hover:text-foreground"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/30">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">Try changing the filter or create a new order</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order, index) => {
                        const StatusIcon = statusConfig[order.status]?.icon || Clock;
                        const statusStyle = statusConfig[order.status]?.color || "text-gray-500 bg-gray-100";

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 relative overflow-hidden"
                            >
                                {/* Header / Status */}
                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <span className="text-xs font-mono text-muted-foreground uppercase">
                                        #{order.id.slice(-6)}
                                    </span>
                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border w-fit", statusStyle)}>
                                        <StatusIcon className="w-4 h-4" />
                                        {statusConfig[order.status]?.label || order.status}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {new Date(order.createdAt).toLocaleString(undefined, {
                                            timeStyle: "short",
                                            dateStyle: "medium"
                                        })}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex-1">
                                    <div className="space-y-1">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="flex-1">
                                                    <span className="font-semibold text-foreground">{item.quantity}x</span> {item.product.name}
                                                </span>
                                                <span className="text-muted-foreground tabular-nums">
                                                    ₹{item.price * item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.items.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic">No items</div>
                                    )}
                                </div>

                                {/* Total & Actions */}
                                <div className="min-w-[140px] text-right md:border-l pl-4 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-muted-foreground md:hidden">Total</span>
                                        <span className="text-xl font-bold tabular-nums">₹{order.total}</span>
                                    </div>

                                    {order.status === "READY" && (
                                        <Button
                                            size="sm"
                                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleMarkCompleted(order.id)}
                                            disabled={actionLoading === order.id}
                                        >
                                            {actionLoading === order.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Mark Done
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {filteredOrders.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">
                                Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / itemsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
