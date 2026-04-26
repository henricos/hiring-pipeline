import fs from "fs";
import path from "path";
import { ensureSubdir } from "@/lib/data-service";

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface Research {
  profileId: string;
  date: string; // YYYY-MM-DD
  baseName: string; // data ou data-2 (sufixo opcional)
  vagasFile: string; // {date}-vagas.json
  resumoFile: string; // {date}-resumo.json
}

// ─── Interface pública ───────────────────────────────────────────────────────
// Trocar de JSON para banco de dados = nova implementação desta interface.
// Server actions e componentes não precisam mudar.

export interface ResearchRepository {
  listByProfileId(profileId: string): Promise<Research[]>;
  getVagas(profileId: string, date: string): Promise<any | null>;
  getResumo(profileId: string, date: string): Promise<any | null>;
}

// ─── Implementação JSON ──────────────────────────────────────────────────────

export class JsonResearchRepository implements ResearchRepository {
  /**
   * Valida o parâmetro date contra path traversal e formato esperado.
   * Aceita YYYY-MM-DD ou YYYY-MM-DD-N (sufixo numérico para colisões).
   */
  private validateDate(date: string): void {
    if (!date || !/^\d{4}-\d{2}-\d{2}(?:-\d+)?$/.test(date)) {
      throw new Error(`Data inválida: "${date}"`);
    }
  }

  /**
   * Retorna o caminho para o diretório de pesquisas de um perfil.
   * Valida profileId contra path traversal (T-08-01).
   */
  private researchPath(profileId: string): string {
    if (
      !profileId ||
      profileId.includes("..") ||
      profileId.includes("/") ||
      profileId.includes("\\")
    ) {
      throw new Error(`ID de perfil inválido: "${profileId}"`);
    }
    const dir = ensureSubdir("research");
    return path.join(dir, profileId);
  }

  /**
   * Lista todas as pesquisas de um perfil, ordenadas por data decrescente.
   * Retorna [] se o diretório não existir (T-08-02: fallback silencioso).
   */
  async listByProfileId(profileId: string): Promise<Research[]> {
    const dir = this.researchPath(profileId);

    try {
      if (!fs.existsSync(dir)) {
        return [];
      }

      const files = fs.readdirSync(dir) as unknown as string[];

      // Regex: ^(YYYY-MM-DD)(?:-\d+)?-(vagas|resumo)\.json$
      // Grupo 1: data (YYYY-MM-DD)
      // Grupo 2 (opcional): sufixo numérico (-2, -3, etc.)
      // Grupo 3: tipo (vagas ou resumo)
      const FILE_REGEX =
        /^(\d{4}-\d{2}-\d{2})(?:-\d+)?-(vagas|resumo)\.json$/;

      const map = new Map<string, Research>();

      for (const file of files) {
        const match = FILE_REGEX.exec(file as string);
        if (!match) continue;

        const date = match[1];
        const type = match[2] as "vagas" | "resumo";

        if (!map.has(date)) {
          // baseName = nome do arquivo sem o sufixo "-(vagas|resumo).json"
          // ex: "2026-04-24-vagas.json" → "2026-04-24"
          // ex: "2026-04-24-2-vagas.json" → "2026-04-24-2"
          const baseName = (file as string).replace(/-(vagas|resumo)\.json$/, "");
          map.set(date, {
            profileId,
            date,
            baseName,
            vagasFile: "",
            resumoFile: "",
          });
        }

        const research = map.get(date)!;
        if (type === "vagas") {
          research.vagasFile = file as string;
        } else {
          research.resumoFile = file as string;
        }
      }

      // Ordenar por data decrescente (mais recente primeiro)
      return Array.from(map.values()).sort((a, b) =>
        b.date.localeCompare(a.date)
      );
    } catch {
      return [];
    }
  }

  /**
   * Carrega o conteúdo JSON do arquivo de vagas de uma pesquisa.
   * Retorna null se o arquivo não existir ou se ocorrer erro de parse (T-08-03).
   */
  async getVagas(profileId: string, date: string): Promise<any | null> {
    try {
      this.validateDate(date);
      const dir = this.researchPath(profileId);
      const filePath = path.join(dir, `${date}-vagas.json`);

      if (!fs.existsSync(filePath)) return null;

      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  /**
   * Carrega o conteúdo JSON do arquivo de resumo de uma pesquisa.
   * Retorna null se o arquivo não existir ou se ocorrer erro de parse (T-08-03).
   */
  async getResumo(profileId: string, date: string): Promise<any | null> {
    try {
      this.validateDate(date);
      const dir = this.researchPath(profileId);
      const filePath = path.join(dir, `${date}-resumo.json`);

      if (!fs.existsSync(filePath)) return null;

      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────
// Trocar implementação aqui quando migrar para banco de dados.
// Nenhum outro arquivo precisa mudar.

export const researchRepository: ResearchRepository =
  new JsonResearchRepository();
