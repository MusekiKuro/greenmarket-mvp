"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User, ShoppingBag, Store } from "lucide-react";

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
import { register as registerAction } from "@/app/(auth)/actions";
import type { RegisterInput } from "@/lib/validations/auth";
import { registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "buyer",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterInput) {
    setError(null);
    setSuccess(null);
    const result = await registerAction(data);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.message) {
      setSuccess(result.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-border/40 shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Создать аккаунт</CardTitle>
        <CardDescription>
          Зарегистрируйтесь чтобы начать покупать или продавать
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
          {success && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Полное имя</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="Иван Иванов"
                autoComplete="name"
                className="pl-10 h-11"
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
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
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10 h-11"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label>Я хочу</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "buyer")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedRole === "buyer"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/30"
                  }`}
              >
                <ShoppingBag className="h-6 w-6" />
                <span className="text-sm font-medium">Покупать</span>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "seller")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedRole === "seller"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/30"
                  }`}
              >
                <Store className="h-6 w-6" />
                <span className="text-sm font-medium">Продавать</span>
              </button>
            </div>
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
                Создаём аккаунт...
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
