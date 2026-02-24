"use client";

import { useEffect, useState } from "react";
import { getProducts, Product } from "@/services/productService";
import { useCartStore } from "@/store/cartStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

import { CheckoutModal } from "@/components/pos/CheckoutModal";

export default function POSPage() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const { items, addItem, updateQuantity, total } = useCartStore();

    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
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

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

    const filtered = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const cartTotal = total();
    const cartCount = items.reduce((a, b) => a + b.quantity, 0);

    return (
        <div className="space-y-6 pb-24">
            {/* Search Bar */}
            <div className="sticky top-0 bg-background pt-2 z-10 pb-4 -mx-6 px-6">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 h-12 text-lg rounded-xl shadow-sm bg-card"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
                    {categories.map((cat) => (
                        <button
                            key={cat as string}
                            onClick={() => setActiveCategory(cat as string)}
                            className={cn(
                                "flex-none px-4 py-2 rounded-full text-sm font-medium transition-all",
                                activeCategory === cat
                                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(product => {
                        const inCart = items.find(i => i.productId === product.id);

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={product.id}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all shadow-sm active:scale-95",
                                    inCart ? "border-primary bg-primary/5" : "border-border bg-card"
                                )}
                                onClick={() => addItem(product)}
                            >
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                                        <p className="text-muted-foreground">₹{product.price}</p>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        {inCart ? (
                                            <div className="flex items-center gap-3 bg-background rounded-lg p-1 shadow-sm border" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-secondary rounded">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-medium w-4 text-center">{inCart.quantity}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-secondary rounded">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Cart Floating Action Button / Bar */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-24 left-4 right-4 z-30"
                    >
                        <Button
                            size="xl"
                            className="w-full shadow-2xl flex justify-between items-center px-6 h-16 rounded-2xl"
                            onClick={() => {
                                setIsCheckoutOpen(true);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-foreground/20 px-3 py-1 rounded-lg text-sm font-bold">
                                    {cartCount}
                                </div>
                                <span className="font-semibold">Review Order</span>
                            </div>
                            <span className="font-bold text-xl">₹{cartTotal}</span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
        </div>
    );
}
