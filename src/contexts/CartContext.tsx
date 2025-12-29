
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image_url: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: { id: string; title: string; price: number; sale_price?: number | null; image_url: string }) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { user } = useAuth();

    // Load cart from Supabase or local storage
    useEffect(() => {
        if (user) {
            const syncCart = async () => {
                const savedCart = localStorage.getItem("cart");
                if (savedCart) {
                    try {
                        const localItems: CartItem[] = JSON.parse(savedCart);
                        if (localItems.length > 0) {
                            // Sync each item to Supabase
                            for (const item of localItems) {
                                const { data: existingItem } = await supabase
                                    .from('cart_items')
                                    .select('quantity')
                                    .eq('user_id', user.id)
                                    .eq('product_id', item.id)
                                    .single();

                                if (existingItem) {
                                    await supabase
                                        .from('cart_items')
                                        .update({ quantity: existingItem.quantity + item.quantity })
                                        .eq('user_id', user.id)
                                        .eq('product_id', item.id);
                                } else {
                                    await supabase
                                        .from('cart_items')
                                        .insert({
                                            user_id: user.id,
                                            product_id: item.id,
                                            quantity: item.quantity
                                        });
                                }
                            }
                            // Clear local cart after syncing
                            localStorage.removeItem("cart");
                            toast.success("Cart moved to your account");
                        }
                    } catch (e) {
                        console.error("Failed to parse cart from local storage", e);
                    }
                }
                await fetchCart();
            };
            syncCart();
        } else {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart from local storage", e);
                }
            } else {
                setItems([]); // Clear items if no local cart
            }
        }
    }, [user]);

    // Save to local storage if not authenticated
    useEffect(() => {
        if (!user) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, user]);

    const fetchCart = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching cart:', error);
            return;
        }

        if (data) {
            const mappedItems: CartItem[] = data.map((item: any) => ({
                id: item.product.id,
                title: item.product.title,
                price: item.product.sale_price || item.product.price,
                image_url: item.product.image_url,
                quantity: item.quantity
            }));
            setItems(mappedItems);
        }
    };

    const addToCart = async (product: { id: string; title: string; price: number; sale_price?: number | null; image_url: string }) => {
        if (user) {
            const existing = items.find((item) => item.id === product.id);
            if (existing) {
                await updateQuantity(product.id, existing.quantity + 1);
                toast.info("Item quantity updated in cart");
            } else {
                const { error } = await supabase.from('cart_items').insert({
                    user_id: user.id,
                    product_id: product.id,
                    quantity: 1
                });
                if (error) {
                    toast.error("Failed to add to cart");
                    return;
                }
                await fetchCart();
                toast.success("Added to cart");
            }
        } else {
            setItems((prev) => {
                const existing = prev.find((item) => item.id === product.id);
                if (existing) {
                    toast.info("Item quantity updated in cart");
                    return prev.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                toast.success("Added to cart");
                return [...prev, {
                    id: product.id,
                    title: product.title,
                    price: product.sale_price || product.price,
                    image_url: product.image_url,
                    quantity: 1
                }];
            });
        }
    };

    const removeFromCart = async (productId: string) => {
        if (user) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (error) {
                toast.error("Failed to remove item");
                return;
            }
            await fetchCart();
            toast.success("Item removed from cart");
        } else {
            setItems((prev) => prev.filter((item) => item.id !== productId));
            toast.success("Item removed from cart");
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        if (user) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (error) {
                toast.error("Failed to update quantity");
                return;
            }
            // Optimistic update or refetch
            setItems((prev) =>
                prev.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );
        } else {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (user) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);
            if (error) {
                toast.error("Failed to clear cart");
                return;
            }
            setItems([]);
            toast.success("Cart cleared");
        } else {
            setItems([]);
            toast.success("Cart cleared");
        }
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
