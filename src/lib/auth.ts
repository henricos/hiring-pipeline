import { timingSafeEqual } from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";

function safeCompare(a: string, b: string): boolean {
  const buf = (s: string) => Buffer.from(s.slice(0, 256).padEnd(256));
  return timingSafeEqual(buf(a), buf(b));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: {
    error: (error) => console.error(`[auth] ${error.name}: ${error.message}`),
  },
  // O runtime empacotado roda atras de proxy/container e precisa aceitar o Host
  // encaminhado para que sessao e callbacks funcionem em localhost e no deploy real.
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        if (
          safeCompare(username, env.AUTH_USERNAME) &&
          safeCompare(password, env.AUTH_PASSWORD)
        ) {
          return { id: "1", name: username };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
