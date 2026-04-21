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
  workScheduleOther: "Z18",  // Preenche célula Z18 somente quando workSchedule==="Outro" (GAP-05)
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

// ─── Mapeamento de grupos de checkbox VML ────────────────────────────────────
// Cada grupo define:
//   options: valor aplicação → ctrlProp a marcar (null = sem checkbox)
//   allGroup: todos os ctrlProps do grupo — limpar TODOS antes de marcar qualquer um
//
// Fonte: inspeção via AdmZip do template em 2026-04-21.
// ctrlPropN corresponde ao arquivo xl/ctrlProps/ctrlPropN.xml no ZIP.
// Template tem vários checkboxes marcados por resíduo de uso anterior:
//   ctrlProp69(Remoto), ctrlProp70(Híbrido), ctrlProp15(3-5 anos),
//   ctrlProp16(5-10 anos), ctrlProp25(Inglês Inter), ctrlProp26(Inglês Básico),
//   ctrlProp29(Espanhol Inter), ctrlProp30(Espanhol Básico)
interface CheckboxGroup {
  options: Record<string, string | null>;
  allGroup: string[];
}

const CHECKBOX_GROUPS: Record<string, CheckboxGroup> = {
  workSchedule: {
    options: {
      "Das 08h às 17h": "ctrlProp3",
      "Das 09h às 18h": "ctrlProp4",
      "Outro":           null,  // sem checkbox; texto vai para célula Z18 via workScheduleOther
    },
    allGroup: ["ctrlProp3", "ctrlProp4"],
  },
  workMode: {
    options: {
      "Presencial": "ctrlProp68",
      "Remoto":     "ctrlProp69",
      "Híbrido":    "ctrlProp70",
    },
    allGroup: ["ctrlProp68", "ctrlProp69", "ctrlProp70"],
  },
  requestType: {
    options: {
      "Recrutamento interno": "ctrlProp5",
      "Recrutamento externo": "ctrlProp6",
    },
    allGroup: ["ctrlProp5", "ctrlProp6"],
  },
  experienceLevel: {
    options: {
      "< 1 ano":   "ctrlProp13",
      "1-3 anos":  "ctrlProp14",
      "3-5 anos":  "ctrlProp15",
      "5-10 anos": "ctrlProp16",
      "> 10 anos": "ctrlProp17",
    },
    allGroup: ["ctrlProp13", "ctrlProp14", "ctrlProp15", "ctrlProp16", "ctrlProp17"],
  },
  englishLevel: {
    options: {
      "Não exigido":   "ctrlProp27",
      "Básico":        "ctrlProp26",
      "Intermediário": "ctrlProp25",
      "Avançado":      "ctrlProp24",
      "Fluente":       null,  // sem checkbox — registrar em célula de texto U37
    },
    allGroup: ["ctrlProp24", "ctrlProp25", "ctrlProp26", "ctrlProp27"],
  },
  spanishLevel: {
    options: {
      "Não exigido":   "ctrlProp31",
      "Básico":        "ctrlProp30",
      "Intermediário": "ctrlProp29",
      "Avançado":      "ctrlProp28",
      "Fluente":       null,  // sem checkbox — registrar em célula de texto U39
    },
    // ctrlProp36,38,40 são shapes duplicados sobrepostos — sempre limpar
    allGroup: ["ctrlProp28", "ctrlProp29", "ctrlProp30", "ctrlProp31",
               "ctrlProp36", "ctrlProp38", "ctrlProp40"],
  },
};

/**
 * Modifica o estado checked de um arquivo ctrlProp dentro do ZIP.
 * - checked=true:  adiciona checked="Checked" antes de lockText="1"
 * - checked=false: remove checked="Checked" se presente
 * Preserva todos os outros atributos e o XML declaration.
 */
function setCtrlPropChecked(zip: AdmZip, ctrlPropName: string, checked: boolean): void {
  const entryPath = `xl/ctrlProps/${ctrlPropName}.xml`;
  const entry = zip.getEntry(entryPath);
  if (!entry) return; // ctrlProp não encontrado — silenciosamente ignorar

  let xml = entry.getData().toString("utf-8");

  // Remover checked="Checked" se existir (normalize para estado desmarcado)
  xml = xml.replace(/\s+checked="Checked"/, "");

  if (checked) {
    // Inserir checked="Checked" antes de lockText="1"
    xml = xml.replace(/(\s+lockText=)/, ' checked="Checked"$1');
  }

  zip.updateFile(entryPath, Buffer.from(xml, "utf-8"));
}

/**
 * Aplica o estado correto para todos os grupos de checkbox do template.
 * Para cada grupo:
 *   1. Desmarca todos os ctrlProps do allGroup
 *   2. Marca apenas o ctrlProp correspondente ao valor escolhido (se não for null)
 */
function applyCheckboxGroups(
  zip: AdmZip,
  vacancy: Vacancy,
  profile: JobProfile,
  settings: AreaSettings
): void {
  // workSchedule — lê de settings (migrado de vacancy — GAP-12)
  {
    const group = CHECKBOX_GROUPS.workSchedule;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    if (settings.workSchedule) {
      const target = group.options[settings.workSchedule];
      if (target) setCtrlPropChecked(zip, target, true);
    }
    // "Outro" → target é null → nenhum checkbox marcado; texto vai para Z18 via cellValues
  }

  // workMode — lê de settings (migrado de vacancy — GAP-12)
  {
    const group = CHECKBOX_GROUPS.workMode;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    if (settings.workMode) {
      const target = group.options[settings.workMode];
      if (target) setCtrlPropChecked(zip, target, true);
    }
  }

  // requestType — NÃO MIGROU para settings — continua lendo de vacancy.requestType
  {
    const group = CHECKBOX_GROUPS.requestType;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    const target = group.options[vacancy.requestType];
    if (target) setCtrlPropChecked(zip, target, true);
  }

  // experienceLevel — NÃO MIGROU para settings — continua lendo de profile.experienceLevel
  {
    const group = CHECKBOX_GROUPS.experienceLevel;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    const target = group.options[profile.experienceLevel ?? ""];
    if (target) setCtrlPropChecked(zip, target, true);
  }

  // englishLevel — lê de settings (migrado de profile — GAP-12)
  {
    const group = CHECKBOX_GROUPS.englishLevel;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    if (settings.englishLevel) {
      const target = group.options[settings.englishLevel];
      if (target) setCtrlPropChecked(zip, target, true);
    }
    // Fluente não tem checkbox — o valor já foi escrito em U37 via CELL_MAPPING
  }

  // spanishLevel — lê de settings (migrado de profile — GAP-12)
  {
    const group = CHECKBOX_GROUPS.spanishLevel;
    group.allGroup.forEach(cp => setCtrlPropChecked(zip, cp, false));
    if (settings.spanishLevel) {
      const target = group.options[settings.spanishLevel];
      if (target) setCtrlPropChecked(zip, target, true);
    }
    // Fluente não tem checkbox — o valor já foi escrito em U39 via CELL_MAPPING
  }
}

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
    // Grupo 1: Perfil (campos que permanecem em JobProfile)
    [CELL_MAPPING.title]: profile.title ?? "",
    [CELL_MAPPING.suggestedTitle]: profile.suggestedTitle ?? "",
    [CELL_MAPPING.educationLevel]: profile.educationLevel ?? "",
    [CELL_MAPPING.educationCourse]: profile.educationCourse ?? "",
    [CELL_MAPPING.postGraduateLevel]: profile.postGraduateLevel ?? "",
    [CELL_MAPPING.responsibilities]: profile.responsibilities ?? "",
    [CELL_MAPPING.qualifications]: profile.qualifications ?? "",
    [CELL_MAPPING.behaviors]: profile.behaviors ?? "",
    [CELL_MAPPING.challenges]: profile.challenges ?? "",

    // Grupo 2: Vaga (requestType e experienceLevel são radio buttons visuais — sem célula de input livre)
    [CELL_MAPPING.quantity]: vacancy.quantity.toString(),
    [CELL_MAPPING.salaryRange]: vacancy.salaryRange,
    [CELL_MAPPING.confidential]: vacancy.confidential ? "Sim" : "Não",
    [CELL_MAPPING.budgeted]: vacancy.budgeted ? "Sim" : "Não",
    [CELL_MAPPING.headcountIncrease]: vacancy.headcountIncrease ? "Sim" : "Não",
    [CELL_MAPPING.replacedPerson]: vacancy.replacedPerson ?? "",
    [CELL_MAPPING.expectedHireDate]: toExcelDate(vacancy.expectedHireDate),
    [CELL_MAPPING.openedAt]: toExcelDate(vacancy.openedAt),

    // Grupo 3: Configurações da área (campos existentes + migrados de profile/vacancy — GAP-12)
    [CELL_MAPPING.managerName]: settings.managerName ?? "",
    [CELL_MAPPING.godfather]: settings.godfather ?? "",
    [CELL_MAPPING.immediateReport]: settings.immediateReport ?? "",
    [CELL_MAPPING.mediateReport]: settings.mediateReport ?? "",
    [CELL_MAPPING.teamComposition]: settings.teamComposition ?? "",
    // Campos migrados de JobProfile → AreaSettings
    [CELL_MAPPING.englishLevel]: settings.englishLevel ?? "",
    [CELL_MAPPING.spanishLevel]: settings.spanishLevel ?? "",
    [CELL_MAPPING.additionalInfo]: settings.additionalInfo ?? "",
    [CELL_MAPPING.systemsRequired]: settings.systemsRequired ?? "",
    [CELL_MAPPING.networkFolders]: settings.networkFolders ?? "",
    // Campos migrados de Vacancy → AreaSettings
    [CELL_MAPPING.costCenter]: settings.costCenter ?? "",
    [CELL_MAPPING.travelRequired]: (settings.travelRequired ?? false) ? "Sim" : "Não",
    [CELL_MAPPING.workMode]: settings.workMode ?? "",
    [CELL_MAPPING.workScheduleOther]: settings.workSchedule === "Outro"
      ? (settings.workScheduleOther ?? "")
      : "",
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

  // Aplicar checkboxes VML (ctrlProps) — limpar resíduos e marcar opção correta
  applyCheckboxGroups(zip, vacancy, profile, settings);

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
