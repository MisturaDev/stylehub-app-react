import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    Menu,
    ArrowLeft,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const navItems = [
        {
            title: "Overview",
            href: "/seller/overview",
            icon: LayoutDashboard,
        },
        {
            title: "Products",
            href: "/seller/products",
            icon: Package,
        },
        {
            title: "Orders",
            href: "/seller/orders",
            icon: ShoppingBag,
        },
        {
            title: "Settings",
            href: "/seller/settings",
            icon: Settings,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full",
                    // Reset transform on desktop so it's always visible
                    "lg:translate-x-0"
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-4 gap-2 border-b">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Link to="/" className="text-xl font-serif font-bold">
                            StyleHub <span className="text-xs font-sans font-normal text-muted-foreground ml-1">Seller</span>
                        </Link>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    location.pathname === item.href
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                onClick={() => setIsSidebarOpen(false)} // Close on mobile navigation
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    <div className="p-4 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-destructive"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Top Header (Mobile Toggle) */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="font-semibold">Dashboard</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
