import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { ensureSubdir } from "@/lib/data-service";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";
import { settingsRepository } from "@/lib/repositories/settings-repository";
import { generateVacancyForm } from "@/lib/excel-generator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Autenticar usuário (single-user auth via next-auth)
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Obter ID da vaga dos params
    const { id } = await params;

    // 3. Buscar vaga e configurações em paralelo
    const [vacancy, settings] = await Promise.all([
      vacancyRepository.findById(id),
      settingsRepository.get(),
    ]);

    if (!vacancy) {
      return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
    }

    // 4. Buscar perfil vinculado à vaga (obrigatório para geração do Excel)
    const profile = await profileRepository.findById(vacancy.profileId);
    if (!profile) {
      return NextResponse.json(
        { error: "Perfil associado à vaga não encontrado" },
        { status: 404 }
      );
    }

    // 5. Montar caminhos (por D-07, D-08: template em templates/, saída em forms/)
    const formsDir = ensureSubdir("forms");
    const outputPath = path.join(formsDir, `${id}-requisicao.xlsx`);
    const templatePath = path.join(
      env.DATA_PATH,
      "templates",
      "requisicao-de-pessoal.xlsx"
    );

    // 6. Verificar regeneração forçada via query param (por D-09, D-10)
    const url = new URL(req.url);
    const forceRegen = url.searchParams.get("regen") === "1";

    // 7. Gerar Excel se não estiver em cache OU se regeneração forçada solicitada
    if (!fs.existsSync(outputPath) || forceRegen) {
      generateVacancyForm(templatePath, outputPath, vacancy, profile, settings);
    }

    // 8. Verificar que o arquivo foi gerado e servir como download
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: "Falha ao gerar formulário Excel. Verifique os dados da vaga." },
        { status: 500 }
      );
    }

    const buffer = fs.readFileSync(outputPath);
    const titleSlug = (profile.title ?? vacancy.id)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const filename = `requisicao-${titleSlug}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating vacancy form:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao gerar formulário";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
