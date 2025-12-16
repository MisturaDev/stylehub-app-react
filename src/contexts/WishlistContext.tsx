
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WishlistItem {
    id: string; // Product ID
    title: string;
    price: number;
    image_url: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (product: WishlistItem) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setItems([]); // Clear on logout
        }
    }, [user]);

    const fetchWishlist = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('wishlist_items')
            .select(`
                product_id,
                products (
                    id,
                    title,
                    price,
                    image_url
                )
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching favorites:', error);
            return;
        }

        if (data) {
            const mappedItems = data.map((item: any) => ({
                id: item.products.id,
                title: item.products.title,
                price: item.products.price,
                image_url: item.products.image_url,
            }));
            setItems(mappedItems);
        }
    };

    const addToWishlist = async (product: WishlistItem) => {
        if (!user) {
            toast.error("Please sign in to save items to your wishlist");
            return;
        }

        // Optimistic update
        if (isInWishlist(product.id)) return;

        const { error } = await supabase.from('wishlist_items').insert({
            user_id: user.id,
            product_id: product.id
        });

        if (error) {
            toast.error("Failed to add to wishlist");
            return;
        }

        setItems(prev => [...prev, product]);
        toast.success("Added to wishlist");
    };

    const removeFromWishlist = async (productId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) {
            toast.error("Failed to remove from wishlist");
            return;
        }

        setItems(prev => prev.filter(item => item.id !== productId));
        toast.success("Removed from wishlist");
    };

    const isInWishlist = (productId: string) => {
        return items.some(item => item.id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                wishlistCount: items.length
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
