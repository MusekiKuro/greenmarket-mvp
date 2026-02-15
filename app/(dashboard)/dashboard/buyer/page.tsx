import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function BuyerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const activeOrdersCount = orders?.filter((o) => o.status !== "completed").length || 0;

  return (
    <div className="container py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Мои покупки</h1>
        <p className="text-muted-foreground">
          История ваших заказов и статус доставки
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40 shadow-sm bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные сейчас</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Потрачено</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>История заказов</CardTitle>
          <CardDescription>Список ваших последних покупок</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!orders || orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ShoppingBag className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>У вас пока нет заказов</p>
                <Link href="/search" className="mt-4 inline-block">
                  <Button variant="outline">Перейти к покупкам</Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Заказ №{order.id.slice(0, 8)}</span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "shipped"
                              ? "default"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {order.status === "paid" ? "Оплачен" :
                          order.status === "shipped" ? "Отправлен" :
                            order.status === "completed" ? "Доставлен" : order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{order.order_items?.length || 0} товаров</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Link href="/search">
          <Button className="gradient-green border-0 text-white shadow-md hover:opacity-90">
            Продолжить покупки
          </Button>
        </Link>
      </div>
    </div>
  );
}
