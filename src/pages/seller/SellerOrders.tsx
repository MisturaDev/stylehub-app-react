import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    total: number;
    status: string;
    order_items: { count: number }[];
}

export default function SellerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log("Fetched orders:", data); // Debug log

            setOrders(data);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered":
                return "default";
            case "Shipped":
                return "secondary";
            case "Processing":
                return "outline";
            case "Pending":
                return "destructive";
            default:
                return "secondary";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold">Orders</h1>
                <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                    Referesh
                </Button>
            </div>

            <div className="bg-white rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading orders...
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-xs font-mono">
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>{formatDate(order.created_at)}</TableCell>
                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "outline" | "destructive"}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {order.order_items && order.order_items[0] ? order.order_items[0].count : 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/seller/orders/${order.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
