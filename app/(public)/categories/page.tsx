import Link from "next/link";
import {
    Laptop,
    Shirt,
    Home,
    Palette,
    BookOpen,
    Dumbbell,
    Gem,
    Sparkles,
} from "lucide-react";

export const metadata = {
    title: "Категории",
};

const categories = [
    {
        name: "Электроника",
        slug: "electronics",
        icon: Laptop,
        desc: "Гаджеты, аксессуары и техника",
        color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
        name: "Одежда",
        slug: "clothing",
        icon: Shirt,
        desc: "Мода, обувь и аксессуары",
        color:
            "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    },
    {
        name: "Дом и сад",
        slug: "home",
        icon: Home,
        desc: "Мебель, декор, инструменты",
        color:
            "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
        name: "Хэндмейд",
        slug: "handmade",
        icon: Palette,
        desc: "Авторские изделия ручной работы",
        color:
            "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
        name: "Книги",
        slug: "books",
        icon: BookOpen,
        desc: "Литература, учебники, комиксы",
        color:
            "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
    {
        name: "Спорт",
        slug: "sports",
        icon: Dumbbell,
        desc: "Тренажёры, экипировка, питание",
        color:
            "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
        name: "Украшения",
        slug: "jewelry",
        icon: Gem,
        desc: "Ювелирные изделия и бижутерия",
        color:
            "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    },
    {
        name: "Другое",
        slug: "other",
        icon: Sparkles,
        desc: "Всё остальное и необычное",
        color:
            "bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400",
    },
];

export default function CategoriesPage() {
    return (
        <div className="animate-in">
            <div className="border-b border-border/40 bg-muted/20">
                <div className="container py-8">
                    <h1 className="text-2xl font-bold tracking-tight">Категории</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Выберите категорию для просмотра товаров
                    </p>
                </div>
            </div>

            <div className="container py-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/search?category=${cat.slug}`}
                            className="group"
                        >
                            <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-6 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5 group-hover:-translate-y-0.5 h-full">
                                <div
                                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${cat.color} transition-transform group-hover:scale-110`}
                                >
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        {cat.desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
