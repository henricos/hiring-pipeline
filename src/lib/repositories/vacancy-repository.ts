import fs from "fs";
import path from "path";
import { ensureSubdir } from "@/lib/data-service";
import type { Vacancy } from "@/lib/vacancy";

// ─── Interface pública ───────────────────────────────────────────────────────
// Trocar de JSON para banco de dados = nova implementação desta interface.
// Server actions e componentes não precisam mudar.

export interface VacancyRepository {
  list(): Promise<Vacancy[]>;
  findById(id: string): Promise<Vacancy | null>;
  save(vacancy: Vacancy): Promise<void>; // cria ou sobrescreve
  delete(id: string): Promise<void>; // idempotente
}

// ─── Implementação JSON ──────────────────────────────────────────────────────

export class JsonVacancyRepository implements VacancyRepository {
  private vacancyPath(id: string): string {
    if (!id || id.includes("..") || id.includes("/") || id.includes("\\")) {
      throw new Error(`ID de vaga inválido: "${id}"`);
    }
    const dir = ensureSubdir("vacancies");
    return path.join(dir, `${id}.json`);
  }

  async list(): Promise<Vacancy[]> {
    try {
      const dir = ensureSubdir("vacancies");
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      const vacancies = files
        .map((file) => {
          try {
            return JSON.parse(
              fs.readFileSync(path.join(dir, file), "utf-8")
            ) as Vacancy;
          } catch {
            return null;
          }
        })
        .filter((v): v is Vacancy => v !== null);

      // Ordenar por openedAt descendente (mais recente primeiro — D-15)
      return vacancies.sort((a, b) =>
        b.openedAt.localeCompare(a.openedAt)
      );
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Vacancy | null> {
    try {
      const filePath = this.vacancyPath(id);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Vacancy;
    } catch {
      return null;
    }
  }

  async save(vacancy: Vacancy): Promise<void> {
    const filePath = this.vacancyPath(vacancy.id);
    fs.writeFileSync(filePath, JSON.stringify(vacancy, null, 2), "utf-8");
  }

  async delete(id: string): Promise<void> {
    try {
      const filePath = this.vacancyPath(id);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // idempotente — silencioso se não existir
    }
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────
// Trocar implementação aqui quando migrar para banco de dados.
// Nenhum outro arquivo precisa mudar.

export const vacancyRepository: VacancyRepository =
  new JsonVacancyRepository();
