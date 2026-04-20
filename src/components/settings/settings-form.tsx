"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AreaSettings } from "@/lib/settings";

type ActionState = { error?: string } | null;

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";

interface SettingsFormProps {
  initialSettings: AreaSettings;
  onSubmitAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<{ error?: string } | void>;
}

export function SettingsForm({
  initialSettings,
  onSubmitAction,
}: SettingsFormProps) {
  const [state, submitAction, isPending] = useActionState(
    (prevState: ActionState | void, formData: FormData) =>
      onSubmitAction((prevState ?? null) as ActionState, formData),
    null
  );

  return (
    <div className="bg-white rounded-md px-8 py-8 max-w-3xl">
      <form action={submitAction} className="space-y-0">
        {/* ── Seção 1: Dados da Área ─────────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Dados da Área</h2>
        <div className="space-y-4">
          {/* Nome do gestor */}
          <div className="space-y-1.5">
            <Label htmlFor="managerName" className={LABEL_CLASS}>
              Nome do gestor (solicitante)
            </Label>
            <Input
              id="managerName"
              name="managerName"
              defaultValue={initialSettings.managerName}
              className={INPUT_CLASS}
            />
          </div>

          {/* Nome do padrinho */}
          <div className="space-y-1.5">
            <Label htmlFor="godfather" className={LABEL_CLASS}>
              Nome do padrinho
            </Label>
            <Input
              id="godfather"
              name="godfather"
              defaultValue={initialSettings.godfather}
              className={INPUT_CLASS}
            />
          </div>

          {/* Reporte imediato */}
          <div className="space-y-1.5">
            <Label htmlFor="immediateReport" className={LABEL_CLASS}>
              Reporte imediato
            </Label>
            <Input
              id="immediateReport"
              name="immediateReport"
              defaultValue={initialSettings.immediateReport}
              className={INPUT_CLASS}
            />
          </div>

          {/* Reporte mediato */}
          <div className="space-y-1.5">
            <Label htmlFor="mediateReport" className={LABEL_CLASS}>
              Reporte mediato
            </Label>
            <Input
              id="mediateReport"
              name="mediateReport"
              defaultValue={initialSettings.mediateReport}
              className={INPUT_CLASS}
            />
          </div>

          {/* Composição da equipe */}
          <div className="space-y-1.5">
            <Label htmlFor="teamComposition" className={LABEL_CLASS}>
              Composição da equipe
            </Label>
            <p className="text-[0.6875rem] text-on-surface/50">
              Estrutura da área e quantidade de pessoas por cargo.
            </p>
            <Textarea
              id="teamComposition"
              name="teamComposition"
              defaultValue={initialSettings.teamComposition}
              placeholder="Ex: 5 desenvolvedores, 1 QA, 1 product manager"
              className={`${INPUT_CLASS} min-h-[100px] resize-y`}
            />
          </div>
        </div>

        {/* ── Erro de server action ──────────────────────────────── */}
        {state?.error && (
          <div className="flex items-center gap-3 p-3 mt-6 bg-destructive/8 rounded-sm border border-destructive/25">
            <p className="text-[0.75rem] font-medium text-destructive">
              {state.error}
            </p>
          </div>
        )}

        {/* ── Botão Salvar ───────────────────────────────────────── */}
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            disabled={isPending}
            className="gradient-cta text-on-tertiary px-6 py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {isPending ? "Salvando…" : "Salvar configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
