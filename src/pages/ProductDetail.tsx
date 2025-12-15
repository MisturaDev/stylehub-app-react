import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsUp, ArrowLeft, User, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if product is new (created within last 30 days)
  const isNew = product?.created_at ?
    (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 :
    false;
  const hasDiscount = product?.sale_price && product.sale_price < product.price;
  const displayPrice = product?.sale_price || product?.price;

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchComments();
      addToRecentlyViewed(id);
      if (user) {
        checkFavoriteStatus();
        checkLikeStatus();
      }
    }
  }, [id, user]);

  const fetchProductDetails = async () => {
    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productData) {
      setProduct(productData);

      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", productData.seller_id)
        .single();

      setSeller(sellerData);

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("product_id", id);

      setLikeCount(count || 0);
    }

    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
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

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      navigate("/auth");
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

  const toggleLike = async () => {
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        product_id: id,
        content: newComment,
      });

    if (!error) {
      setNewComment("");
      fetchComments();
      toast.success("Comment added!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isNew && <Badge variant="new">New</Badge>}
              {hasDiscount && <Badge variant="sale">Sale</Badge>}
              {product.is_featured && <Badge variant="featured">Featured</Badge>}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.brand}
              </p>
            )}
            <h1 className="text-4xl font-serif font-bold">{product.title}</h1>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-serif font-semibold text-accent">
                ${parseFloat(displayPrice).toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-xl text-muted-foreground line-through">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => addToCart(product)}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleFavorite}
                className="flex-1"
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-accent text-accent" : ""}`} />
                {isFavorite ? "In Wishlist" : "Add to Wishlist"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleLike}
              >
                <ThumbsUp className={`mr-2 h-5 w-5 ${isLiked ? "fill-accent text-accent" : ""}`} />
                {likeCount}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-serif text-xl mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-serif text-xl">Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium capitalize">{product.category}</dd>
                </div>
                {product.brand && (
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">Brand</dt>
                    <dd className="font-medium">{product.brand}</dd>
                  </div>
                )}
              </dl>
            </div>

            {seller && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-serif text-xl">Seller Information</h3>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{seller.full_name}</p>
                      <p className="text-sm text-muted-foreground">Verified Seller</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-serif font-bold mb-6">Comments</h2>

          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="mb-3"
                maxLength={500}
              />
              <Button type="submit">Post Comment</Button>
            </form>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {comment.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{comment.profiles?.full_name || "Anonymous"}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
