
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

interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
}

export function CheckoutModal({ open, onOpenChange, total }: CheckoutModalProps) {
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Order placed successfully! Check your email for confirmation.");
        clearCart();
        setLoading(false);
        onOpenChange(false);
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
                        <Input id="name" required placeholder="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required placeholder="john@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Shipping Address</Label>
                        <Input id="address" required placeholder="123 Fashion St" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zip">Zip Code</Label>
                            <Input id="zip" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="card">Card Number (Demo)</Label>
                        <Input id="card" placeholder="0000 0000 0000 0000" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
