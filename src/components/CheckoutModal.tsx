
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
}

export function CheckoutModal({ open, onOpenChange, total }: CheckoutModalProps) {
    const { items, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("You must be logged in to place an order");
            return;
        }

        setLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const orderData = {
            user_id: user.id,
            total,
            status: 'Pending',
            customer_name: formData.get('name') as string,
            customer_email: formData.get('email') as string,
            shipping_address: `${formData.get('address')}, ${formData.get('city')}, ${formData.get('zip')}`,
        };

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            toast.success("Order placed successfully! Check your email for confirmation.");
            clearCart();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                    <DialogDescription>
                        Enter your details to complete the purchase. Total: ${total.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required placeholder="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Shipping Address</Label>
                        <Input id="address" name="address" required placeholder="123 Fashion St" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zip">Zip Code</Label>
                            <Input id="zip" name="zip" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="card">Card Number (Demo)</Label>
                        <Input id="card" name="card" placeholder="0000 0000 0000 0000" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
