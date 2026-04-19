"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { withBasePath, getConfiguredBasePath } from "@/lib/base-path";
import { isValidCallback } from "@/lib/auth-utils";

export async function authenticate(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const base = getConfiguredBasePath();
  const raw = (formData.get("callbackUrl") as string | null) ?? base;
  const callbackUrl = raw && isValidCallback(raw, base) ? raw : base;
  try {
    await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      // next-auth não aplica basePath em redirectTo — withBasePath é necessário aqui
      redirectTo: withBasePath(callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Credenciais inválidas. Verifique usuário e senha.";
    }
    throw error;
  }
  return null;
}
