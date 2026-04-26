import { notFound } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import {
  getResearchesByProfileId,
  getVagasForDate,
  getResumoForDate,
} from "@/app/actions/research";
import { ProfileDetailTabs } from "@/components/profile/profile-detail-tabs";

interface ProfileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;

  const profile = await getProfile(id);
  if (!profile) notFound();

  const researches = await getResearchesByProfileId(id);

  // Pré-carregar vagas e resumos de todas as pesquisas no servidor
  const allVagas: Record<string, any[]> = {};
  const researchesWithResumo = await Promise.all(
    researches.map(async (r) => {
      const vagasData = await getVagasForDate(id, r.date);
      if (vagasData?.jobs) allVagas[r.date] = vagasData.jobs;
      const resumoContent = await getResumoForDate(id, r.date);
      return { ...r, resumoContent: resumoContent ?? undefined };
    })
  );

  return (
    <div className="p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          {profile.title}
        </h1>
        <ProfileDetailTabs
          profile={profile}
          researches={researchesWithResumo}
          allVagas={allVagas}
        />
      </div>
    </div>
  );
}
