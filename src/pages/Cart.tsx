
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { CheckoutModal } from "@/components/CheckoutModal";
import { useState } from "react";

export default function Cart() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const handleCheckout = () => {
        if (!user) {
            toast.error("Please log in to proceed to checkout");
            navigate("/auth");
            return;
        }
        setCheckoutOpen(true);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">Your cart is empty</p>
                        <Button asChild>
                            <Link to="/">Start Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="md:col-span-2 space-y-4">
                            {items.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 flex gap-4 items-center">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{item.title}</h3>
                                            <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" onClick={clearCart} className="mt-4">
                                Clear Cart
                            </Button>
                        </div>

                        {/* Order Summary */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-serif text-xl font-semibold">Order Summary</h3>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="pt-4 border-t flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full mt-4" size="lg" onClick={handleCheckout}>
                                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            <CheckoutModal
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                total={total}
            />
        </div>
    );
}
