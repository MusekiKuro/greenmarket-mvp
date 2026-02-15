import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/features/product/product-card";
import {
  ArrowRight,
  Shield,
  Truck,
  HeadphonesIcon,
  Sparkles,
  Palette,
  Gem,
  Shirt,
  BookOpen,
  Home,
  Dumbbell,
  Laptop,
} from "lucide-react";

const categories = [
  { name: "Электроника", icon: Laptop, slug: "electronics" },
  { name: "Одежда", icon: Shirt, slug: "clothing" },
  { name: "Дом и сад", icon: Home, slug: "home" },
  { name: "Хэндмейд", icon: Palette, slug: "handmade" },
  { name: "Книги", icon: BookOpen, slug: "books" },
  { name: "Спорт", icon: Dumbbell, slug: "sports" },
  { name: "Украшения", icon: Gem, slug: "jewelry" },
  { name: "Другое", icon: Sparkles, slug: "other" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, images, category, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-green-subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(152,56%,28%,0.08),transparent_60%)]" />
        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Маркетплейс нового поколения</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Покупайте и продавайте{" "}
              <span className="text-primary">легко</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance">
              GreenMarket — площадка, где продавцы и покупатели находят друг
              друга. Безопасно, удобно, быстро.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/search">
                <Button
                  size="lg"
                  className="gradient-green border-0 text-white shadow-md hover:opacity-90 transition-opacity px-8 h-12"
                >
                  Начать покупки
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Стать продавцом
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Категории</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Найдите товары по категориям
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm text-primary hover:underline underline-offset-4 hidden sm:block"
          >
            Все категории →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                <cat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="container pb-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Новые товары
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Недавно добавленные предложения
            </p>
          </div>
          <Link
            href="/search"
            className="text-sm text-primary hover:underline underline-offset-4 hidden sm:block"
          >
            Смотреть все →
          </Link>
        </div>

        {products && products.length > 0 ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Пока нет товаров</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
              Зарегистрируйтесь как продавец, чтобы добавить первый товар на
              платформу
            </p>
            <Link href="/register" className="mt-6">
              <Button className="gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity">
                Начать продавать
              </Button>
            </Link>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="mt-8 text-center sm:hidden">
            <Link href="/search">
              <Button variant="outline">
                Смотреть все товары
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Trust / Benefits */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
            Почему GreenMarket?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Безопасные сделки",
                desc: "Все транзакции защищены. Мы гарантируем безопасность ваших покупок.",
              },
              {
                icon: Truck,
                title: "Быстрая доставка",
                desc: "Отслеживайте статус заказа в реальном времени от оформления до получения.",
              },
              {
                icon: HeadphonesIcon,
                title: "Поддержка 24/7",
                desc: "Наша команда всегда готова помочь вам с любым вопросом.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center rounded-2xl border border-border/40 bg-card p-8 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
