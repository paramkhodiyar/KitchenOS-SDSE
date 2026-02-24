"use client";

import { useEffect, useState } from "react";
import { getRevenueReport, getOrderReport, getStockReport, RevenueData, OrderData, StockData } from "@/services/reportService";
import { Loader2, TrendingUp, ShoppingBag, AlertTriangle, IndianRupee } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [orders, setOrders] = useState<OrderData | null>(null);
    const [stock, setStock] = useState<StockData | null>(null);
    const [dateRange, setDateRange] = useState<"today" | "week" | "month">("week"); // Default to week
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const now = new Date();
                let from = new Date(); // Default today 00:00

                if (dateRange === 'today') {
                    from.setHours(0, 0, 0, 0);
                } else if (dateRange === 'week') {
                    from.setDate(now.getDate() - 7);
                    from.setHours(0, 0, 0, 0);
                } else if (dateRange === 'month') {
                    from.setDate(now.getDate() - 30);
                    from.setHours(0, 0, 0, 0);
                }

                const [revData, orderData, stockData] = await Promise.all([
                    getRevenueReport(from, now),
                    getOrderReport(from, now),
                    getStockReport() // Stock is always current state
                ]);
                setRevenue(revData);
                setOrders(orderData);
                setStock(stockData);
            } catch (error) {
                console.error("Failed to load reports");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    if (loading) {
        return <div className="flex justify-center items-center h-full min-h-[50vh]"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    // Recharts Formatter type safety
    const currencyFormatter = (value: any) => [`₹${value}`, 'Revenue'];
    const dateFormatter = (label: any) => new Date(label).toLocaleDateString();

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Analytics Overview</h1>
                <div className="flex bg-secondary p-1 rounded-lg">
                    {(['today', 'week', 'month'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                                dateRange === range
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            {/* Summary Cards */}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden md:overflow-visible min-w-0">
                            <p className="text-sm font-medium text-muted-foreground truncate md:whitespace-normal md:overflow-visible">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-2 truncate md:whitespace-normal md:overflow-visible">₹{revenue?.totalRevenue?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="flex-shrink-0 p-2.5 bg-green-100 rounded-xl text-green-600">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden md:overflow-visible min-w-0">
                            <p className="text-sm font-medium text-muted-foreground truncate md:whitespace-normal md:overflow-visible">Total Orders</p>
                            <h3 className="text-2xl font-bold mt-2 truncate md:whitespace-normal md:overflow-visible">{orders?.totalOrders || 0}</h3>
                        </div>
                        <div className="flex-shrink-0 p-2.5 bg-blue-100 rounded-xl text-blue-600">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden md:overflow-visible min-w-0">
                            <p className="text-sm font-medium text-muted-foreground truncate md:whitespace-normal md:overflow-visible">Completion Rate</p>
                            <h3 className="text-2xl font-bold mt-2 truncate md:whitespace-normal md:overflow-visible">
                                {orders?.totalOrders ? Math.round((orders.completedOrders / orders.totalOrders) * 100) : 0}%
                            </h3>
                        </div>
                        <div className="flex-shrink-0 p-2.5 bg-purple-100 rounded-xl text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                        <div className="overflow-hidden md:overflow-visible min-w-0">
                            <p className="text-sm font-medium text-muted-foreground truncate md:whitespace-normal md:overflow-visible">Low Stock alerts</p>
                            <h3 className="text-2xl font-bold mt-2 text-amber-600 truncate md:whitespace-normal md:overflow-visible">{stock?.lowStockItems || 0}</h3>
                        </div>
                        <div className="flex-shrink-0 p-2.5 bg-amber-100 rounded-xl text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue?.dailyRevenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={currencyFormatter}
                                    labelFormatter={dateFormatter}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Orders Overview</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orders?.recentTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={dateFormatter}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Inventory Alerts Table */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Stock Alerts</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-left text-sm text-muted-foreground">
                                <th className="pb-3 font-medium">Item Name</th>
                                <th className="pb-3 font-medium">Current Stock</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {stock?.items.filter(i => i.status !== 'AVAILABLE').map((item, idx) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="py-3 font-medium">{item.name}</td>
                                    <td className="py-3 font-mono">{item.stock !== null ? item.stock : <span className="text-muted-foreground text-xs">N/A</span>}</td>
                                    <td className="py-3">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            item.status === 'OUT' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stock?.items || stock.items.filter(i => i.status !== 'AVAILABLE').length === 0) && (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                                        All systems normal. No stock alerts.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
