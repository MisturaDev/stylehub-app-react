
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, RefreshCw, ShoppingBag, MapPin, Mail, User, Phone } from "lucide-react";

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: {
        title: string;
        image_url: string;
    };
}

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_city: string;
    customer_zip: string;
    shipping_address: string;
    total: number;
    status: string;
    order_items: OrderItem[];
}

export default function SellerOrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setRefreshing(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        product:products (
                            title,
                            image_url
                        )
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;

            setOrder(data);
        } catch (error: any) {
            console.error('Error fetching order details:', error);
            toast.error("Failed to load order details");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered": return "default";
            case "Shipped": return "secondary";
            case "Processing": return "outline";
            case "Pending": return "destructive";
            default: return "secondary";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-xl font-semibold">Order not found</h2>
                <Button onClick={() => navigate('/seller/orders')}>Back to Orders</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/seller/orders')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-3">
                            Order #{order.id.slice(0, 8)}
                            <Badge variant={getStatusColor(order.status) as any} className="text-sm">
                                {order.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Placed on {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <Button onClick={fetchOrderDetails} disabled={refreshing} variant="outline">
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content - Order Items */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                            {item.product.image_url ? (
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="grid gap-1">
                                                <h3 className="font-medium text-base">{item.product.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex justify-end pt-2 sm:pt-0">
                                                <span className="font-semibold text-lg">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-6" />
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Free</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Customer Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-1">
                                <p className="font-medium">{order.customer_name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${order.customer_email}`} className="hover:underline">
                                        {order.customer_email}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                                {order.shipping_address}<br />
                                {order.customer_city}, {order.customer_zip}
                            </address>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
