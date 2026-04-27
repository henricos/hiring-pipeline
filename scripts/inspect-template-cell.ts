/**
 * Utilitário de leitura de styles/alignment de uma célula do template.
 * Usado em verificações de Phase 9 Item 1 e em troubleshooting futuro.
 *
 * Uso: npx tsx scripts/inspect-template-cell.ts <endereço-de-célula>
 * Exemplo: npx tsx scripts/inspect-template-cell.ts B59
 *
 * Saída: JSON com styleIndex e atributos de alignment da célula solicitada.
 * Script é read-only — não modifica nenhum arquivo.
 */

import AdmZip from "adm-zip";
import path from "path";

const TEMPLATE_PATH = path.join(process.cwd(), "data/templates/requisicao-de-pessoal.xlsx");

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Captura atributos no formato key="value"
  const re = /(\w[\w:-]*)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function extractNthXf(stylesXml: string, index: number): Record<string, string> {
  // Localiza bloco <cellXfs ...> ... </cellXfs>
  const cellXfsMatch = stylesXml.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/);
  if (!cellXfsMatch) return {};

  const cellXfsContent = cellXfsMatch[1];

  // Coleta todas as tags <xf ...> (com ou sem filhos)
  const xfRe = /<xf\b([^>]*?)(?:\/>|>([\s\S]*?)<\/xf>)/g;
  let xfIndex = 0;
  let xfMatch: RegExpExecArray | null;

  while ((xfMatch = xfRe.exec(cellXfsContent)) !== null) {
    if (xfIndex === index) {
      const xfAttrs = parseAttributes(xfMatch[1]);
      // Procurar <alignment ...> dentro do xf (se houver conteúdo filho)
      const inner = xfMatch[2] ?? "";
      const alignMatch = inner.match(/<alignment\b([^>]*?)\/>/);
      const alignment: Record<string, string> = {};
      if (alignMatch) {
        const alignAttrs = parseAttributes(alignMatch[1]);
        alignment.horizontal = alignAttrs["horizontal"] ?? "";
        alignment.vertical = alignAttrs["vertical"] ?? "";
        alignment.wrapText = alignAttrs["wrapText"] ?? "";
      }
      return {
        applyAlignment: xfAttrs["applyAlignment"] ?? "",
        ...alignment,
      };
    }
    xfIndex++;
  }

  return {};
}

function main() {
  const cellAddr = process.argv[2];

  if (!cellAddr) {
    console.error("Uso: npx tsx scripts/inspect-template-cell.ts <endereço-de-célula>");
    console.error("Exemplo: npx tsx scripts/inspect-template-cell.ts B59");
    process.exit(1);
  }

  const zip = new AdmZip(TEMPLATE_PATH);

  const sheetEntry = zip.getEntry("xl/worksheets/sheet1.xml");
  const stylesEntry = zip.getEntry("xl/styles.xml");

  if (!sheetEntry || !stylesEntry) {
    console.error("Erro: não foi possível encontrar sheet1.xml ou styles.xml no template.");
    process.exit(1);
  }

  const sheetXml = sheetEntry.getData().toString("utf-8");
  const stylesXml = stylesEntry.getData().toString("utf-8");

  // Localizar a tag <c r="ADDR" ... s="N" ...> no sheet
  const cellRe = new RegExp(`<c\\s+r="${cellAddr}"[^>]*>`);
  const cellMatch = sheetXml.match(cellRe);

  if (!cellMatch) {
    console.error(`Célula ${cellAddr} não encontrada em sheet1.xml.`);
    process.exit(1);
  }

  const cellTag = cellMatch[0];
  const styleMatch = /\bs="(\d+)"/.exec(cellTag);
  const styleIndex = styleMatch ? parseInt(styleMatch[1], 10) : -1;

  // Extrair atributos do xf correspondente em styles.xml
  const xfInfo = styleIndex >= 0 ? extractNthXf(stylesXml, styleIndex) : {};

  const result = {
    cell: cellAddr,
    styleIndex,
    alignment: {
      horizontal: xfInfo["horizontal"] ?? "",
      vertical: xfInfo["vertical"] ?? "",
      wrapText: xfInfo["wrapText"] ?? "",
    },
    applyAlignment: xfInfo["applyAlignment"] ?? "",
  };

  console.log(JSON.stringify(result));
}

main();
