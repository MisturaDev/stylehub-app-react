import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardEnhanced } from "./ProductCardEnhanced";
import { QuickViewModal } from "./QuickViewModal";

interface Product {
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
  like_count?: number;
}

interface TrendingProductsProps {
  onProductView?: (productId: string) => void;
}

export function TrendingProducts({ onProductView }: TrendingProductsProps) {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    // Get products with their like counts
    const { data: products } = await supabase
      .from("products")
      .select("*");

    if (!products) return;

    // Get like counts for all products
    const { data: likes } = await supabase
      .from("likes")
      .select("product_id");

    if (!likes) {
      setTrendingProducts(products.slice(0, 4));
      return;
    }

    // Count likes per product
    const likeCounts: Record<string, number> = {};
    likes.forEach((like) => {
      likeCounts[like.product_id] = (likeCounts[like.product_id] || 0) + 1;
    });

    // Sort products by like count
    const sortedProducts = products
      .map((product) => ({
        ...product,
        like_count: likeCounts[product.id] || 0,
      }))
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, 4);

    setTrendingProducts(sortedProducts);
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  if (trendingProducts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-destructive/10 rounded-full">
          <Flame className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Top Liked</h2>
          <p className="text-muted-foreground">Products everyone's loving right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => (
          <ProductCardEnhanced
            key={product.id}
            {...product}
            onQuickView={() => openQuickView(product)}
            onView={() => onProductView?.(product.id)}
          />
        ))}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </section>
  );
}
