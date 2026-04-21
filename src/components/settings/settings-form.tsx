"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AreaSettings } from "@/lib/settings";
import { LANGUAGE_LEVELS } from "@/lib/profile";
import type { LanguageLevel } from "@/lib/profile";
import { WORK_MODES, WORK_SCHEDULES } from "@/lib/vacancy";
import type { WorkMode, WorkSchedule } from "@/lib/vacancy";

type ActionState = { error?: string; success?: boolean } | null;

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
  ) => Promise<ActionState | void>;
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

  const [showSuccess, setShowSuccess] = useState(false);
  const prevStateRef = useRef<ActionState>(null);
  useEffect(() => {
    if (state !== prevStateRef.current && state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      prevStateRef.current = state;
      return () => clearTimeout(timer);
    }
    prevStateRef.current = state ?? null;
  }, [state]);

  // Estados controlados para selects dos campos migrados (GAP-12)
  const [englishLevel, setEnglishLevel] = useState<LanguageLevel>(
    initialSettings.englishLevel ?? "Não exigido"
  );
  const [spanishLevel, setSpanishLevel] = useState<LanguageLevel>(
    initialSettings.spanishLevel ?? "Não exigido"
  );
  const [otherLanguageLevel, setOtherLanguageLevel] = useState(
    initialSettings.otherLanguageLevel ?? ""
  );
  const [workMode, setWorkMode] = useState<WorkMode>(
    initialSettings.workMode ?? "Presencial"
  );
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(
    initialSettings.workSchedule ?? "Das 08h às 17h"
  );
  const [workScheduleOther, setWorkScheduleOther] = useState(
    initialSettings.workScheduleOther ?? ""
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

          {/* Centro de custo */}
          <div className="space-y-1.5">
            <Label htmlFor="costCenter" className={LABEL_CLASS}>
              Centro de custo
            </Label>
            <Input
              id="costCenter"
              name="costCenter"
              defaultValue={initialSettings.costCenter ?? ""}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* ── Seção 2: Idiomas (migrado de JobProfile — GAP-12) ─── */}
        <h2 className={SECTION_HEADING_CLASS}>Idiomas</h2>
        <div className="space-y-4">
          {/* Inglês */}
          <div className="space-y-1.5">
            <Label htmlFor="englishLevel" className={LABEL_CLASS}>
              Inglês
            </Label>
            <input type="hidden" name="englishLevel" value={englishLevel} />
            <Select value={englishLevel} onValueChange={(v) => setEnglishLevel(v as LanguageLevel)}>
              <SelectTrigger id="englishLevel" className={`w-full ${INPUT_CLASS}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Espanhol */}
          <div className="space-y-1.5">
            <Label htmlFor="spanishLevel" className={LABEL_CLASS}>
              Espanhol
            </Label>
            <input type="hidden" name="spanishLevel" value={spanishLevel} />
            <Select value={spanishLevel} onValueChange={(v) => setSpanishLevel(v as LanguageLevel)}>
              <SelectTrigger id="spanishLevel" className={`w-full ${INPUT_CLASS}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outro idioma */}
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="otherLanguage" className={LABEL_CLASS}>
                Outro idioma
              </Label>
              <Input
                id="otherLanguage"
                name="otherLanguage"
                placeholder="Nome do idioma"
                defaultValue={initialSettings.otherLanguage ?? ""}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="otherLanguageLevel" className={LABEL_CLASS}>
                Nível
              </Label>
              <input
                type="hidden"
                name="otherLanguageLevel"
                value={otherLanguageLevel}
              />
              <Select
                value={otherLanguageLevel}
                onValueChange={setOtherLanguageLevel}
              >
                <SelectTrigger
                  id="otherLanguageLevel"
                  className={`w-full ${INPUT_CLASS}`}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Seção 3: Infraestrutura (migrado de JobProfile — GAP-12) ── */}
        <h2 className={SECTION_HEADING_CLASS}>Infraestrutura</h2>
        <div className="space-y-4">
          {/* Sistemas necessários */}
          <div className="space-y-1.5">
            <Label htmlFor="systemsRequired" className={LABEL_CLASS}>
              Sistemas necessários
            </Label>
            <Textarea
              id="systemsRequired"
              name="systemsRequired"
              defaultValue={initialSettings.systemsRequired ?? ""}
              className={`${INPUT_CLASS} min-h-[80px] resize-y`}
            />
          </div>

          {/* Pastas de rede */}
          <div className="space-y-1.5">
            <Label htmlFor="networkFolders" className={LABEL_CLASS}>
              Pastas de rede
            </Label>
            <Textarea
              id="networkFolders"
              name="networkFolders"
              defaultValue={initialSettings.networkFolders ?? ""}
              className={`${INPUT_CLASS} min-h-[80px] resize-y`}
            />
          </div>
        </div>

        {/* ── Seção 4: Dados Fixos da Vaga (migrado de Vacancy — GAP-12) ── */}
        <h2 className={SECTION_HEADING_CLASS}>Dados Fixos da Vaga</h2>
        <div className="space-y-4">
          {/* Modalidade */}
          <div className="space-y-1.5">
            <Label htmlFor="workMode" className={LABEL_CLASS}>
              Modalidade
            </Label>
            <input type="hidden" name="workMode" value={workMode} />
            <Select value={workMode} onValueChange={(v) => setWorkMode(v as WorkMode)}>
              <SelectTrigger id="workMode" className={`w-full ${INPUT_CLASS}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horário de trabalho */}
          <div className="space-y-1.5">
            <Label htmlFor="workSchedule" className={LABEL_CLASS}>
              Horário de trabalho
            </Label>
            <input type="hidden" name="workSchedule" value={workSchedule} />
            <Select value={workSchedule} onValueChange={(v) => setWorkSchedule(v as WorkSchedule)}>
              <SelectTrigger id="workSchedule" className={`w-full ${INPUT_CLASS}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_SCHEDULES.map((schedule) => (
                  <SelectItem key={schedule} value={schedule}>
                    {schedule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional: texto livre quando workSchedule === "Outro" */}
          {workSchedule === "Outro" && (
            <div className="space-y-1.5 ml-6 transition-all duration-150">
              <Label htmlFor="workScheduleOther" className={LABEL_CLASS}>
                Descrever horário de trabalho
              </Label>
              <Input
                id="workScheduleOther"
                name="workScheduleOther"
                value={workScheduleOther}
                onChange={(e) => setWorkScheduleOther(e.target.value)}
                placeholder="Ex: Das 07h30 às 16h30"
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Disponibilidade para viagens */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="travelRequired"
              value="true"
              defaultChecked={initialSettings.travelRequired ?? false}
              className="w-4 h-4 rounded-sm accent-tertiary"
            />
            <span className="text-[0.875rem] text-on-surface">
              Disponibilidade para viagens
            </span>
          </label>

          {/* Informações complementares */}
          <div className="space-y-1.5">
            <Label htmlFor="additionalInfo" className={LABEL_CLASS}>
              Informações complementares
            </Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              defaultValue={initialSettings.additionalInfo ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>
        </div>

        {/* ── Seção 5: Instruções para IA ────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Instruções para IA</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="aiProfileInstructions" className={LABEL_CLASS}>
              Instruções para IA montar perfil
            </Label>
            <p className="text-[0.6875rem] text-on-surface/50">
              Descreva o contexto da área, produtos, linguagem preferida e o que
              priorizar em candidatos. A IA usará estas instruções ao sugerir perfis.
            </p>
            <Textarea
              id="aiProfileInstructions"
              name="aiProfileInstructions"
              defaultValue={initialSettings.aiProfileInstructions ?? ""}
              placeholder="Ex: Área de P&D focada em produtos educacionais para o ensino superior. Priorizar candidatos com experiência em EdTech ou ambientes acadêmicos..."
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>
        </div>

        {/* ── Feedback ───────────────────────────────────────────── */}
        {state?.error && (
          <div className="flex items-center gap-3 p-3 mt-6 bg-destructive/8 rounded-sm border border-destructive/25">
            <p className="text-[0.75rem] font-medium text-destructive">
              {state.error}
            </p>
          </div>
        )}
        {showSuccess && (
          <div className="p-3 mt-6 rounded-sm border border-emerald-200 bg-emerald-50">
            <p className="text-[0.75rem] font-medium text-emerald-700">
              Configurações salvas com sucesso.
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
