import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/features/product/product-card";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categoryOptions = [
  { label: "Все", value: "" },
  { label: "Электроника", value: "electronics" },
  { label: "Одежда", value: "clothing" },
  { label: "Дом и сад", value: "home" },
  { label: "Хэндмейд", value: "handmade" },
  { label: "Книги", value: "books" },
  { label: "Спорт", value: "sports" },
  { label: "Украшения", value: "jewelry" },
  { label: "Другое", value: "other" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, title, price, images, category")
    .eq("status", "active");

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data: products } = await query.order("created_at", {
    ascending: false,
  });

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/20">
        <div className="container py-8">
          <h1 className="text-2xl font-bold tracking-tight">Каталог товаров</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? `Результаты поиска: "${q}"` : "Найдите то, что ищете"}
          </p>

          {/* Search Bar */}
          <form className="mt-6" method="get" action="/search">
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Поиск товаров..."
                className="flex h-12 w-full rounded-xl border border-border/60 bg-card pl-11 pr-24 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg gradient-green px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Найти
              </button>
            </div>
          </form>

          {/* Category Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <Link
                key={cat.value}
                href={`/search${cat.value ? `?category=${cat.value}` : ""}${q ? `${cat.value ? "&" : "?"}q=${q}` : ""
                  }`}
              >
                <span
                  className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${category === cat.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        {products && products.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Найдено: {products.length}{" "}
              {products.length === 1 ? "товар" : products.length < 5 ? "товара" : "товаров"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  category={product.category}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">Ничего не найдено</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Попробуйте изменить поисковый запрос или выбрать другую категорию
            </p>
            <Link href="/search" className="mt-6">
              <Button variant="outline">Сбросить фильтры</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
