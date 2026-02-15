"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, ImagePlus, DollarSign, Type, Package, Tag, FileText } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { createProduct } from "@/lib/actions/product";

const formSchema = z.object({
    title: z.string().min(1, "Введите название товара"),
    description: z.string().optional(),
    price: z.string().min(1, "Введите цену"),
    category: z.string().optional(),
    stock: z.string().optional(),
});

type FormInput = z.infer<typeof formSchema>;

const categories = [
    { label: "Электроника", value: "electronics" },
    { label: "Одежда", value: "clothing" },
    { label: "Дом и сад", value: "home" },
    { label: "Хэндмейд", value: "handmade" },
    { label: "Книги", value: "books" },
    { label: "Спорт", value: "sports" },
    { label: "Украшения", value: "jewelry" },
    { label: "Другое", value: "other" },
];

export function AddProductForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormInput>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stock: "1",
        },
    });

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 5) {
            setUploadError("Максимум 5 изображений");
            return;
        }
        setUploadError(null);
        setSelectedImages((prev) => [...prev, ...files]);
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviewUrls((prev) => [...prev, ...urls]);
    }

    function removeImage(index: number) {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }

    async function onSubmit(data: FormInput) {
        setIsSubmitting(true);
        setUploadError(null);

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setUploadError("Вы должны быть авторизованы");
                setIsSubmitting(false);
                return;
            }

            // Upload images
            const imageUrls: string[] = [];
            for (const file of selectedImages) {
                const ext = file.name.split(".").pop();
                const path = `${user.id}/${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from("marketplace")
                    .upload(path, file);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("marketplace").getPublicUrl(path);
                imageUrls.push(publicUrl);
            }

            // Create product via Server Action
            const result = await createProduct({
                title: data.title,
                description: data.description,
                price: Math.round(parseFloat(data.price) * 100), // Convert to cents
                category: data.category,
                stock: parseInt(data.stock || "1"),
                images: imageUrls,
            });

            if (result?.error) {
                setUploadError(result.error);
            } else {
                // Success handled by redirect in Server Action
            }
        } catch (err: any) {
            console.error(err);
            setUploadError(err.message || "Ошибка при создании товара");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Добавить товар</CardTitle>
                <CardDescription>
                    Заполните информацию о вашем товаре
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {uploadError && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                            {uploadError}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Название <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="title"
                                placeholder="Название товара"
                                className="pl-10 h-11"
                                {...register("title")}
                            />
                        </div>
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Описание</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                                id="description"
                                rows={4}
                                placeholder="Подробное описание товара..."
                                className="flex w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                {...register("description")}
                            />
                        </div>
                    </div>

                    {/* Price + Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">
                                Цена (₽) <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="1990"
                                    className="pl-10 h-11"
                                    {...register("price")}
                                />
                            </div>
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Количество</Label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="stock"
                                    type="number"
                                    min="1"
                                    className="pl-10 h-11"
                                    {...register("stock")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Категория</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <select
                                id="category"
                                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                {...register("category")}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Изображения (до 5)</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {previewUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-square rounded-xl border border-border/60 overflow-hidden group"
                                >
                                    <img
                                        src={url}
                                        alt="preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-destructive"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            ))}
                            {previewUrls.length < 5 && (
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary hover:bg-primary/5">
                                    <ImagePlus className="h-6 w-6" />
                                    <span className="mt-1 text-[10px] font-medium">Добавить</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full h-11 gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Публикуем...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Опубликовать товар
                            </>
                        )}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
