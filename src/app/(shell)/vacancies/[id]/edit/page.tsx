import { notFound } from "next/navigation";
import { VacancyForm } from "@/components/vacancy/vacancy-form";
import { Button } from "@/components/ui/button";
import { VacancyStatusSelect } from "@/components/vacancy/vacancy-status-select";
import { updateVacancy } from "@/app/actions/vacancy";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";
import { env } from "@/lib/env";
import { normalizeBasePath } from "@/lib/base-path";

interface EditVacancyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVacancyPage({
  params,
}: EditVacancyPageProps) {
  const { id } = await params;

  const [vacancy, profiles] = await Promise.all([
    vacancyRepository.findById(id),
    profileRepository.list(),
  ]);

  if (!vacancy) notFound();

  // Injeta o ID da vaga via bind, seguindo padrão de profiles/[id]/edit/page.tsx
  const submitWithId = updateVacancy.bind(null, id);

  // basePath para links de API que não passam pelo roteador do Next.js
  const basePath = normalizeBasePath(env.APP_BASE_PATH);
  const apiPrefix = basePath === "/" ? "" : basePath;

  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          Editar vaga
        </h1>
        {/* Container visual com fundo sutil — envolve formulário + ações */}
        <div className="bg-surface-container-low rounded-md p-0">
          <VacancyForm
            profiles={profiles}
            vacancy={vacancy}
            backHref="/vacancies"
            onSubmitAction={submitWithId}
          />

          {/* ── Seção de Ações: Status e Formulário GH lado a lado ── */}
          <div className="px-8 pb-8 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/20">
              {/* Card: Status da vaga */}
              <div className="bg-white rounded-md p-6">
                <h2 className="text-base font-medium text-on-surface mb-1">
                  Status da vaga
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Altere o status da vaga conforme o andamento do processo seletivo.
                </p>
                <VacancyStatusSelect vacancyId={id} currentStatus={vacancy.status} />
              </div>

              {/* Card: Formulário GH */}
              <div className="bg-white rounded-md p-6">
                <h2 className="text-base font-medium text-on-surface mb-1">
                  Formulário GH
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Gere o formulário de requisição de pessoal pronto para envio ao GH/Werecruiter.
                </p>
                <Button asChild variant="default">
                  <a
                    href={`${apiPrefix}/api/vacancies/${vacancy.id}/form`}
                    download
                  >
                    Gerar formulário GH
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
