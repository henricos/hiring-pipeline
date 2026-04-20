import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/settings-form";
import { updateSettings } from "@/app/actions/settings";
import { settingsRepository } from "@/lib/repositories/settings-repository";

async function SettingsFormContent() {
  const settings = await settingsRepository.get();

  return <SettingsForm initialSettings={settings} onSubmitAction={updateSettings} />;
}

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-[1.5rem] font-medium tracking-tight text-on-surface mb-4">
          Configurações da Área
        </h1>
        <p className="text-[0.875rem] text-on-surface/70 mb-8">
          Preencha os dados comuns a todas as vagas. Serão usados automaticamente
          ao gerar o formulário GH.
        </p>
        <Suspense fallback={<div>Carregando configurações...</div>}>
          <SettingsFormContent />
        </Suspense>
      </div>
    </div>
  );
}
