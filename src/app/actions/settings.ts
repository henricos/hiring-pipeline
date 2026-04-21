"use server";

import { revalidatePath } from "next/cache";
import type { AreaSettings } from "@/lib/settings";
import { settingsRepository } from "@/lib/repositories/settings-repository";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro desconhecido. Tente novamente.";
}

// ─── Actions ─────────────────────────────────────────────────────────────────

// Salva configurações da área — Grupo 3: dados comuns a todas as vagas (D-05, D-06)
// Não redireciona — permanece na página de configurações após salvar
export async function updateSettings(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  try {
    const managerName = (formData.get("managerName") as string) || "";
    const godfather = (formData.get("godfather") as string) || "";
    const immediateReport = (formData.get("immediateReport") as string) || "";
    const mediateReport = (formData.get("mediateReport") as string) || "";
    const teamComposition = (formData.get("teamComposition") as string) || "";

    // Idiomas (migrado de JobProfile — GAP-12)
    const englishLevel = ((formData.get("englishLevel") as string) || "Não exigido") as AreaSettings["englishLevel"];
    const spanishLevel = ((formData.get("spanishLevel") as string) || "Não exigido") as AreaSettings["spanishLevel"];
    const otherLanguageRaw = (formData.get("otherLanguage") as string | null)?.trim() || "";
    const otherLanguage = otherLanguageRaw || undefined;
    const otherLanguageLevelRaw = (formData.get("otherLanguageLevel") as string | null) || "";
    const otherLanguageLevel = (otherLanguageLevelRaw || undefined) as AreaSettings["otherLanguageLevel"];

    // Conteúdo descritivo (migrado de JobProfile — GAP-12)
    const additionalInfo = (formData.get("additionalInfo") as string) || "";

    // Infraestrutura (migrado de JobProfile — GAP-12)
    const systemsRequiredRaw = (formData.get("systemsRequired") as string | null)?.trim() || "";
    const systemsRequired = systemsRequiredRaw || undefined;
    const networkFoldersRaw = (formData.get("networkFolders") as string | null)?.trim() || "";
    const networkFolders = networkFoldersRaw || undefined;

    // Dados da vaga fixos por área (migrado de Vacancy — GAP-12)
    const costCenter = (formData.get("costCenter") as string) || "";
    const workSchedule = ((formData.get("workSchedule") as string) || "Das 08h às 17h") as AreaSettings["workSchedule"];
    const workScheduleOtherRaw = workSchedule === "Outro"
      ? ((formData.get("workScheduleOther") as string | null) || "")
      : "";
    const workScheduleOther = workScheduleOtherRaw || undefined;
    const travelRequired = formData.get("travelRequired") === "true";
    const workMode = ((formData.get("workMode") as string) || "Presencial") as AreaSettings["workMode"];

    const settings: AreaSettings = {
      managerName,
      godfather,
      immediateReport,
      mediateReport,
      teamComposition,
      englishLevel,
      spanishLevel,
      otherLanguage,
      otherLanguageLevel,
      additionalInfo,
      systemsRequired,
      networkFolders,
      costCenter,
      workSchedule,
      workScheduleOther,
      travelRequired,
      workMode,
    };

    await settingsRepository.save(settings);
    revalidatePath("/settings");
  } catch (error) {
    return { error: formatError(error) };
  }
}
