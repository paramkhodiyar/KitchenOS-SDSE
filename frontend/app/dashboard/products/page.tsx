"use client";

import { useEffect, useState } from "react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    Product
} from "@/services/productService";
import { toast } from "react-hot-toast";
import { Loader2, Package, Plus, Pencil, Trash2, AlertTriangle, Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal States
    const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
    const [deleteItem, setDeleteItem] = useState<Product | null>(null);
    const [currentItem, setCurrentItem] = useState<Partial<Product>>({
        name: "", price: 0, stock: 0, minStock: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentItem.name?.trim()) return;
        setIsSubmitting(true);
        try {
            if (modalMode === "ADD") {
                await createProduct(currentItem);
                toast.success("Product created!");
            } else if (modalMode === "EDIT" && currentItem.id) {
                await updateProduct(currentItem.id, {
                    name: currentItem.name,
                    price: Number(currentItem.price),
                    stock: Number(currentItem.stock),
                    minStock: Number(currentItem.minStock),
                });
                toast.success("Product updated!");
            }
            setModalMode(null);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (product: Product) => {
        const oldState = product.isActive;
        // Optimistic
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));

        try {
            await updateProduct(product.id, { isActive: !product.isActive });
            toast.success(product.isActive ? "Archived product" : "Restored product");
        } catch (error) {
            // Revert
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: oldState } : p));
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setIsSubmitting(true);
        try {
            await deleteProduct(deleteItem.id);
            toast.success("Product deleted!");
            setDeleteItem(null);
            loadData();
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (product: Product) => {
        setCurrentItem({ ...product });
        setModalMode("EDIT");
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-muted-foreground text-sm">Manage items, prices, and stock</p>
                </div>
                <Button onClick={() => {
                    setCurrentItem({ name: "", price: 0, stock: 100, minStock: 10 });
                    setModalMode("ADD");
                }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-9 bg-card"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p>No products found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={product.id}
                            className={cn("bg-card border p-4 rounded-xl flex flex-col gap-3 hover:shadow-md transition-all", !product.isActive && "opacity-60 grayscale")}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                    <p className="text-primary font-bold">₹{product.price}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteItem(product)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-muted/50 p-2 rounded-lg">
                                    <span className="text-muted-foreground block text-xs uppercase">Stock</span>
                                    <span className={cn("font-mono font-medium", product.stock <= product.minStock ? "text-amber-600" : "")}>
                                        {product.stock}
                                    </span>
                                </div>
                                <div className="bg-muted/50 p-2 rounded-lg">
                                    <span className="text-muted-foreground block text-xs uppercase">Min Limit</span>
                                    <span className="font-mono font-medium">{product.minStock}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t mt-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {product.isActive ? "Active" : "Archived"}
                                </span>
                                {/* Toggle Simulation with Button since Switch might need extra setup */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 text-xs", product.isActive ? "text-green-600 bg-green-50" : "text-muted-foreground bg-muted")}
                                    onClick={() => handleToggleActive(product)}
                                >
                                    {product.isActive ? "Displaying" : "Hidden"}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* General Modal */}
            <AnimatePresence>
                {(modalMode || deleteItem) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => { setModalMode(null); setDeleteItem(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Add/Edit Form */}
                            {modalMode && (
                                <>
                                    <h2 className="text-xl font-bold mb-4">{modalMode === "ADD" ? "Add Product" : "Edit Product"}</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Name</label>
                                            <Input
                                                value={currentItem.name}
                                                onChange={e => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Product Name"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={currentItem.price?.toString().replace(/^0+/, '')}
                                                onChange={e => setCurrentItem(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Stock</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={currentItem.stock?.toString()}
                                                    onChange={e => setCurrentItem(prev => ({ ...prev, stock: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Min Limit</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={currentItem.minStock?.toString()}
                                                    onChange={e => setCurrentItem(prev => ({ ...prev, minStock: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button variant="ghost" onClick={() => setModalMode(null)}>Cancel</Button>
                                            <Button onClick={handleSave} disabled={!currentItem.name || isSubmitting}>
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Product"}
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
                                        <h2 className="text-xl font-bold">Delete Product?</h2>
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
