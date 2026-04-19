import path from "path";
import { z } from "zod";

// Placeholder mínimo — implementação completa criada pelo PLAN-C.
// Este arquivo serve de tipo para o TypeScript durante testes do PLAN-D.
const envSchema = z.object({
  DATA_PATH: z
    .string()
    .min(1, "DATA_PATH é obrigatório")
    .refine(path.isAbsolute, "DATA_PATH deve ser um caminho absoluto"),
  APP_BASE_PATH: z.string().min(1).default("/hiring-pipeline"),
  AUTH_USERNAME: z.string().min(1).default("gestor"),
  AUTH_PASSWORD: z.string().min(8).default("senha-placeholder"),
  NEXTAUTH_SECRET: z.string().min(32).default("placeholder-secret-placeholder-secret-123456"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000/hiring-pipeline"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n❌ Variáveis de ambiente inválidas ou ausentes:\n\n${issues}\n`
    );
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
