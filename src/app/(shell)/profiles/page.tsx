import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileList } from "@/components/profile/profile-list";
import { listProfiles } from "@/app/actions/profile";

async function ProfilesContent() {
  const profiles = await listProfiles();
  return <ProfileList profiles={profiles} />;
}

export default function ProfilesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface">
          Perfis de Vaga
        </h1>
        <Link href="/profiles/new">
          <Button className="gradient-cta text-on-tertiary font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all">
            Novo perfil
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="text-[0.875rem] text-on-surface/50">Carregando...</div>}>
        <ProfilesContent />
      </Suspense>
    </div>
  );
}
