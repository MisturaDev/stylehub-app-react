import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import DashboardLayout from "./layouts/DashboardLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerOrderDetails from "./pages/seller/SellerOrderDetails";
import SellerSettings from "./pages/seller/SellerSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/seller" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<SellerOverview />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="orders" element={<SellerOrders />} />
                  <Route path="orders/:orderId" element={<SellerOrderDetails />} />
                  <Route path="settings" element={<SellerSettings />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
