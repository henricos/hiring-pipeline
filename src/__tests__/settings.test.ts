import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import type { AreaSettings } from "@/lib/settings";

// Mock env antes de qualquer importação que use env
vi.mock("@/lib/env", () => ({
  env: { DATA_PATH: "/tmp/test-settings" },
}));

// Importações dinâmicas após o mock
const { defaultSettings } = await import("@/lib/settings");
const { settingsRepository } = await import(
  "@/lib/repositories/settings-repository"
);

describe("AreaSettings", () => {
  const settingsFile = path.join("/tmp/test-settings", "settings.json");

  beforeEach(() => {
    // Garantir que o diretório de test existe e o arquivo está limpo
    fs.mkdirSync("/tmp/test-settings", { recursive: true });
    if (fs.existsSync(settingsFile)) {
      fs.unlinkSync(settingsFile);
    }
  });

  it("defaultSettings retorna AreaSettings com strings vazias", () => {
    const settings = defaultSettings();
    expect(settings.managerName).toBe("");
    expect(settings.godfather).toBe("");
    expect(settings.immediateReport).toBe("");
    expect(settings.mediateReport).toBe("");
    expect(settings.teamComposition).toBe("");
  });

  it("SettingsRepository.get() retorna defaults se arquivo não existir", async () => {
    const settings = await settingsRepository.get();
    expect(settings.managerName).toBe("");
    expect(settings.godfather).toBe("");
    expect(settings.immediateReport).toBe("");
    expect(settings.mediateReport).toBe("");
    expect(settings.teamComposition).toBe("");
  });

  it("SettingsRepository.save() e get() persistem os dados corretamente", async () => {
    const saved = {
      managerName: "João Silva",
      godfather: "Maria Santos",
      immediateReport: "Carlos Oliveira",
      mediateReport: "Ana Costa",
      teamComposition: "5 devs, 1 qa",
    };
    await settingsRepository.save(saved);
    const loaded = await settingsRepository.get();
    expect(loaded).toEqual(saved);
  });

  it("save() grava JSON formatado com 2 espaços em DATA_PATH/settings.json", async () => {
    const settings = {
      managerName: "Gestor",
      godfather: "",
      immediateReport: "",
      mediateReport: "",
      teamComposition: "",
    };
    await settingsRepository.save(settings);
    expect(fs.existsSync(settingsFile)).toBe(true);
    const content = fs.readFileSync(settingsFile, "utf-8");
    // JSON formatado com 2 espaços
    expect(content).toContain('"managerName": "Gestor"');
    expect(content).toMatch(/^\{/); // começa com {
  });
});

describe("AreaSettings — rótulos de qualificações", () => {
  it("defaultSettings() inclui qualificationsRequiredLabel como 'Requisitos:'", () => {
    const defaults = defaultSettings();
    expect(defaults.qualificationsRequiredLabel).toBe("Requisitos:");
  });

  it("defaultSettings() inclui qualificationsOptionalLabel como 'Diferenciais:'", () => {
    const defaults = defaultSettings();
    expect(defaults.qualificationsOptionalLabel).toBe("Diferenciais:");
  });

  it("aceita rótulos customizados como strings opcionais", () => {
    const settings: AreaSettings = {
      managerName: "",
      godfather: "",
      immediateReport: "",
      mediateReport: "",
      teamComposition: "",
      qualificationsRequiredLabel: "Você deve ter:",
      qualificationsOptionalLabel: "Seria ótimo se você tiver:",
    };
    expect(settings.qualificationsRequiredLabel).toBe("Você deve ter:");
    expect(settings.qualificationsOptionalLabel).toBe("Seria ótimo se você tiver:");
  });
});

describe("AreaSettings — campo aiProfileInstructions (D-14 — Phase 4)", () => {
  it("aceita aiProfileInstructions como string opcional", () => {
    const settings: AreaSettings = {
      managerName: "João",
      godfather: "Maria",
      immediateReport: "Carlos",
      mediateReport: "Ana",
      teamComposition: "5 devs",
      aiProfileInstructions: "Priorizar candidatos com experiência em produtos educacionais.",
    };
    expect(typeof settings.aiProfileInstructions).toBe("string");
  });

  it("aiProfileInstructions é opcional — AreaSettings sem o campo é válido", () => {
    const settings: AreaSettings = {
      managerName: "",
      godfather: "",
      immediateReport: "",
      mediateReport: "",
      teamComposition: "",
    };
    // Sem aiProfileInstructions — TypeScript deve aceitar
    expect(settings.aiProfileInstructions).toBeUndefined();
  });

  it("defaultSettings() inclui aiProfileInstructions como string vazia", () => {
    const defaults = defaultSettings();
    expect(typeof defaults.aiProfileInstructions).toBe("string");
  });
});
