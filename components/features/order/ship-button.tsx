"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Loader2 } from "lucide-react";
import { shipOrder } from "@/lib/actions/order";
import { useRouter } from "next/navigation";

export function ShipOrderButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleShip() {
        setLoading(true);
        const res = await shipOrder(orderId);
        if (res?.success) {
            router.refresh();
        } else {
            alert("Ошибка при обновлении статуса");
        }
        setLoading(false);
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShip}
            disabled={loading}
            className="gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            Отправить
        </Button>
    );
}
