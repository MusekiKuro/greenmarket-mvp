import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft, ShoppingCart, User, Tag } from "lucide-react";
import { AddToCartButton } from "@/components/features/product/add-to-cart-button";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, title, description, price, images, category, seller_id, stock")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !product) notFound();

  let sellerName = "Продавец";
  if (product.seller_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", product.seller_id)
      .single();
    if (profile?.full_name) sellerName = profile.full_name;
  }

  return (
    <div className="animate-in">
      {/* Breadcrumbs */}
      <div className="border-b border-border/40 bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Главная
            </Link>
            <span>/</span>
            <Link
              href="/search"
              className="hover:text-foreground transition-colors"
            >
              Каталог
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/search?category=${product.category}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
              <div className="aspect-square flex items-center justify-center">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                    <Package className="h-24 w-24" />
                    <span className="text-sm">Нет изображения</span>
                  </div>
                )}
              </div>
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 h-20 w-20 rounded-xl border overflow-hidden cursor-pointer transition-all ${idx === 0
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/40 hover:border-primary/30"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="space-y-4">
              {product.category && (
                <Badge variant="default">
                  <Tag className="mr-1.5 h-3 w-3" />
                  {product.category}
                </Badge>
              )}

              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {product.title}
              </h1>

              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Stock info */}
            <div className="mt-4 flex items-center gap-4">
              {product.stock > 0 ? (
                <Badge variant="success">В наличии: {product.stock} шт.</Badge>
              ) : (
                <Badge variant="destructive">Нет в наличии</Badge>
              )}
            </div>

            {/* Seller */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{sellerName}</p>
                <p className="text-xs text-muted-foreground">Продавец</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Описание
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {product.description || "Описание товара не указано."}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 flex gap-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.images?.[0],
                  stock: product.stock,
                  seller_id: product.seller_id
                }}
              />
            </div>

            {/* Back link */}
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
