import { Link, useNavigate } from "react-router-dom";
import { Heart, ThumbsUp, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  category: string;
  brand?: string;
  is_featured?: boolean;
  created_at?: string;
  seller_id?: string;
}

export function ProductCard({
  id,
  title,
  price,
  sale_price,
  image_url,
  category,
  brand,
  is_featured,
  created_at,
  seller_id
}: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sellerName, setSellerName] = useState<string>("");

  // Check if product is new (created within last 30 days)
  const isNew = created_at ?
    (Date.now() - new Date(created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 :
    false;

  useEffect(() => {
    if (user) {
      // checkFavoriteStatus(); // Removed in favor of Context
      // checkLikeStatus(); // Removed, likes still local for now or need refactoring
    }
    getLikeCount();
    if (seller_id) {
      fetchSellerInfo();
    }
  }, [user, id, seller_id]);

  const fetchSellerInfo = async () => {
    if (!seller_id) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", seller_id)
      .single();

    if (data?.full_name) {
      setSellerName(data.full_name);
    }
  };

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(id);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to add favorites");
      navigate("/auth");
      return;
    }

    if (isFavorite) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist({ id, title, price, image_url });
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to like products");
      return;
    }

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: user.id, product_id: id });
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const displayPrice = sale_price || price;
  const hasDiscount = sale_price && sale_price < price;

  return (
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden hover:shadow-hover transition-all duration-300 border-border/50">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={image_url}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <Badge variant="new">New</Badge>}
            {hasDiscount && <Badge variant="sale">Sale</Badge>}
            {is_featured && <Badge variant="featured">Featured</Badge>}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-accent text-accent" : ""}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                addToCart({ id, title, price, sale_price, image_url });
              }}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          {brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {brand}
            </p>
          )}
          <h3 className="font-medium text-foreground mb-2 line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-lg font-serif font-semibold text-accent">
                ${displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">
                  ${price.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 hover:text-accent"
                onClick={toggleLike}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-accent text-accent" : ""}`} />
              </Button>
              <span className="text-sm">{likeCount}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{category}</span>
            {sellerName && <span>by {sellerName}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
