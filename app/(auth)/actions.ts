"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginInput } from "@/lib/validations/auth";
import type { RegisterInput } from "@/lib/validations/auth";

export async function login(data: LoginInput & { redirectTo?: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.redirectTo ?? "/");
}

export async function register(data: RegisterInput) {
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: data.role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, session may be null
  if (authData.session) {
    redirect("/");
  }

  return {
    message:
      "Account created! Please check your email to confirm your account before signing in.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
