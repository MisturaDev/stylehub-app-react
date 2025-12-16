import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SellerSettings() {
    const { user } = useAuth();
    const [storeName, setStoreName] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setIsFetching(true);
        try {
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('store_name, store_description, support_email')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If error is PGRST116 (0 rows), we just stick to defaults
                return;
            }

            if (data) {
                setStoreName(data.store_name || "");
                setStoreDescription(data.store_description || "");
                setSupportEmail(data.support_email || user.email || "");
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeName.trim()) {
            toast.error("Store name is required");
            return;
        }

        if (!user) return;

        setLoading(true);

        try {
            const updates = {
                id: user.id,
                store_name: storeName,
                store_description: storeDescription,
                support_email: supportEmail,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) {
                throw error;
            }

            toast.success("Settings saved successfully!");
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 fade-in max-w-2xl">
            <h1 className="text-3xl font-serif font-bold">Store Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                        Manage your public store profile and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="storeName"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="My Awesome Styles"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Store Description</Label>
                            <Textarea
                                id="description"
                                value={storeDescription}
                                onChange={(e) => setStoreDescription(e.target.value)}
                                placeholder="Tell customers about your brand..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Support Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder="support@example.com"
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
