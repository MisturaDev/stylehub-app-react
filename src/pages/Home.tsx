import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCardEnhanced } from "@/components/ProductCardEnhanced";
import { QuickViewModal } from "@/components/QuickViewModal";
import { PromoBanner } from "@/components/PromoBanner";
import { TrendingProducts } from "@/components/TrendingProducts";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-banner.jpg";

const CATEGORIES = ["All", "Shirts", "Dresses", "Shoes", "Accessories"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
    fetchLikeCounts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      generateSearchSuggestions();
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
      const prices = data.map((p) => p.sale_price || p.price);
      const max = Math.max(...prices, 500);
      setMaxPrice(Math.ceil(max / 10) * 10);
      setPriceRange([0, max]);
    }
  };

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .limit(4);

    if (data) {
      setFeaturedProducts(data);
    }
  };

  const fetchLikeCounts = async () => {
    const { data } = await supabase.from("likes").select("product_id");

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((like) => {
        counts[like.product_id] = (counts[like.product_id] || 0) + 1;
      });
      setLikeCounts(counts);
    }
  };

  const generateSearchSuggestions = () => {
    const query = searchQuery.toLowerCase();
    const suggestions = products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
      .map((p) => p.title)
      .slice(0, 5);
    setSearchSuggestions(suggestions);
  };

  const brands = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))],
    [products]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const productPrice = product.sale_price || product.price;
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory.toLowerCase();
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case "popular":
        filtered.sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, likeCounts]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceRange([0, maxPrice]);
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedBrand !== "All" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPrice;

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Fashion hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in">
            Discover Your Style
          </h1>
          <p
            className="text-xl md:text-2xl mb-8 text-primary-foreground/90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Curated fashion for the modern wardrobe
          </p>
          <Button
            size="lg"
            className="animate-fade-in bg-background text-foreground hover:bg-background/90"
            style={{ animationDelay: "0.4s" }}
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
          >
            Shop Collection
          </Button>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4 py-8">
        <PromoBanner />
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Our handpicked favorites this season</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCardEnhanced
                key={product.id}
                {...product}
                onQuickView={() => openQuickView(product)}
                onView={() => addToRecentlyViewed(product.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      <TrendingProducts onProductView={addToRecentlyViewed} />

      {/* Products Section */}
      <section id="products" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold">All Products</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Search with Autocomplete */}
          <div className="md:col-span-2 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10"
              />
            </div>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="md:col-span-5">
            <label className="text-sm font-medium mb-3 block">
              Price: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="w-full"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <Badge variant="secondary" className="gap-2">
                Search: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {selectedCategory !== "All" && (
              <Badge variant="secondary" className="gap-2">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All")} />
              </Badge>
            )}
            {selectedBrand !== "All" && (
              <Badge variant="secondary" className="gap-2">
                {selectedBrand}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrand("All")} />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </p>

        {/* Product Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              {products.length === 0
                ? "No products available yet. Check back soon!"
                : "No products found matching your criteria."}
            </p>
            {products.length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCardEnhanced
                key={product.id}
                {...product}
                onQuickView={() => openQuickView(product)}
                onView={() => addToRecentlyViewed(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed
        productIds={recentlyViewed}
        onClear={clearRecentlyViewed}
        onProductView={addToRecentlyViewed}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}
