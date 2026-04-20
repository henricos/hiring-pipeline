"use server";

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

    const settings: AreaSettings = {
      managerName,
      godfather,
      immediateReport,
      mediateReport,
      teamComposition,
    };

    await settingsRepository.save(settings);
    // Sem redirect — permanece na página após salvar (padrão D-05)
  } catch (error) {
    return { error: formatError(error) };
  }
}
