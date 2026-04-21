"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vacancy, RequestType } from "@/lib/vacancy";
import { REQUEST_TYPES } from "@/lib/vacancy";
import type { JobProfile } from "@/lib/profile";

type ActionState = { error?: string; success?: boolean } | null;

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";

interface VacancyFormProps {
  profiles: JobProfile[];
  vacancy?: Vacancy;
  backHref?: string;
  onSubmitAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState | void>;
}

export function VacancyForm({
  profiles,
  vacancy,
  backHref,
  onSubmitAction,
}: VacancyFormProps) {
  const router = useRouter();

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

  // Campos controlados (selects + condicionais)
  const [selectedProfileId, setSelectedProfileId] = useState(
    vacancy?.profileId ?? ""
  );
  const [requestType, setRequestType] = useState<RequestType>(
    vacancy?.requestType ?? "Recrutamento externo"
  );

  // Campo condicional: nome do substituído aparece quando headcountIncrease=false
  const [headcountIncrease, setHeadcountIncrease] = useState(
    vacancy?.headcountIncrease ?? false
  );

  return (
    <div className="bg-white rounded-md px-8 py-8 w-full">
      <form action={submitAction} className="space-y-0">
        {/* ── Seção 1: Perfil da Vaga ────────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Perfil da Vaga</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profileId" className={LABEL_CLASS}>
              Selecione um perfil
            </Label>
            <input type="hidden" name="profileId" value={selectedProfileId} />
            <Select
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
            >
              <SelectTrigger
                id="profileId"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue placeholder="Escolha um perfil existente" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Seção 2: Dados da Vaga ─────────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Dados da Vaga</h2>
        <div className="space-y-4">
          {/* Tipo de requisição */}
          <div className="space-y-1.5">
            <Label htmlFor="requestType" className={LABEL_CLASS}>
              Tipo de requisição
            </Label>
            <input type="hidden" name="requestType" value={requestType} />
            <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
              <SelectTrigger
                id="requestType"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade de vagas */}
          <div className="space-y-1.5">
            <Label htmlFor="quantity" className={LABEL_CLASS}>
              Quantidade de vagas
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={vacancy?.quantity ?? 1}
              className={INPUT_CLASS}
            />
          </div>

          {/* Faixa salarial — costCenter migrado para Configurações da Área (GAP-12) */}
          <div className="space-y-1.5">
            <Label htmlFor="salaryRange" className={LABEL_CLASS}>
              Faixa salarial
            </Label>
            <Input
              id="salaryRange"
              name="salaryRange"
              defaultValue={vacancy?.salaryRange ?? ""}
              className={INPUT_CLASS}
            />
          </div>

          {/* Checkboxes: Confidencial, Orçada */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="confidential"
                value="true"
                defaultChecked={vacancy?.confidential ?? false}
                className="w-4 h-4 rounded-sm accent-tertiary"
              />
              <span className="text-[0.875rem] text-on-surface">
                Vaga confidencial
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="budgeted"
                value="true"
                defaultChecked={vacancy?.budgeted ?? true}
                className="w-4 h-4 rounded-sm accent-tertiary"
              />
              <span className="text-[0.875rem] text-on-surface">
                Vaga orçada
              </span>
            </label>

            {/* Checkbox controlado: aumento de quadro — inline com campo de substituição */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  name="headcountIncrease"
                  value="true"
                  checked={headcountIncrease}
                  onChange={(e) => setHeadcountIncrease(e.target.checked)}
                  className="w-4 h-4 rounded-sm accent-tertiary"
                />
                <span className="text-[0.875rem] text-on-surface">
                  Aumento de quadro
                </span>
              </label>
              {!headcountIncrease && (
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60 shrink-0">
                    Substitui
                  </span>
                  <Input
                    id="replacedPerson"
                    name="replacedPerson"
                    required
                    defaultValue={vacancy?.replacedPerson ?? ""}
                    className={`flex-1 ${INPUT_CLASS}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Data prevista de contratação — workSchedule, workMode, travelRequired migrados para Configurações da Área (GAP-12) */}
          <div className="space-y-1.5">
            <Label htmlFor="expectedHireDate" className={LABEL_CLASS}>
              Data prevista de contratação
            </Label>
            <Input
              id="expectedHireDate"
              name="expectedHireDate"
              type="date"
              defaultValue={vacancy?.expectedHireDate ?? ""}
              className={INPUT_CLASS}
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
              Vaga salva com sucesso.
            </p>
          </div>
        )}

        {/* ── Botões de ação ─────────────────────────────────────── */}
        <div className="flex justify-end gap-3 mt-8">
          {backHref ? (
            <Button asChild variant="outline" disabled={isPending} className="rounded-sm">
              <Link href={backHref}>Voltar</Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="rounded-sm"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="gradient-cta text-on-tertiary px-6 py-3 font-semibold text-[0.875rem] rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {isPending ? "Salvando…" : "Salvar vaga"}
          </Button>
        </div>
      </form>
    </div>
  );
}
