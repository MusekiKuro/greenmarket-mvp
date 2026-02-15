import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center">
                <p className="text-8xl font-bold text-primary/20">404</p>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                    Страница не найдена
                </h1>
                <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                    К сожалению, запрашиваемая страница не существует или была перемещена.
                </p>
                <Link href="/" className="mt-8 inline-block">
                    <Button className="gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Вернуться на главную
                    </Button>
                </Link>
            </div>
        </div>
    );
}
