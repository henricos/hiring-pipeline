import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import type { Vacancy } from "@/lib/vacancy";
import type { JobProfile } from "@/lib/profile";
import type { AreaSettings } from "@/lib/settings";

// Escapa os 5 caracteres especiais do XML (per Pitfall 4: RESEARCH.md)
// Obrigatório para qualquer valor inserido no sheet XML
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Converte string ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ) para DD/MM/YYYY.
 * Retorna string vazia se input for falsy ou inválido.
 */
export function toExcelDate(isoStr: string | undefined | null): string {
  if (!isoStr) return "";
  // Extrair apenas a parte da data (antes do "T" se houver)
  const datePart = isoStr.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return isoStr; // fallback se formato inesperado
  return `${day}/${month}/${year}`;
}

// Mapeamento de campos → endereços de célula no template sheet1.xml
// Fonte: inspeção via AdmZip dos arquivos em data/examples/ (confirmado em 2026-04-21)
// Todos os endereços validados contra exemplos preenchidos manualmente.
const CELL_MAPPING: Record<string, string> = {
  // Grupo 1: Dados do Perfil (herdados de JobProfile)
  title: "D6",
  suggestedTitle: "K8",
  educationLevel: "I31",
  educationCourse: "AB31",
  postGraduateLevel: "I33",
  englishLevel: "U37",
  spanishLevel: "U39",
  responsibilities: "B44",
  qualifications: "B48",
  behaviors: "B52",
  challenges: "B56",
  additionalInfo: "B59",
  systemsRequired: "G66",
  networkFolders: "G68",

  // Grupo 2: Dados Específicos da Vaga
  // requestType e experienceLevel omitidos: são radio buttons visuais sem célula de input livre no template
  quantity: "AD4",
  costCenter: "T10",
  salaryRange: "T12",
  confidential: "J12",
  budgeted: "J14",
  headcountIncrease: "J16",
  replacedPerson: "AE16",
  workSchedule: "Z18",
  travelRequired: "L20",
  workMode: "P23",
  expectedHireDate: "K24",
  openedAt: "AH4", // Data de abertura da vaga (GAP-06)

  // Grupo 3: Dados Comuns da Área (AreaSettings)
  managerName: "H10",
  godfather: "AD6",
  immediateReport: "G22",
  mediateReport: "AE22",
  teamComposition: "B27",
};

/**
 * Gera o formulário GH de requisição de pessoal em formato .xlsx.
 *
 * Abordagem cirúrgica via zipfile (adm-zip): copia o template byte a byte,
 * modifica apenas sheet1.xml com os valores das células, e regrava o ZIP
 * preservando todos os outros membros (VML, ctrlProps, imagens, etc.).
 *
 * Per D-07, D-11, VAG-03 do RESEARCH.md.
 */
export function generateVacancyForm(
  templatePath: string,
  outputPath: string,
  vacancy: Vacancy,
  profile: JobProfile,
  settings: AreaSettings
): void {
  // Validar existência do template (T-03-08: Denial of Service mitigation)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  // Carregar template como ZIP (adm-zip lança erro se ZIP corrompido — T-03-08)
  const zip = new AdmZip(templatePath);

  // Extrair sheet1.xml (aba "Perfil Vaga" — única aba editada)
  const sheetEntry = zip.getEntry("xl/worksheets/sheet1.xml");
  if (!sheetEntry) {
    throw new Error("sheet1.xml não encontrado no template XLSX");
  }

  let sheetXml = sheetEntry.getData().toString("utf-8");

  // Montar mapa de valores por célula (todos os 3 grupos)
  const cellValues: Record<string, string> = {
    // Grupo 1: Perfil
    [CELL_MAPPING.title]: profile.title ?? "",
    [CELL_MAPPING.suggestedTitle]: profile.suggestedTitle ?? "",
    [CELL_MAPPING.educationLevel]: profile.educationLevel ?? "",
    [CELL_MAPPING.educationCourse]: profile.educationCourse ?? "",
    [CELL_MAPPING.postGraduateLevel]: profile.postGraduateLevel ?? "",
    [CELL_MAPPING.englishLevel]: profile.englishLevel ?? "",
    [CELL_MAPPING.spanishLevel]: profile.spanishLevel ?? "",
    [CELL_MAPPING.responsibilities]: profile.responsibilities ?? "",
    [CELL_MAPPING.qualifications]: profile.qualifications ?? "",
    [CELL_MAPPING.behaviors]: profile.behaviors ?? "",
    [CELL_MAPPING.challenges]: profile.challenges ?? "",
    [CELL_MAPPING.additionalInfo]: profile.additionalInfo ?? "",
    [CELL_MAPPING.systemsRequired]: profile.systemsRequired ?? "",
    [CELL_MAPPING.networkFolders]: profile.networkFolders ?? "",

    // Grupo 2: Vaga (requestType e experienceLevel são radio buttons visuais — sem célula de input livre)
    [CELL_MAPPING.quantity]: vacancy.quantity.toString(),
    [CELL_MAPPING.costCenter]: vacancy.costCenter,
    [CELL_MAPPING.salaryRange]: vacancy.salaryRange,
    [CELL_MAPPING.confidential]: vacancy.confidential ? "Sim" : "Não",
    [CELL_MAPPING.budgeted]: vacancy.budgeted ? "Sim" : "Não",
    [CELL_MAPPING.headcountIncrease]: vacancy.headcountIncrease ? "Sim" : "Não",
    [CELL_MAPPING.replacedPerson]: vacancy.replacedPerson ?? "",
    [CELL_MAPPING.workSchedule]: vacancy.workSchedule,
    [CELL_MAPPING.travelRequired]: vacancy.travelRequired ? "Sim" : "Não",
    [CELL_MAPPING.workMode]: vacancy.workMode,
    [CELL_MAPPING.expectedHireDate]: toExcelDate(vacancy.expectedHireDate),
    [CELL_MAPPING.openedAt]: toExcelDate(vacancy.openedAt),

    // Grupo 3: Configurações da área
    [CELL_MAPPING.managerName]: settings.managerName ?? "",
    [CELL_MAPPING.godfather]: settings.godfather ?? "",
    [CELL_MAPPING.immediateReport]: settings.immediateReport ?? "",
    [CELL_MAPPING.mediateReport]: settings.mediateReport ?? "",
    [CELL_MAPPING.teamComposition]: settings.teamComposition ?? "",
  };

  // Edição cirúrgica: substituir cada célula no XML do sheet
  for (const [cellAddr, value] of Object.entries(cellValues)) {
    const escapedValue = escapeXml(value);

    // Padrão 1: Célula vazia — <c r="D6" s="59"/>
    // Substituída por inline string com valor
    const emptyCellRe = new RegExp(
      `<c r="${escapeRegex(cellAddr)}" s="(\\d+)"/>`,
      "g"
    );
    sheetXml = sheetXml.replace(
      emptyCellRe,
      `<c r="${cellAddr}" s="$1" t="inlineStr"><is><t>${escapedValue}</t></is></c>`
    );

    // Padrão 2: Célula com valor existente (ex: shared string t="s" ou outro tipo)
    // <c r="D6" s="59" t="s"><v>8</v></c> → inline string com novo valor
    // Cobertura: Pitfall 2 — célula ocupada (ex: D6 tem "SDR" como shared string)
    const existingCellRe = new RegExp(
      `<c r="${escapeRegex(cellAddr)}"([^>]*)>.*?</c>`,
      "gs"
    );
    sheetXml = sheetXml.replace(existingCellRe, (_match, attrs) => {
      // Preservar atributo s= (estilo) se presente; remover t= pois usaremos inlineStr
      const styleMatch = /s="(\d+)"/.exec(attrs);
      const styleAttr = styleMatch ? ` s="${styleMatch[1]}"` : "";
      return `<c r="${cellAddr}"${styleAttr} t="inlineStr"><is><t>${escapedValue}</t></is></c>`;
    });
  }

  // Atualizar sheet1.xml no ZIP (todos os outros membros permanecem intactos: VML, ctrlProps, etc.)
  zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(sheetXml, "utf-8"));

  // Garantir que o diretório de saída existe
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Gravar o ZIP modificado no caminho de saída (D-08, D-09)
  zip.writeZip(outputPath);
}

// Escapa caracteres especiais de regex em endereços de célula (ex: "$D$6")
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
