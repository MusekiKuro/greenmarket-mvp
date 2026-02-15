"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    stock: z.number().int().min(0).default(1),
});

export type CreateProductInput = z.infer<typeof productSchema>;

export async function createProduct(data: CreateProductInput) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to create a product" };
    }

    // Check if user is seller or admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "seller" && profile?.role !== "admin") {
        return { error: "Only sellers can create products" };
    }

    const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price, // Already in cents
        category: data.category,
        images: data.images,
        stock: data.stock,
        status: "active",
    });

    if (error) {
        console.error("Error creating product:", error);
        return { error: "Failed to create product" };
    }

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/dashboard/seller");
    redirect("/dashboard/seller");
}
