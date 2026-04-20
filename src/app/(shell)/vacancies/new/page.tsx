import { Suspense } from "react";
import { VacancyForm } from "@/components/vacancy/vacancy-form";
import { createVacancy } from "@/app/actions/vacancy";
import { profileRepository } from "@/lib/repositories/profile-repository";

async function NewVacancyForm() {
  const profiles = await profileRepository.list();

  return <VacancyForm profiles={profiles} onSubmitAction={createVacancy} />;
}

export default function NewVacancyPage() {
  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          Abrir nova vaga
        </h1>
        <Suspense fallback={<div>Carregando formulário...</div>}>
          <NewVacancyForm />
        </Suspense>
      </div>
    </div>
  );
}
