import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardEnhanced } from "./ProductCardEnhanced";
import { QuickViewModal } from "./QuickViewModal";
import { Button } from "./ui/button";

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
}

interface RecentlyViewedProps {
  productIds: string[];
  onClear: () => void;
  onProductView?: (productId: string) => void;
}

export function RecentlyViewed({ productIds, onClear, onProductView }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    if (productIds.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [productIds]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (data) {
      // Sort products in the order of productIds
      const sortedProducts = productIds
        .map((id) => data.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      setProducts(sortedProducts);
    }
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-full">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Recently Viewed</h2>
            <p className="text-muted-foreground">Pick up where you left off</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
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
