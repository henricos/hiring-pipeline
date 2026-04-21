"use server";

import { redirect } from "next/navigation";
import { profileRepository } from "@/lib/repositories/profile-repository";
import type { JobProfile } from "@/lib/profile";
import { generateProfileId } from "@/lib/profile";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractProfileData(
  formData: FormData
): Omit<JobProfile, "id" | "createdAt" | "updatedAt"> | { error: string } {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  if (!title) return { error: "Título é obrigatório" };

  const suggestedTitle =
    (formData.get("suggestedTitle") as string | null)?.trim() ?? "";
  if (!suggestedTitle)
    return { error: "Cargo sugerido para anúncio é obrigatório" };

  return {
    title,
    suggestedTitle,
    experienceLevel: formData.get("experienceLevel") as JobProfile["experienceLevel"],
    educationLevel: formData.get("educationLevel") as JobProfile["educationLevel"],
    educationCourse:
      (formData.get("educationCourse") as string | null)?.trim() || undefined,
    postGraduateLevel: formData.get("postGraduateLevel") as JobProfile["postGraduateLevel"],
    postGraduateCourse:
      (formData.get("postGraduateCourse") as string | null)?.trim() || undefined,
    certifications: formData.get("certifications") as JobProfile["certifications"],
    certificationsWhich:
      (formData.get("certificationsWhich") as string | null)?.trim() || undefined,
    // englishLevel, spanishLevel, otherLanguage, otherLanguageLevel migrados para AreaSettings (GAP-12)
    // additionalInfo, systemsRequired, networkFolders migrados para AreaSettings (GAP-12)
    responsibilities:
      (formData.get("responsibilities") as string | null)?.trim() ?? "",
    qualifications:
      (formData.get("qualifications") as string | null)?.trim() ?? "",
    behaviors: (formData.get("behaviors") as string | null)?.trim() ?? "",
    challenges: (formData.get("challenges") as string | null)?.trim() ?? "",
    internalNotes:
      (formData.get("internalNotes") as string | null)?.trim() || undefined,
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createProfile(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {
  const data = extractProfileData(formData);
  if ("error" in data) return data;

  const now = new Date().toISOString();
  const profile: JobProfile = {
    id: generateProfileId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await profileRepository.save(profile);
  } catch {
    return { error: "Não foi possível salvar o perfil. Tente novamente." };
  }

  redirect("/profiles");
}

export async function updateProfile(
  profileId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | void> {
  const data = extractProfileData(formData);
  if ("error" in data) return data;

  let existing: JobProfile | null;
  try {
    existing = await profileRepository.findById(profileId);
  } catch {
    return { error: "Não foi possível carregar o perfil. Tente novamente." };
  }

  if (!existing) return { error: "Perfil não encontrado" };

  try {
    await profileRepository.save({
      ...existing,
      ...data,
      id: profileId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return { error: "Não foi possível salvar o perfil. Tente novamente." };
  }

  return { success: true };
}

export async function deleteProfile(profileId: string): Promise<void> {
  try {
    await profileRepository.delete(profileId);
  } catch {
    // idempotente
  }
  redirect("/profiles");
}

export async function listProfiles(): Promise<JobProfile[]> {
  return profileRepository.list();
}

export async function getProfile(
  profileId: string
): Promise<JobProfile | null> {
  return profileRepository.findById(profileId);
}
