"use client";

import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
    product: {
        id: string;
        title: string;
        price: number;
        image?: string;
        stock: number;
        seller_id?: string;
    };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1,
            maxStock: product.stock,
            sellerId: product.seller_id || "",
        });

        // Visual feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <Button
            size="lg"
            className={`flex-1 border-0 text-white shadow-md hover:opacity-90 transition-all h-12 ${isAdded ? "bg-green-600" : "gradient-green"
                }`}
            disabled={product.stock === 0}
            onClick={handleAddToCart}
        >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0
                ? "Нет в наличии"
                : isAdded
                    ? "Добавлено!"
                    : "Добавить в корзину"}
        </Button>
    );
}
