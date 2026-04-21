// Grupo 3: Dados comuns da área (settings.json)
// Campos compartilhados entre todas as vagas — D-05, D-06

import type { LanguageLevel } from "@/lib/profile";
import type { WorkMode, WorkSchedule } from "@/lib/vacancy";

export interface AreaSettings {
  // ── Dados da Área (existentes) ────────────────────────────────
  managerName: string; // Vaga solicitada por (nome do gestor)
  godfather: string; // Nome do padrinho
  immediateReport: string; // Reporte imediato (nome)
  mediateReport: string; // Reporte mediato (nome)
  teamComposition: string; // Estrutura da área e quantidade de pessoas por cargo

  // ── Idiomas (migrado de JobProfile — GAP-12) ──────────────────
  englishLevel?: LanguageLevel;
  spanishLevel?: LanguageLevel;
  otherLanguage?: string;
  otherLanguageLevel?: LanguageLevel;

  // ── Conteúdo descritivo compartilhado (migrado de JobProfile — GAP-12) ──
  additionalInfo?: string;

  // ── Infraestrutura (migrado de JobProfile — GAP-12) ──────────
  systemsRequired?: string;
  networkFolders?: string;

  // ── Dados da Vaga fixos por área (migrado de Vacancy — GAP-12) ──
  costCenter?: string;
  workSchedule?: WorkSchedule;
  workScheduleOther?: string; // texto livre quando workSchedule === "Outro"
  travelRequired?: boolean;
  workMode?: WorkMode;

  // ── Instruções para IA (Phase 4 — D-14) ──────────────────────
  aiProfileInstructions?: string; // instruções para a skill /refinar-perfil
}

// Padrão com strings vazias — nunca null
export function defaultSettings(): AreaSettings {
  return {
    managerName: "",
    godfather: "",
    immediateReport: "",
    mediateReport: "",
    teamComposition: "",
    englishLevel: "Não exigido",
    spanishLevel: "Não exigido",
    otherLanguage: undefined,
    otherLanguageLevel: undefined,
    additionalInfo: "",
    systemsRequired: "",
    networkFolders: "",
    costCenter: "",
    workSchedule: "Das 08h às 17h",
    workScheduleOther: "",
    travelRequired: false,
    workMode: "Presencial",
    aiProfileInstructions: "",
  };
}
