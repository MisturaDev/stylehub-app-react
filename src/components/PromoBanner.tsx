import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Tag, Flame } from "lucide-react";
import { Button } from "./ui/button";

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    title: "New Arrivals",
    subtitle: "Fresh styles just dropped — be the first to shop",
    icon: <Sparkles className="h-5 w-5" />,
    gradient: "from-accent/90 to-accent",
  },
  {
    id: 2,
    title: "Season Sale",
    subtitle: "Up to 40% off on selected items",
    icon: <Tag className="h-5 w-5" />,
    gradient: "from-destructive/80 to-destructive",
  },
  {
    id: 3,
    title: "Trending Now",
    subtitle: "Shop what everyone's loving this week",
    icon: <Flame className="h-5 w-5" />,
    gradient: "from-primary to-primary/80",
  },
];

export function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full bg-gradient-to-r ${slide.gradient} p-6 md:p-8`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background/20 rounded-full backdrop-blur-sm">
                  {slide.icon}
                </div>
                <div className="text-primary-foreground">
                  <h3 className="text-lg md:text-xl font-serif font-bold">{slide.title}</h3>
                  <p className="text-sm md:text-base opacity-90">{slide.subtitle}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="hidden md:flex bg-background/90 hover:bg-background text-foreground"
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              >
                Shop Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/80 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/80 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-6 bg-background" : "w-2 bg-background/50"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
