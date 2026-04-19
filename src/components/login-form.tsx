"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate } from "@/app/actions/auth";
import { isValidCallback } from "@/lib/auth-utils";

export { isValidCallback };

export function LoginForm({ fallbackUrl }: { fallbackUrl: string }) {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && isValidCallback(rawCallback, fallbackUrl)
      ? rawCallback
      : fallbackUrl;

  const [error, action, isPending] = useActionState(authenticate, null);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="gestor"
            required
            autoComplete="username"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary"
          />
        </div>
      </div>

      {/* Mensagem genérica — não revela qual campo está errado (D-07, T-1-06) */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-destructive/8 rounded-sm border border-destructive/25">
          <p className="text-[0.75rem] font-medium text-destructive">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-cta text-on-tertiary py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {isPending ? "Aguarde..." : "Entrar"}
      </Button>
    </form>
  );
}
