/**
 * Patch idempotente que corrige o estilo da célula B59 no template.
 * Garante alignment horizontal="left", vertical="top", wrapText="1" para
 * a célula "Informações adicionais" do template de requisição de pessoal.
 *
 * Estratégia: o styleIndex atual de B59 é compartilhado com outras células —
 * por isso cria um novo xf no final de <cellXfs> e atualiza apenas B59 com o novo índice.
 *
 * Idempotente: se o alinhamento já estiver correto, exibe mensagem e sai sem modificar.
 *
 * Uso: npx tsx scripts/patch-template-b59.ts
 */

import AdmZip from "adm-zip";
import path from "path";

const TEMPLATE_PATH = path.join(process.cwd(), "data/templates/requisicao-de-pessoal.xlsx");

const DESIRED_ALIGNMENT = {
  horizontal: "left",
  vertical: "top",
  wrapText: "1",
};

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /(\w[\w:-]*)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function getAlignmentForXf(
  cellXfsContent: string,
  index: number
): Record<string, string> | null {
  const xfRe = /<xf\b([^>]*?)(?:\/>|>([\s\S]*?)<\/xf>)/g;
  let xfIndex = 0;
  let xfMatch: RegExpExecArray | null;

  while ((xfMatch = xfRe.exec(cellXfsContent)) !== null) {
    if (xfIndex === index) {
      const inner = xfMatch[2] ?? "";
      const alignMatch = inner.match(/<alignment\b([^>]*?)\/>/);
      if (!alignMatch) {
        // Verificar se há alignment inline no próprio xf (wrapText etc. às vezes ficam no xf)
        return null;
      }
      return parseAttributes(alignMatch[1]);
    }
    xfIndex++;
  }
  return null;
}

function getFullXfTag(cellXfsContent: string, index: number): string | null {
  const xfRe = /<xf\b([^>]*?)(?:\/>|>([\s\S]*?)<\/xf>)/g;
  let xfIndex = 0;
  let xfMatch: RegExpExecArray | null;

  while ((xfMatch = xfRe.exec(cellXfsContent)) !== null) {
    if (xfIndex === index) {
      return xfMatch[0];
    }
    xfIndex++;
  }
  return null;
}

function countXfs(cellXfsContent: string): number {
  const xfRe = /<xf\b([^>]*?)(?:\/>|>([\s\S]*?)<\/xf>)/g;
  let count = 0;
  while (xfRe.exec(cellXfsContent) !== null) {
    count++;
  }
  return count;
}

function isAlreadyPatched(alignment: Record<string, string> | null): boolean {
  if (!alignment) return false;
  return (
    alignment["horizontal"] === DESIRED_ALIGNMENT.horizontal &&
    alignment["vertical"] === DESIRED_ALIGNMENT.vertical &&
    alignment["wrapText"] === DESIRED_ALIGNMENT.wrapText
  );
}

function buildNewXfWithAlignment(originalXfTag: string): string {
  // Remove o alignment existente (se houver) do conteúdo interno
  // e garante que o xf tenha applyAlignment="1" + novo <alignment>
  let xfTag = originalXfTag;

  // Se for tag vazia <xf .../>, converter para tag com conteúdo
  const isSelfClosing = /^<xf\b[^>]*\/>$/.test(xfTag.trim());

  let xfAttrsStr: string;
  let innerContent: string;

  if (isSelfClosing) {
    const attrMatch = xfTag.match(/^<xf\b(.*?)\/>$/);
    xfAttrsStr = attrMatch ? attrMatch[1] : "";
    innerContent = "";
  } else {
    const fullMatch = xfTag.match(/^<xf\b(.*?)>([\s\S]*?)<\/xf>$/);
    if (!fullMatch) {
      throw new Error("Formato inesperado da tag xf: " + xfTag);
    }
    xfAttrsStr = fullMatch[1];
    innerContent = fullMatch[2];
  }

  // Garantir applyAlignment="1" nos atributos do xf
  if (/applyAlignment="[^"]*"/.test(xfAttrsStr)) {
    xfAttrsStr = xfAttrsStr.replace(/applyAlignment="[^"]*"/, 'applyAlignment="1"');
  } else {
    xfAttrsStr = xfAttrsStr.trimEnd() + ' applyAlignment="1"';
  }

  // Remover alignment existente do conteúdo interno
  innerContent = innerContent.replace(/<alignment\b[^>]*\/>/g, "");

  // Adicionar novo alignment
  const newAlignment = `<alignment horizontal="${DESIRED_ALIGNMENT.horizontal}" vertical="${DESIRED_ALIGNMENT.vertical}" wrapText="${DESIRED_ALIGNMENT.wrapText}"/>`;
  innerContent = innerContent.trimEnd() + "\n        " + newAlignment;

  return `<xf${xfAttrsStr}>${innerContent}\n      </xf>`;
}

function main() {
  const zip = new AdmZip(TEMPLATE_PATH);

  const sheetEntry = zip.getEntry("xl/worksheets/sheet1.xml");
  const stylesEntry = zip.getEntry("xl/styles.xml");

  if (!sheetEntry || !stylesEntry) {
    console.error("Erro: não foi possível encontrar sheet1.xml ou styles.xml no template.");
    process.exit(1);
  }

  let sheetXml = sheetEntry.getData().toString("utf-8");
  let stylesXml = stylesEntry.getData().toString("utf-8");

  // Localizar styleIndex atual de B59
  const cellRe = /<c\s+r="B59"[^>]*>/;
  const cellMatch = sheetXml.match(cellRe);

  if (!cellMatch) {
    console.error("Célula B59 não encontrada em sheet1.xml.");
    process.exit(1);
  }

  const styleMatch = /\bs="(\d+)"/.exec(cellMatch[0]);
  const currentStyleIndex = styleMatch ? parseInt(styleMatch[1], 10) : -1;

  if (currentStyleIndex < 0) {
    console.error("Atributo s= não encontrado na célula B59.");
    process.exit(1);
  }

  // Extrair bloco cellXfs do styles.xml
  const cellXfsMatch = stylesXml.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/);
  if (!cellXfsMatch) {
    console.error("Bloco <cellXfs> não encontrado em styles.xml.");
    process.exit(1);
  }

  const cellXfsContent = cellXfsMatch[1];

  // Verificar estado atual do alignment de B59
  const currentAlignment = getAlignmentForXf(cellXfsContent, currentStyleIndex);

  const beforeState = {
    styleIndex: currentStyleIndex,
    alignment: {
      horizontal: currentAlignment?.["horizontal"] ?? "",
      vertical: currentAlignment?.["vertical"] ?? "",
      wrapText: currentAlignment?.["wrapText"] ?? "",
    },
  };

  // Idempotência: verificar se já está correto
  if (isAlreadyPatched(currentAlignment)) {
    console.log("B59 já está com left/top/wrap — nada a fazer.");
    console.log(JSON.stringify({ before: beforeState, after: beforeState }));
    return;
  }

  // Abordagem (b): criar novo xf — styleIndex 53 é compartilhado com 35+ células
  const originalXfTag = getFullXfTag(cellXfsContent, currentStyleIndex);
  if (!originalXfTag) {
    console.error(`xf de índice ${currentStyleIndex} não encontrado em cellXfs.`);
    process.exit(1);
  }

  // Construir novo xf com alignment correto
  const newXfTag = buildNewXfWithAlignment(originalXfTag);

  // Contar xfs atuais para determinar o novo índice (0-based)
  const xfCount = countXfs(cellXfsContent);
  const newStyleIndex = xfCount; // será o próximo índice (0-based)

  // Inserir novo xf no final do bloco cellXfs e atualizar count
  // Capturar o bloco inteiro <cellXfs count="N">...</cellXfs>
  const cellXfsFullMatch = stylesXml.match(/<cellXfs([^>]*)>([\s\S]*?)<\/cellXfs>/);
  if (!cellXfsFullMatch) {
    console.error("Bloco completo de <cellXfs> não encontrado.");
    process.exit(1);
  }

  let cellXfsAttrs = cellXfsFullMatch[1];
  const cellXfsBody = cellXfsFullMatch[2];

  // Atualizar count
  cellXfsAttrs = cellXfsAttrs.replace(/count="(\d+)"/, (_m, n) => `count="${parseInt(n, 10) + 1}"`);

  // Novo bloco com xf adicional
  const newCellXfsBlock = `<cellXfs${cellXfsAttrs}>${cellXfsBody}      ${newXfTag}\n    </cellXfs>`;
  stylesXml = stylesXml.replace(/<cellXfs[^>]*>[\s\S]*?<\/cellXfs>/, newCellXfsBlock);

  // Atualizar o s= de B59 no sheet1.xml (apenas B59, não globalmente)
  // Usar regex que casa exatamente a tag da célula B59 completa
  sheetXml = sheetXml.replace(
    /<c\s+r="B59"\s+s="\d+"\/>/,
    `<c r="B59" s="${newStyleIndex}"/>`
  );

  // Gravar arquivos modificados no ZIP
  zip.updateFile("xl/styles.xml", Buffer.from(stylesXml, "utf-8"));
  zip.updateFile("xl/worksheets/sheet1.xml", Buffer.from(sheetXml, "utf-8"));
  zip.writeZip(TEMPLATE_PATH);

  const afterState = {
    styleIndex: newStyleIndex,
    alignment: {
      horizontal: DESIRED_ALIGNMENT.horizontal,
      vertical: DESIRED_ALIGNMENT.vertical,
      wrapText: DESIRED_ALIGNMENT.wrapText,
    },
  };

  console.log(JSON.stringify({ before: beforeState, after: afterState }));
}

main();
