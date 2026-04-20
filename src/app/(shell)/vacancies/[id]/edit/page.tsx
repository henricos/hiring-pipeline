import { notFound } from "next/navigation";
import { VacancyForm } from "@/components/vacancy/vacancy-form";
import { updateVacancy } from "@/app/actions/vacancy";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";

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

  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          Editar vaga
        </h1>
        <VacancyForm
          profiles={profiles}
          vacancy={vacancy}
          onSubmitAction={submitWithId}
        />
      </div>
    </div>
  );
}
