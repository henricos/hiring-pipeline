// Tipos union para campos de seleção de vagas

export type VacancyStatus = "Aberta" | "Em andamento" | "Encerrada";

export type RequestType = "Recrutamento interno" | "Recrutamento externo";

export type WorkSchedule = "Das 08h às 17h" | "Das 09h às 18h" | "Outro";

export type WorkMode = "Presencial" | "Remoto" | "Híbrido";

// Interface principal de vaga
export interface Vacancy {
  id: string; // UUID v4, gerado na criação
  profileId: string; // chave estrangeira para JobProfile
  status: VacancyStatus; // default "Aberta"
  // Campos específicos da vaga (grupo D-03)
  requestType: RequestType;
  quantity: number; // default 1
  costCenter: string;
  salaryRange: string;
  confidential: boolean; // default false
  budgeted: boolean; // default true
  headcountIncrease: boolean; // default false
  replacedPerson?: string; // undefined se headcountIncrease=true
  workSchedule: WorkSchedule;
  workScheduleOther?: string; // Texto livre quando workSchedule === "Outro"
  travelRequired: boolean; // default false
  workMode: WorkMode;
  expectedHireDate: string; // ISO 8601 (data)
  // Datas de ciclo de vida (D-13)
  openedAt: string; // ISO 8601, automático na criação
  closedAt?: string; // ISO 8601, definido quando status="Encerrada"
}

// Constantes para opções dos selects
export const VACANCY_STATUSES: VacancyStatus[] = [
  "Aberta",
  "Em andamento",
  "Encerrada",
];

export const REQUEST_TYPES: RequestType[] = [
  "Recrutamento interno",
  "Recrutamento externo",
];

export const WORK_SCHEDULES: WorkSchedule[] = [
  "Das 08h às 17h",
  "Das 09h às 18h",
  "Outro",
];

export const WORK_MODES: WorkMode[] = ["Presencial", "Remoto", "Híbrido"];

// Gera UUID v4 para nova vaga
export function generateVacancyId(): string {
  return crypto.randomUUID();
}

// Fábrica de vaga padrão (útil em testes e formulários)
export function createDefaultVacancy(profileId: string): Vacancy {
  return {
    id: generateVacancyId(),
    profileId,
    status: "Aberta",
    requestType: "Recrutamento externo",
    quantity: 1,
    costCenter: "",
    salaryRange: "",
    confidential: false,
    budgeted: true,
    headcountIncrease: false,
    workSchedule: "Das 08h às 17h",
    travelRequired: false,
    workMode: "Presencial",
    expectedHireDate: new Date().toISOString().split("T")[0],
    openedAt: new Date().toISOString(),
  };
}
