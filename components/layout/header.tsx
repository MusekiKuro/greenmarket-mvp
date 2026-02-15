import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Search,
  LayoutDashboard,
  LogOut,
  User,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { CartSheet } from "@/components/features/cart/cart-sheet";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role?: string; full_name?: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const role = profile?.role ?? "buyer";
  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-green shadow-sm transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            GreenMarket
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            Поиск
          </Link>
          <Link
            href="/categories"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            <ShoppingBag className="h-4 w-4" />
            Категории
          </Link>

          <div className="mx-2 h-5 w-px bg-border" />

          <CartSheet />

          <div className="mx-2 h-5 w-px bg-border" />

          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">{displayName}</span>
              </div>
              <Link
                href={
                  role === "seller" || role === "admin"
                    ? "/dashboard/seller"
                    : "/dashboard/buyer"
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Кабинет
                </Button>
              </Link>
              <form action={logout}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  Регистрация
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu (Simplification for MVP: just links) */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
