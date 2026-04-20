import fs from "fs";
import path from "path";
import { env } from "@/lib/env";
import type { AreaSettings } from "@/lib/settings";
import { defaultSettings } from "@/lib/settings";

const SETTINGS_FILE = "settings.json";

// ─── Interface pública ───────────────────────────────────────────────────────
// Singleton — não é coleção, portanto sem list() nem delete()

export interface SettingsRepository {
  get(): Promise<AreaSettings>;
  save(settings: AreaSettings): Promise<void>;
}

// ─── Implementação JSON ──────────────────────────────────────────────────────

export class JsonSettingsRepository implements SettingsRepository {
  private get settingsPath(): string {
    return path.join(env.DATA_PATH, SETTINGS_FILE);
  }

  async get(): Promise<AreaSettings> {
    if (!fs.existsSync(this.settingsPath)) {
      return defaultSettings();
    }
    const content = fs.readFileSync(this.settingsPath, "utf-8");
    try {
      return JSON.parse(content) as AreaSettings;
    } catch {
      return defaultSettings();
    }
  }

  async save(settings: AreaSettings): Promise<void> {
    fs.writeFileSync(
      this.settingsPath,
      JSON.stringify(settings, null, 2),
      "utf-8"
    );
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────
// Trocar implementação aqui quando migrar para banco de dados.
// Nenhum outro arquivo precisa mudar.

export const settingsRepository: SettingsRepository =
  new JsonSettingsRepository();
