"use server";

import { researchRepository } from "@/lib/repositories/research-repository";
import type { Research } from "@/lib/repositories/research-repository";

/**
 * Listar todas as pesquisas de um perfil (ordenadas por data desc).
 * Usado em page.tsx para popular ProfileDetailTabs.
 */
export async function getResearchesByProfileId(
  profileId: string
): Promise<Research[]> {
  return researchRepository.listByProfileId(profileId);
}

/**
 * Carregar vagas de uma pesquisa específica (por data).
 * Usado em ProfileDetailVagas ao expandir uma pesquisa.
 */
export async function getVagasForDate(
  profileId: string,
  date: string
): Promise<any | null> {
  return researchRepository.getVagas(profileId, date);
}

/**
 * Carregar resumo de uma pesquisa específica (por data).
 * Usado em ProfileDetailResumo para exibir dados de mercado.
 */
export async function getResumoForDate(
  profileId: string,
  date: string
): Promise<any | null> {
  return researchRepository.getResumo(profileId, date);
}
