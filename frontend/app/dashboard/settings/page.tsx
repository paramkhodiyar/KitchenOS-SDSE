"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { resetPin } from "@/services/authService";
import { Download, Save, ShieldCheck, User } from "lucide-react";
import { getRevenueReport, getOrderReport, getStockReport } from "@/services/reportService";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);

    // Pin Management State
    const [cashierPin, setCashierPin] = useState("");
    const [kitchenPin, setKitchenPin] = useState("");

    const handleDownloadReport = async () => {
        try {
            setLoading(true);
            const [revenue, orders, stock] = await Promise.all([
                getRevenueReport(),
                getOrderReport(),
                getStockReport()
            ]);

            const reportData = {
                timestamp: new Date().toISOString(),
                revenue,
                orders,
                stock
            };

            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success("Report downloaded successfully");
        } catch (error) {
            toast.error("Failed to download report");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePin = async (role: "CASHIER" | "KITCHEN", pin: string) => {
        if (pin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }

        try {
            setLoading(true);
            await resetPin(role, pin);
            toast.success(`${role} PIN updated successfully`);
            if (role === "CASHIER") setCashierPin("");
            else setKitchenPin("");

        } catch (error) {
            toast.error("Failed to update PIN");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your store preferences</p>
            </div>

            {/* Reports Section */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Export Data
                        </h2>
                        <p className="text-sm text-muted-foreground">Download comprehensive store reports</p>
                    </div>
                    <Button onClick={handleDownloadReport} disabled={loading}>
                        {loading ? "Exporting..." : "Download Report"}
                    </Button>
                </div>
            </div>

            {/* PIN Management Section */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Security & Access
                    </h2>
                    <p className="text-sm text-muted-foreground">Update access PINs for your staff</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Cashier PIN */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                                <User className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold">Cashier Access</h3>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="New Cashier PIN"
                                value={cashierPin}
                                onChange={(e) => setCashierPin(e.target.value)}
                                className="font-mono"
                            />
                            <Button
                                onClick={() => handleUpdatePin("CASHIER", cashierPin)}
                                disabled={!cashierPin || loading}
                                size="icon"
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Kitchen PIN */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-stone-200 text-stone-700 rounded-lg">
                                <User className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold">Kitchen Access</h3>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="New Kitchen PIN"
                                value={kitchenPin}
                                onChange={(e) => setKitchenPin(e.target.value)}
                                className="font-mono"
                            />
                            <Button
                                onClick={() => handleUpdatePin("KITCHEN", kitchenPin)}
                                disabled={!kitchenPin || loading}
                                size="icon"
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
