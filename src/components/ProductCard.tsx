import { Link } from "react-router-dom";
import { Heart, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  brand?: string;
}

export function ProductCard({ id, title, price, image_url, category, brand }: ProductCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
      checkLikeStatus();
    }
    getLikeCount();
  }, [user, id]);

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
    
    if (!user) {
      toast.error("Please sign in to add favorites");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
      setIsFavorite(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: id });
      setIsFavorite(true);
      toast.success("Added to wishlist");
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

  return (
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden hover:shadow-hover transition-all duration-300 border-border/50">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={image_url}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-accent text-accent" : ""}`} />
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
          <div className="flex items-center justify-between">
            <p className="text-lg font-serif font-semibold">${price.toFixed(2)}</p>
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
          <p className="text-xs text-muted-foreground mt-2 capitalize">{category}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
