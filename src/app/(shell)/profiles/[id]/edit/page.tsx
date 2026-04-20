import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile, updateProfile } from "@/app/actions/profile";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) notFound();

  const submitWithId = updateProfile.bind(null, id);

  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          Editar perfil
        </h1>
        <ProfileForm profile={profile} onSubmitAction={submitWithId} />
      </div>
    </div>
  );
}
