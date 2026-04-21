"use server";

import { redirect } from "next/navigation";
import type { Vacancy, VacancyStatus } from "@/lib/vacancy";
import { generateVacancyId, VACANCY_STATUSES } from "@/lib/vacancy";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro desconhecido. Tente novamente.";
}

// ─── Actions ─────────────────────────────────────────────────────────────────

// Cria nova vaga a partir de perfil existente e campos específicos (VAG-01, D-02, D-03)
export async function createVacancy(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  try {
    const profileId = formData.get("profileId") as string | null;
    if (!profileId) {
      return { error: "Perfil é obrigatório" };
    }

    // Valida que o perfil existe antes de criar a vaga
    const profile = await profileRepository.findById(profileId);
    if (!profile) {
      return { error: "Perfil não encontrado" };
    }

    // Extrai campos do Grupo 2 (D-03): dados específicos da vaga
    const requestType = (formData.get("requestType") as string) || "Recrutamento externo";
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const costCenter = (formData.get("costCenter") as string) || "";
    const salaryRange = (formData.get("salaryRange") as string) || "";
    const confidential = formData.get("confidential") === "true";
    const budgeted = formData.get("budgeted") === "true";
    const headcountIncrease = formData.get("headcountIncrease") === "true";
    const replacedPerson = headcountIncrease
      ? undefined
      : (formData.get("replacedPerson") as string | undefined) || undefined;
    const workSchedule = (formData.get("workSchedule") as string) || "Das 08h às 17h";
    const travelRequired = formData.get("travelRequired") === "true";
    const workMode = (formData.get("workMode") as string) || "Presencial";
    const expectedHireDate = (formData.get("expectedHireDate") as string) || "";

    // Validação de campos obrigatórios (T-03-02)
    if (!requestType || quantity < 1 || !workMode || !workSchedule) {
      return { error: "Preencha todos os campos obrigatórios" };
    }

    const vacancy: Vacancy = {
      id: generateVacancyId(),
      profileId,
      status: "Aberta",
      requestType: requestType as Vacancy["requestType"],
      quantity,
      costCenter,
      salaryRange,
      confidential,
      budgeted,
      headcountIncrease,
      replacedPerson,
      workSchedule: workSchedule as Vacancy["workSchedule"],
      travelRequired,
      workMode: workMode as Vacancy["workMode"],
      expectedHireDate,
      openedAt: new Date().toISOString(),
    };

    await vacancyRepository.save(vacancy);
  } catch (error) {
    return { error: formatError(error) };
  }
  redirect("/vacancies");
}

// Atualiza campos específicos da vaga (preserva id, profileId, status, openedAt, closedAt)
export async function updateVacancy(
  vacancyId: string,
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  try {
    const vacancy = await vacancyRepository.findById(vacancyId);
    if (!vacancy) {
      return { error: "Vaga não encontrada" };
    }

    // Atualiza somente os campos editáveis do Grupo 2 (D-03)
    vacancy.requestType = (formData.get("requestType") as string) as Vacancy["requestType"];
    vacancy.quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    vacancy.costCenter = (formData.get("costCenter") as string) || "";
    vacancy.salaryRange = (formData.get("salaryRange") as string) || "";
    vacancy.confidential = formData.get("confidential") === "true";
    vacancy.budgeted = formData.get("budgeted") === "true";
    vacancy.headcountIncrease = formData.get("headcountIncrease") === "true";
    vacancy.replacedPerson = vacancy.headcountIncrease
      ? undefined
      : (formData.get("replacedPerson") as string | undefined) || undefined;
    vacancy.workSchedule = (formData.get("workSchedule") as string) as Vacancy["workSchedule"];
    vacancy.travelRequired = formData.get("travelRequired") === "true";
    vacancy.workMode = (formData.get("workMode") as string) as Vacancy["workMode"];
    vacancy.expectedHireDate = (formData.get("expectedHireDate") as string) || "";

    if (!vacancy.requestType || vacancy.quantity < 1) {
      return { error: "Preencha todos os campos obrigatórios" };
    }

    await vacancyRepository.save(vacancy);
  } catch (error) {
    return { error: formatError(error) };
  }
  redirect(`/vacancies/${vacancyId}`);
}

// Exclui vaga pelo ID (idempotente)
export async function deleteVacancy(vacancyId: string): Promise<void> {
  try {
    await vacancyRepository.delete(vacancyId);
  } catch (error) {
    console.error("Falha ao excluir vaga:", error);
  }
}

// Avança o status da vaga: Aberta → Em andamento → Encerrada (D-12)
export async function advanceVacancyStatus(vacancyId: string): Promise<void> {
  try {
    const vacancy = await vacancyRepository.findById(vacancyId);
    if (!vacancy) return;

    const transitions: Record<string, string | null> = {
      Aberta: "Em andamento",
      "Em andamento": "Encerrada",
      Encerrada: null,
    };

    const nextStatus = transitions[vacancy.status];
    if (!nextStatus) return;

    vacancy.status = nextStatus as Vacancy["status"];
    if (nextStatus === "Encerrada") {
      vacancy.closedAt = new Date().toISOString();
    }

    await vacancyRepository.save(vacancy);
  } catch (error) {
    console.error("Falha ao avançar status da vaga:", error);
  }
}

// Reverte o status da vaga: Encerrada → Em andamento → Aberta (correção de clique acidental)
export async function revertVacancyStatus(vacancyId: string): Promise<void> {
  try {
    const vacancy = await vacancyRepository.findById(vacancyId);
    if (!vacancy) return;

    const transitions: Record<string, string | null> = {
      "Em andamento": "Aberta",
      Encerrada: "Em andamento",
      Aberta: null,
    };

    const prevStatus = transitions[vacancy.status];
    if (!prevStatus) return;

    vacancy.status = prevStatus as Vacancy["status"];
    if (prevStatus !== "Encerrada") {
      vacancy.closedAt = undefined;
    }

    await vacancyRepository.save(vacancy);
  } catch (error) {
    console.error("Falha ao reverter status da vaga:", error);
  }
}

// Altera o status da vaga para qualquer estado válido (GAP-02)
export async function changeVacancyStatus(
  vacancyId: string,
  newStatus: VacancyStatus
): Promise<void> {
  // Guard: rejeita valores fora do enum fechado (T-03-06-01)
  if (!VACANCY_STATUSES.includes(newStatus)) return;

  try {
    const vacancy = await vacancyRepository.findById(vacancyId);
    if (!vacancy) return;

    vacancy.status = newStatus;
    if (newStatus === "Encerrada") {
      vacancy.closedAt = new Date().toISOString();
    } else {
      vacancy.closedAt = undefined;
    }

    await vacancyRepository.save(vacancy);
  } catch (error) {
    console.error("Falha ao alterar status da vaga:", error);
  }
}
