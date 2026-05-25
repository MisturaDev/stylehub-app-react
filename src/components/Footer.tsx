import { Instagram, Twitter, Facebook, MapPin, Mail, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <BrandLogo textClassName="text-primary-foreground" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your premier destination for curated fashion. Discover the latest trends and timeless pieces.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              {["About", "Terms of Service", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>45 Allen Avenue, Ikeja, Lagos, Nigeria</span>
              </li>
              <li>
                <a
                  href="mailto:stylehub@gmail.com"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>stylehub@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348012345678"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+234 801 234 5678</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Stay Updated</h4>
            <p className="text-primary-foreground/70 text-sm">
              Subscribe for exclusive offers and style tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-all duration-300"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 active:scale-95 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {currentYear} StyleHub. All rights reserved.</p>
            <p className="text-xs">Crafted with passion for fashion lovers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
