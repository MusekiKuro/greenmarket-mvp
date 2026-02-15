"use client";

import { ShoppingCart, Plus, Minus, Trash2, Loader2, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { checkout } from "@/lib/actions/checkout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function formatPrice(cents: number) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export function CartSheet() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
        useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCheckout() {
        setIsCheckingOut(true);
        setError(null);

        try {
            const result = await checkout({
                items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
            });

            if (result?.error) {
                if (result.error === "Необходимо войти в аккаунт") {
                    router.push("/login?redirectTo=/cart"); // Or handle redirect logic better
                }
                setError(result.error);
                setIsCheckingOut(false);
            } else if (result?.success) {
                clearCart();
                setIsCheckingOut(false);
                router.push("/dashboard/buyer");
            }
        } catch (err) {
            setError("Произошла ошибка при оформлении заказа");
            setIsCheckingOut(false);
        }
    }

    const totalPrice = getTotalPrice();
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {totalItems > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Корзина ({totalItems})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Ваша корзина пуста</h3>
                                <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">
                                    Добавьте товары из каталога, чтобы оформить заказ
                                </p>
                            </div>
                            <SheetClose asChild>
                                <Button className="mt-4 gradient-green border-0 text-white shadow-sm hover:opacity-90">
                                    Перейти к покупкам
                                </Button>
                            </SheetClose>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 border-b border-border/40 pb-6 last:border-0"
                                >
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/30">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                                <ShoppingCart className="h-8 w-8 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium text-sm line-clamp-2 pr-4">{item.title}</h4>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 rounded-lg border border-border/40 p-1">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity - 1)
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-4 text-center text-xs font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors"
                                                    disabled={item.quantity >= item.maxStock}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-sm">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t border-border/40 pt-6 sm:justify-center">
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between text-base font-medium">
                                <span>Итого:</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>
                            {error && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                                    {error}
                                </div>
                            )}
                            <Button
                                className="w-full h-12 gradient-green border-0 text-white shadow-md hover:opacity-90 transition-opacity text-base"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Оформляем...
                                    </>
                                ) : (
                                    "Оформить заказ"
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
