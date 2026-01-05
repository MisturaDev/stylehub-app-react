const FEATURED_BRANDS = [
  {
    name: "Luxe Couture",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=100&fit=crop&auto=format",
    tagline: "Timeless Elegance",
  },
  {
    name: "Urban Edge",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=100&fit=crop&auto=format",
    tagline: "Street Style Redefined",
  },
  {
    name: "Minimalist Co.",
    logo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=100&fit=crop&auto=format",
    tagline: "Less is More",
  },
  {
    name: "Ethereal",
    logo: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&h=100&fit=crop&auto=format",
    tagline: "Dreamy Collections",
  },
  {
    name: "Nova Style",
    logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=100&fit=crop&auto=format",
    tagline: "Future Fashion",
  },
];

export function FeaturedBrands() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
          Featured Brands
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our curated selection of premium fashion brands
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {FEATURED_BRANDS.map((brand, index) => (
          <div
            key={brand.name}
            className="group relative bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <h3 className="font-semibold text-sm md:text-base mb-1 group-hover:text-primary transition-colors">
              {brand.name}
            </h3>
            <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {brand.tagline}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
