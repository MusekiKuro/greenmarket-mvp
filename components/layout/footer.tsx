import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-muted/30">
            <div className="container py-12">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-green">
                                <Leaf className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                GreenMarket
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Удобный маркетплейс для покупателей и продавцов. Безопасные сделки,
                            быстрая доставка.
                        </p>
                    </div>

                    {/* Покупателям */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                            Покупателям
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/search"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Каталог товаров
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Категории
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    О платформе
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Продавцам */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                            Продавцам
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/register"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Начать продавать
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/seller"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Личный кабинет
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Информация */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                            Информация
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    О нас
                                </Link>
                            </li>
                            <li>
                                <span className="text-sm text-muted-foreground">
                                    support@greenmarket.ru
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} GreenMarket. Все права защищены.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                            Сделано с 💚
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
