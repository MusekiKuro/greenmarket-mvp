import { Shield, Users, Zap, Heart } from "lucide-react";

export const metadata = {
    title: "О нас",
};

export default function AboutPage() {
    return (
        <div className="animate-in">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border/40">
                <div className="absolute inset-0 gradient-green-subtle" />
                <div className="container relative py-16 md:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                            О платформе{" "}
                            <span className="text-primary">GreenMarket</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-balance">
                            Мы создаём удобное пространство, где продавцы и покупатели находят
                            друг друга. Наша миссия — сделать онлайн-торговлю простой,
                            безопасной и доступной для каждого.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container py-16">
                <h2 className="text-center text-2xl font-bold tracking-tight mb-10">
                    Наши ценности
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            icon: Shield,
                            title: "Безопасность",
                            desc: "Каждая сделка на платформе защищена. Мы серьёзно подходим к безопасности данных и транзакций.",
                        },
                        {
                            icon: Users,
                            title: "Сообщество",
                            desc: "Мы строим доверительное сообщество продавцов и покупателей, где каждый чувствует себя комфортно.",
                        },
                        {
                            icon: Zap,
                            title: "Простота",
                            desc: "Минимум действий для максимального результата. Интуитивный интерфейс для всех пользователей.",
                        },
                        {
                            icon: Heart,
                            title: "Забота",
                            desc: "Мы заботимся о каждом пользователе. Наша поддержка всегда готова помочь в любой ситуации.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border/40 bg-card p-6 text-center transition-shadow hover:shadow-md"
                        >
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="border-t border-border/40 bg-muted/20">
                <div className="container py-14">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {[
                            { value: "1000+", label: "Товаров" },
                            { value: "500+", label: "Продавцов" },
                            { value: "10K+", label: "Покупателей" },
                            { value: "99%", label: "Довольных клиентов" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
