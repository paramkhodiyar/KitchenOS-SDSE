"use client";

import { useEffect, useState } from "react";
import {
    getRawMaterials,
    updateRawMaterialStatus,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    RawMaterial
} from "@/services/inventoryService";
import { toast } from "react-hot-toast";
import { Loader2, Package, Plus, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryPage() {
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editItem, setEditItem] = useState<RawMaterial | null>(null);
    const [deleteItem, setDeleteItem] = useState<RawMaterial | null>(null);
    const [itemName, setItemName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getRawMaterials();
            setMaterials(data);
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const oldStatus = materials.find(m => m.id === id)?.status;
        try {
            setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
            await updateRawMaterialStatus(id, newStatus);
            toast.success(`Updated status to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
            setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: oldStatus as any } : m));
        }
    };

    const handleCreate = async () => {
        if (!itemName.trim()) return;
        setIsSubmitting(true);
        try {
            await createRawMaterial(itemName);
            toast.success("Item added successfully");
            setItemName("");
            setIsAddOpen(false);
            loadData();
        } catch (error) {
            toast.error("Failed to add item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editItem || !itemName.trim()) return;
        setIsSubmitting(true);
        try {
            await updateRawMaterial(editItem.id, itemName);
            toast.success("Item updated successfully");
            setItemName("");
            setEditItem(null);
            loadData();
        } catch (error) {
            toast.error("Failed to update item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsSubmitting(true);
        try {
            await deleteRawMaterial(deleteItem.id);
            toast.success("Item deleted successfully");
            setDeleteItem(null);
            loadData();
        } catch (error) {
            toast.error("Failed to delete item");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <Button onClick={() => { setItemName(""); setIsAddOpen(true); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : materials.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p>No raw materials configured.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {materials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((material) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={material.id}
                            className="bg-card border border-border p-4 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-3 h-3 rounded-full", {
                                    "bg-green-500": material.status === "AVAILABLE",
                                    "bg-amber-500": material.status === "LOW",
                                    "bg-red-500": material.status === "OUT",
                                })} />
                                <span className="font-medium text-lg">{material.name}</span>
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Status Buttons */}
                                <div className="flex bg-muted/50 p-1 rounded-lg mr-2">
                                    <button
                                        onClick={() => handleUpdateStatus(material.id, "AVAILABLE")}
                                        className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium",
                                            material.status === "AVAILABLE" ? "bg-background shadow text-green-600" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        OK
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(material.id, "LOW")}
                                        className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium",
                                            material.status === "LOW" ? "bg-background shadow text-amber-600" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        Low
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(material.id, "OUT")}
                                        className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium",
                                            material.status === "OUT" ? "bg-background shadow text-red-600" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        Out
                                    </button>
                                </div>

                                {/* Edit Actions */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setItemName(material.name); setEditItem(material); }}
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteItem(material)}
                                >
                                    <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Pagination Controls */}
                    {materials.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">
                                Page {currentPage} of {Math.ceil(materials.length / itemsPerPage)}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(materials.length / itemsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(materials.length / itemsPerPage)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals using generic backdrop */}
            <AnimatePresence>
                {(isAddOpen || editItem || deleteItem) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => { setIsAddOpen(false); setEditItem(null); setDeleteItem(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Add Modal */}
                            {isAddOpen && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Add Raw Material</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Name</label>
                                            <Input
                                                value={itemName}
                                                onChange={e => setItemName(e.target.value)}
                                                placeholder="e.g. Milk, Cheese, Sugar"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                            <Button onClick={handleCreate} disabled={!itemName.trim() || isSubmitting}>
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Edit Modal */}
                            {editItem && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">Edit Raw Material</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Name</label>
                                            <Input
                                                value={itemName}
                                                onChange={e => setItemName(e.target.value)}
                                                placeholder="Item Name"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
                                            <Button onClick={handleEdit} disabled={!itemName.trim() || isSubmitting}>
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Delete Modal */}
                            {deleteItem && (
                                <>
                                    <div className="flex items-center gap-3 text-destructive mb-4">
                                        <AlertTriangle className="w-6 h-6" />
                                        <h2 className="text-xl font-bold">Delete Item?</h2>
                                    </div>
                                    <p className="text-muted-foreground mb-6">
                                        Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteItem.name}"</span>?
                                        This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setDeleteItem(null)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
