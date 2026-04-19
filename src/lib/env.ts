import path from "path";
import { z } from "zod";
import { normalizeBasePath } from "./base-path";

// Zod 4: usa a função `error` para definir mensagens em pt-BR para campos ausentes (invalid_type)
const envSchema = z
  .object({
    DATA_PATH: z
      .string({ error: (iss) => (iss.input === undefined ? "DATA_PATH é obrigatório" : undefined) })
      .min(1, "DATA_PATH é obrigatório")
      .refine(path.isAbsolute, "DATA_PATH deve ser um caminho absoluto"),
    APP_ROOT_PATH: z
      .string()
      .min(1, "APP_ROOT_PATH não pode ser vazio")
      .refine(path.isAbsolute, "APP_ROOT_PATH deve ser um caminho absoluto")
      .optional(),
    APP_BASE_PATH: z
      .string({ error: (iss) => (iss.input === undefined ? "APP_BASE_PATH é obrigatório" : undefined) })
      .min(1, "APP_BASE_PATH é obrigatório"),
    AUTH_USERNAME: z
      .string({ error: (iss) => (iss.input === undefined ? "AUTH_USERNAME é obrigatório" : undefined) })
      .min(1, "AUTH_USERNAME é obrigatório"),
    AUTH_PASSWORD: z
      .string({ error: (iss) => (iss.input === undefined ? "AUTH_PASSWORD é obrigatório" : undefined) })
      .min(8, "AUTH_PASSWORD deve ter pelo menos 8 caracteres"),
    NEXTAUTH_SECRET: z
      .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_SECRET é obrigatório" : undefined) })
      .min(32, "NEXTAUTH_SECRET deve ter pelo menos 32 caracteres"),
    NEXTAUTH_URL: z
      .string({ error: (iss) => (iss.input === undefined ? "NEXTAUTH_URL é obrigatório" : undefined) })
      .url("NEXTAUTH_URL deve ser uma URL válida"),
  })
  .superRefine((data, ctx) => {
    let normalizedBasePath: string | null = null;

    try {
      normalizedBasePath = normalizeBasePath(data.APP_BASE_PATH);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["APP_BASE_PATH"],
        message: error instanceof Error ? error.message : "APP_BASE_PATH inválido",
      });
    }

    if (!normalizedBasePath) {
      return;
    }

    try {
      const normalizedNextAuthPath = normalizeBasePath(new URL(data.NEXTAUTH_URL).pathname);

      if (normalizedNextAuthPath !== normalizedBasePath) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["NEXTAUTH_URL"],
          message:
            `NEXTAUTH_URL deve usar o mesmo pathname de APP_BASE_PATH. ` +
            `Exemplo correto: APP_BASE_PATH=/hiring-pipeline com NEXTAUTH_URL=https://host/hiring-pipeline.`,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("APP_BASE_PATH inválido:")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["NEXTAUTH_URL"],
          message:
            `O pathname de NEXTAUTH_URL é inválido para o contrato do app: ${error.message
              .replace("APP_BASE_PATH inválido:", "")
              .trim()}`,
        });
      }
    }
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
