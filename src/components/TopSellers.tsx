import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  category: string;
  brand?: string;
}

export function TopSellers() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchTopSellers();
  }, []);

  const fetchTopSellers = async () => {
    // Fetch products with most likes as "top sellers"
    const { data: likesData } = await supabase
      .from("wishlist_items")
      .select("product_id");

    if (likesData) {
      // Count likes per product
      const likeCounts: Record<string, number> = {};
      likesData.forEach((like) => {
        likeCounts[like.product_id] = (likeCounts[like.product_id] || 0) + 1;
      });

      // Get top 5 product IDs
      const topProductIds = Object.entries(likeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      if (topProductIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", topProductIds);

        if (products) {
          // Sort by like count
          const sorted = products.sort(
            (a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0)
          );
          setTopProducts(sorted);
        }
      } else {
        // Fallback: get featured or newest products
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (products) {
          setTopProducts(products);
        }
      }
    }
  };

  if (topProducts.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center">
            Top Sellers
          </h2>
        </div>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Most loved pieces by our customers this season
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {topProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative bg-card rounded-xl overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-2">
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground font-bold px-2.5 py-1"
                  >
                    #{index + 1}
                  </Badge>
                </div>

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.brand}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-primary">
                          ${product.sale_price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
