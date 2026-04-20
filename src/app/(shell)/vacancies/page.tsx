import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VacancyList } from "@/components/vacancy/vacancy-list";
import { vacancyRepository } from "@/lib/repositories/vacancy-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";

async function VacanciesContent() {
  const [vacancies, profiles] = await Promise.all([
    vacancyRepository.list(),
    profileRepository.list(),
  ]);

  // Constrói mapa para lookup eficiente do título do perfil
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return <VacancyList vacancies={vacancies} profiles={profileMap} />;
}

export default function VacanciesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface">
          Vagas
        </h1>
        <Link href="/vacancies/new">
          <Button className="gradient-cta text-on-tertiary font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all">
            Nova vaga
          </Button>
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="text-[0.875rem] text-on-surface/50">
            Carregando...
          </div>
        }
      >
        <VacanciesContent />
      </Suspense>
    </div>
  );
}
