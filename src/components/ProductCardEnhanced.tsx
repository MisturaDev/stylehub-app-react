import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Heart, ThumbsUp, Eye, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
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
  description?: string;
  onQuickView?: () => void;
  onView?: () => void;
}

export function ProductCardEnhanced({
  id,
  title,
  price,
  sale_price,
  image_url,
  category,
  brand,
  is_featured,
  created_at,
  seller_id,
  onQuickView,
  onView,
}: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sellerName, setSellerName] = useState<string>("");

  const isNew = created_at
    ? Date.now() - new Date(created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
      checkLikeStatus();
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

  const checkFavoriteStatus = async () => {
    const { data } = await supabase
      .from("favorites")
      .select()
      .eq("user_id", user?.id)
      .eq("product_id", id)
      .single();

    setIsFavorite(!!data);
  };

  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from("likes")
      .select()
      .eq("user_id", user?.id)
      .eq("product_id", id)
      .single();

    setIsLiked(!!data);
  };

  const getLikeCount = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    setLikeCount(count || 0);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to add favorites");
      navigate("/auth");
      return;
    }

    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", id);
      setIsFavorite(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: id });
      setIsFavorite(true);
      toast.success("Added to wishlist");
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to like products");
      return;
    }

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("product_id", id);
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, product_id: id });
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  const handleLinkClick = () => {
    onView?.();
  };

  const displayPrice = sale_price || price;
  const hasDiscount = sale_price && sale_price < price;

  return (
    <Link to={`/product/${id}`} onClick={handleLinkClick}>
      <Card className="group overflow-hidden hover:shadow-hover transition-all duration-300 border-border/50 relative">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={image_url}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <Badge variant="new">New</Badge>}
            {hasDiscount && <Badge variant="sale">Sale</Badge>}
            {is_featured && <Badge variant="featured">Featured</Badge>}
          </div>

          {/* Action buttons - visible on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-accent text-accent" : ""}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 delay-75"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({ id, title, price, sale_price, image_url });
              }}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 delay-75"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick view button at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              variant="secondary"
              className="w-full bg-background/95 backdrop-blur-sm hover:bg-background"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{brand}</p>
          )}
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-lg font-serif font-semibold text-accent">
                ${displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">${price.toFixed(2)}</p>
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
