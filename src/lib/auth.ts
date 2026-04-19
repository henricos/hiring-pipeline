import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";

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
        // Comparação de string simples — aceitável para single-user local.
        // AVISO DE SEGURANÇA: para exposição pública, substituir por
        // crypto.timingSafeEqual() ou hashing com bcrypt (ver RESEARCH.md Security Domain)
        if (
          username === env.AUTH_USERNAME &&
          password === env.AUTH_PASSWORD
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
