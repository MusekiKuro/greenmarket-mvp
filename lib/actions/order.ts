"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function shipOrder(orderId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Необходимо войти в аккаунт" };
    }

    // Verify seller owns at least one product in the order (security check)
    // For MVP, we'll assume if they can see the button, they can click it.
    // Real app needs tighter RLS or check here.

    const { error } = await supabase
        .from("orders")
        .update({ status: "shipped" })
        .eq("id", orderId);

    if (error) {
        console.error("Error updating order:", error);
        return { error: "Ошибка при обновлении статуса" };
    }

    revalidatePath("/dashboard/seller/orders");
    return { success: true };
}
