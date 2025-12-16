import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Heart, ThumbsUp, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  category: string;
  brand?: string;
  description?: string;
  is_featured?: boolean;
  created_at?: string;
  seller_id?: string;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sellerName, setSellerName] = useState("");

  useEffect(() => {
    if (product && isOpen) {
      fetchData();
    }
  }, [product, isOpen, user]);

  const fetchData = async () => {
    if (!product) return;

    // Get like count
    const { count } = await supabase
      .from("wishlist_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id);
    setLikeCount(count || 0);

    // Get seller name
    if (product.seller_id) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", product.seller_id)
        .single();
      if (data?.full_name) setSellerName(data.full_name);
    }

    if (user) {
      // Check favorite status
      const { data: favData } = await supabase
        .from("wishlist_items")
        .select()
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();
      setIsFavorite(!!favData);

      // Check like status
      const { data: likeData } = await supabase
        .from("wishlist_items")
        .select()
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();
      setIsLiked(!!likeData);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      return;
    }
    if (!product) return;

    if (isFavorite) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", product.id);
      setIsFavorite(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: product.id });
      setIsFavorite(true);
      toast.success("Added to wishlist");
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like products");
      return;
    }
    if (!product) return;

    if (isLiked) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", product.id);
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: product.id });
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  if (!product) return null;

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Quick View: {product.title}</DialogTitle>
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isNew && <Badge variant="new">New</Badge>}
              {hasDiscount && <Badge variant="sale">Sale</Badge>}
              {product.is_featured && <Badge variant="featured">Featured</Badge>}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {product.brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {product.brand}
              </p>
            )}
            <h2 className="text-2xl font-serif font-bold mb-2">{product.title}</h2>

            <div className="flex items-center gap-3 mb-4">
              <p className="text-2xl font-serif font-semibold text-accent">
                ${displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-lg text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </p>
              )}
              {hasDiscount && (
                <Badge variant="sale" className="text-xs">
                  {Math.round(((product.price - displayPrice) / product.price) * 100)}% OFF
                </Badge>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span className="capitalize">{product.category}</span>
              {sellerName && (
                <>
                  <span>•</span>
                  <span>by {sellerName}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${isFavorite ? "text-accent border-accent" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-accent" : ""}`} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${isLiked ? "text-accent border-accent" : ""}`}
                onClick={toggleLike}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-accent" : ""}`} />
                {likeCount}
              </Button>
            </div>

            <div className="mt-auto flex gap-3">
              <Link to={`/product/${product.id}`} className="flex-1" onClick={onClose}>
                <Button className="w-full gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
