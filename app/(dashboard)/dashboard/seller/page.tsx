import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  PlusCircle,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  DollarSign,
} from "lucide-react";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">Активен</Badge>;
    case "sold":
      return <Badge variant="secondary">Продано</Badge>;
    case "draft":
      return <Badge variant="warning">Черновик</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="warning">Ожидание</Badge>;
    case "paid":
      return <Badge variant="info">Оплачено</Badge>;
    case "shipped":
      return <Badge variant="default">Отправлено</Badge>;
    case "completed":
      return <Badge variant="success">Завершён</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, status, created_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myProducts } = await supabase
    .from("products")
    .select("id")
    .eq("seller_id", user.id);
  const productIds = myProducts?.map((p) => p.id) ?? [];

  const { data: orders } =
    productIds.length > 0
      ? await supabase
        .from("order_items")
        .select("id, quantity, price_at_purchase, order_id, product_id")
        .in("product_id", productIds)
      : { data: null };

  const orderIds = [...new Set(orders?.map((o) => o.order_id) ?? [])];
  const { data: orderDetails } =
    orderIds.length > 0
      ? await supabase
        .from("orders")
        .select("id, status, created_at")
        .in("id", orderIds)
      : { data: [] };

  const ordersWithDetails =
    orders?.map((oi) => ({
      ...oi,
      order: orderDetails?.find((o) => o.id === oi.order_id),
    })) ?? [];

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Продавец";

  // Stats
  const totalProducts = products?.length ?? 0;
  const activeProducts =
    products?.filter((p) => p.status === "active").length ?? 0;
  const totalRevenue =
    orders?.reduce((sum, o) => sum + o.quantity * o.price_at_purchase, 0) ?? 0;

  return (
    <div className="animate-in">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Кабинет продавца
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Привет, {displayName} 👋
            </p>
          </div>
          <Link href="/dashboard/seller/add">
            <Button className="gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить товар
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Всего товаров",
              value: totalProducts,
              icon: Package,
              sub: `${activeProducts} активных`,
            },
            {
              label: "Заказы",
              value: orderIds.length,
              icon: ShoppingCart,
              sub: `${ordersWithDetails.length} позиций`,
              link: "/dashboard/seller/orders",
            },
            {
              label: "Выручка",
              value: formatPrice(totalRevenue),
              icon: DollarSign,
              sub: "За всё время",
            },
          ].map((stat) => (
            stat.link ? (
              <Link key={stat.label} href={stat.link}>
                <Card className="border-border/40 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {stat.sub}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card
                key={stat.label}
                className="border-border/40"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stat.sub}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Products */}
          <div>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Товары
            </h2>
            {products && products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <Card key={product.id} className="border-border/40">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${product.id}`}
                          className="font-medium hover:text-primary transition-colors text-sm truncate block"
                        >
                          {product.title}
                        </Link>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      {getStatusBadge(product.status)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/40 border-dashed">
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base">Пока нет товаров</CardTitle>
                  <CardDescription>
                    Добавьте первый товар, чтобы начать продавать
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link href="/dashboard/seller/add">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Добавить товар
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Orders */}
          <div>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              Входящие заказы
            </h2>
            {ordersWithDetails.length > 0 ? (
              <div className="space-y-3">
                {ordersWithDetails.slice(0, 5).map((item) => (
                  <Card key={item.id} className="border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Заказ #{item.order_id?.slice(0, 8)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.quantity} шт. •{" "}
                            {formatPrice(
                              item.quantity * item.price_at_purchase
                            )}{" "}
                            •{" "}
                            {item.order?.created_at
                              ? new Date(
                                item.order.created_at
                              ).toLocaleDateString("ru-RU")
                              : ""}
                          </p>
                        </div>
                        {getOrderStatusBadge(item.order?.status ?? "pending")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/40">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Пока нет заказов по вашим товарам
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
