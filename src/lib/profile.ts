// Tipos union para campos de seleção
export type ExperienceLevel =
  | "< 1 ano"
  | "1-3 anos"
  | "3-5 anos"
  | "5-10 anos"
  | "> 10 anos";

export type EducationLevel =
  | "Ensino médio"
  | "Superior cursando"
  | "Superior completo";

export type PostGraduateLevel = "Não exigido" | "Desejável" | "Necessário";

export type CertificationLevel = "Não" | "Desejável" | "Sim";

export type LanguageLevel =
  | "Não exigido"
  | "Básico"
  | "Intermediário"
  | "Avançado"
  | "Fluente";

// Interface principal do perfil de vaga
export interface JobProfile {
  id: string;
  // Identificação
  title: string; // título do cargo (interno)
  suggestedTitle: string; // cargo sugerido para anúncio/Gupy
  // Requisitos do candidato
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  educationCourse?: string; // obrigatório quando educationLevel !== "Ensino médio"
  postGraduateLevel: PostGraduateLevel;
  postGraduateCourse?: string; // quando postGraduateLevel === "Desejável" | "Necessário"
  certifications: CertificationLevel;
  certificationsWhich?: string; // quando certifications === "Desejável" | "Sim"
  englishLevel?: LanguageLevel; // opcional — migrado para AreaSettings (GAP-12)
  spanishLevel?: LanguageLevel; // opcional — migrado para AreaSettings (GAP-12)
  otherLanguage?: string; // opcional — migrado para AreaSettings (GAP-12)
  otherLanguageLevel?: LanguageLevel; // opcional — migrado para AreaSettings (GAP-12)
  // Conteúdo descritivo (5 textareas — núcleo do perfil)
  responsibilities: string; // Responsabilidades e atribuições
  qualifications: string; // Requisitos e qualificações (obrigatórios + diferenciais)
  behaviors: string; // Características e competências comportamentais
  challenges: string; // Principais desafios
  additionalInfo?: string; // opcional — migrado para AreaSettings (GAP-12)
  // Infraestrutura (opcional)
  systemsRequired?: string; // opcional — migrado para AreaSettings (GAP-12)
  networkFolders?: string; // opcional — migrado para AreaSettings (GAP-12)
  // Observações internas (não publicadas externamente)
  internalNotes?: string;
  // Metadados
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Constantes para opções dos selects
export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "< 1 ano",
  "1-3 anos",
  "3-5 anos",
  "5-10 anos",
  "> 10 anos",
];

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Ensino médio",
  "Superior cursando",
  "Superior completo",
];

export const POST_GRADUATE_LEVELS: PostGraduateLevel[] = [
  "Não exigido",
  "Desejável",
  "Necessário",
];

export const CERTIFICATION_LEVELS: CertificationLevel[] = [
  "Não",
  "Desejável",
  "Sim",
];

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "Não exigido",
  "Básico",
  "Intermediário",
  "Avançado",
  "Fluente",
];

export function generateProfileId(): string {
  return crypto.randomUUID();
}
