import fs from "fs";
import path from "path";
import { env } from "@/lib/env";

/**
 * Valida que DATA_PATH existe no sistema de arquivos.
 * D-14: A raiz DEVE existir — a aplicação não cria a raiz.
 * Encerra o processo com mensagem clara se não encontrar.
 */
export function validateDataPath(): void {
  if (!fs.existsSync(env.DATA_PATH)) {
    console.error(
      `\n❌ DATA_PATH não encontrado: ${env.DATA_PATH}\n` +
        `  Crie o diretório ou monte o volume antes de iniciar a aplicação.\n`
    );
    process.exit(1);
  }
}

/**
 * Garante que uma subpasta de domínio existe em DATA_PATH.
 * D-15: Subpastas criadas automaticamente no primeiro acesso.
 * Idempotente — não falha se já existir.
 * @returns Caminho absoluto para a subpasta
 */
export function ensureSubdir(subdir: string): string {
  const dirPath = path.join(env.DATA_PATH, subdir);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}
