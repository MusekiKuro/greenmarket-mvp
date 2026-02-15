import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddProductForm } from "@/components/features/product/add-product-form";

export default function AddProductPage() {
  return (
    <div className="animate-in">
      <div className="container py-8 max-w-2xl">
        <Link
          href="/dashboard/seller"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к кабинету
        </Link>

        <AddProductForm />
      </div>
    </div>
  );
}
