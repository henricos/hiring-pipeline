import { ProfileForm } from "@/components/profile/profile-form";
import { createProfile } from "@/app/actions/profile";

export default function NewProfilePage() {
  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-8">
          Novo perfil
        </h1>
        <ProfileForm onSubmitAction={createProfile} />
      </div>
    </div>
  );
}
