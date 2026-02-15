"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { MouseEvent } from "react";

function formatPrice(cents: number) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    images?: string[] | null;
    category?: string | null;
    seller_id?: string;
}

export function ProductCard({
    id,
    title,
    price,
    images,
    category,
    seller_id,
}: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        addItem({
            id,
            title,
            price,
            image: images?.[0],
            quantity: 1,
            maxStock: 99, // Todo: pass real stock
            sellerId: seller_id || "",
        });
    };

    return (
        <Link href={`/product/${id}`} className="group block h-full">
            <Card className="h-full flex flex-col overflow-hidden border-border/40 bg-card transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5 group-hover:-translate-y-1">
                <CardHeader className="p-0">
                    <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden relative">
                        {images?.[0] ? (
                            <img
                                src={images[0]}
                                alt={title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                <Package className="h-12 w-12" />
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
                            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-foreground hover:text-primary hover:scale-110 transition-all opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                            title="Добавить в корзину"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <h3 className="font-medium leading-snug line-clamp-2 text-sm group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    {category && (
                        <p className="mt-1.5 text-xs text-muted-foreground">{category}</p>
                    )}
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                    <span className="text-base font-bold text-foreground">
                        {formatPrice(price)}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
