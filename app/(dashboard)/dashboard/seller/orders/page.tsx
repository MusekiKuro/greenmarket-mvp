import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Clock } from "lucide-react";
import { ShipOrderButton } from "@/components/features/order/ship-button";

function formatPrice(cents: number) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export default async function SellerOrdersPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // In a real app, you'd want to join orders and order_items and products to filter
    // orders that contain YOUR products.
    // For MVP without complex joins/RPC, we:
    // 1. Get seller's products
    // 2. Get order_items for those products
    // 3. Get corresponding orders
    // This is N+1rish but fine for MVP scale.

    // 1. Get seller products
    const { data: myProducts } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", user.id);

    if (!myProducts || myProducts.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">У вас пока нет товаров</h2>
                <p className="text-muted-foreground">Добавьте товары, чтобы получать заказы.</p>
            </div>
        )
    }

    const productIds = myProducts.map(p => p.id);

    // 2. Get items sold
    const { data: soldItems } = await supabase
        .from("order_items")
        .select("*, order:orders(*), product:products(title, images)")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>
                <p className="text-muted-foreground">
                    Управляйте заказами на ваши товары
                </p>
            </div>

            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <CardTitle>История продаж</CardTitle>
                    <CardDescription>Список заказанных у вас товаров</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {!soldItems || soldItems.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
                                <p>Заказов пока нет</p>
                            </div>
                        ) : (
                            soldItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 last:border-0 last:pb-0"
                                >
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-border/40 bg-muted/30">
                                            {item.product?.images?.[0] ? (
                                                <img src={item.product.images[0]} alt={item.product?.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{item.product?.title || "Товар удален"}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{item.quantity} шт.</span>
                                                <span>•</span>
                                                <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                <span>Заказ №{item.order?.id?.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={item.order?.status === 'paid' ? 'secondary' : 'default'}>
                                            {item.order?.status === 'paid' ? 'Оплачен' : item.order?.status === 'shipped' ? 'Отправлен' : item.order?.status}
                                        </Badge>
                                        {item.order?.status === 'paid' && (
                                            <ShipOrderButton orderId={item.order.id} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
