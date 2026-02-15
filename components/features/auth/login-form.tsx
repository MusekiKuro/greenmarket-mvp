"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock } from "lucide-react";

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
import { login } from "@/app/(auth)/actions";
import type { LoginInput } from "@/lib/validations/auth";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await login({ ...data, redirectTo });
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border/40 shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Вход в аккаунт</CardTitle>
        <CardDescription>
          Введите ваши данные для входа
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-10 h-11"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 h-11"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-11 gradient-green border-0 text-white shadow-sm hover:opacity-90 transition-opacity"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Входим...
              </>
            ) : (
              "Войти"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
