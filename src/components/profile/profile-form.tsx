"use client";

import { useState } from "react";
import { useActionState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type { JobProfile } from "@/lib/profile";
import {
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  POST_GRADUATE_LEVELS,
  CERTIFICATION_LEVELS,
  LANGUAGE_LEVELS,
} from "@/lib/profile";

type ActionState = { error?: string } | null;

interface ProfileFormProps {
  profile?: JobProfile;
  onSubmitAction: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<{ error?: string } | void>;
}

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";
const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";

export function ProfileForm({ profile, onSubmitAction }: ProfileFormProps) {
  const [state, submitAction, isPending] = useActionState(
    (prevState: ActionState | void, formData: FormData) =>
      onSubmitAction((prevState ?? null) as ActionState, formData),
    null
  );

  // Campos condicionais — estados controlados
  const [educationLevel, setEducationLevel] = useState(
    profile?.educationLevel ?? ""
  );
  const showEducationCourse =
    educationLevel === "Superior cursando" ||
    educationLevel === "Superior completo";

  const [postGraduateLevel, setPostGraduateLevel] = useState(
    profile?.postGraduateLevel ?? ""
  );
  const showPostGraduateCourse =
    postGraduateLevel === "Desejável" || postGraduateLevel === "Necessário";

  const [certifications, setCertifications] = useState(
    profile?.certifications ?? ""
  );
  const showCertificationsWhich =
    certifications === "Desejável" || certifications === "Sim";

  // Selects sem condicional — estados controlados para hidden inputs
  const [experienceLevel, setExperienceLevel] = useState(
    profile?.experienceLevel ?? ""
  );
  const [englishLevel, setEnglishLevel] = useState(
    profile?.englishLevel ?? ""
  );
  const [spanishLevel, setSpanishLevel] = useState(
    profile?.spanishLevel ?? ""
  );
  const [otherLanguageLevel, setOtherLanguageLevel] = useState(
    profile?.otherLanguageLevel ?? ""
  );

  return (
    <div className="bg-white rounded-md px-8 py-8 max-w-3xl">
      <form action={submitAction} className="space-y-0">
        {/* ── Seção 1: Identificação ─────────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Identificação</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className={LABEL_CLASS}>
              Título do cargo
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={profile?.title ?? ""}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="suggestedTitle" className={LABEL_CLASS}>
              Cargo sugerido para anúncio
            </Label>
            <Input
              id="suggestedTitle"
              name="suggestedTitle"
              required
              defaultValue={profile?.suggestedTitle ?? ""}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {/* ── Seção 2: Requisitos do Candidato ──────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Requisitos do Candidato</h2>
        <div className="space-y-4">
          {/* Tempo de experiência */}
          <div className="space-y-1.5">
            <Label htmlFor="experienceLevel" className={LABEL_CLASS}>
              Tempo de experiência
            </Label>
            <input type="hidden" name="experienceLevel" value={experienceLevel} />
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger
                id="experienceLevel"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nível de escolaridade */}
          <div className="space-y-1.5">
            <Label htmlFor="educationLevel" className={LABEL_CLASS}>
              Nível de escolaridade
            </Label>
            <input type="hidden" name="educationLevel" value={educationLevel} />
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger
                id="educationLevel"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional: curso de escolaridade */}
          {showEducationCourse && (
            <div className="space-y-1.5 transition-all duration-150">
              <Label htmlFor="educationCourse" className={LABEL_CLASS}>
                Curso
              </Label>
              <Input
                id="educationCourse"
                name="educationCourse"
                defaultValue={profile?.educationCourse ?? ""}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Pós-graduação */}
          <div className="space-y-1.5">
            <Label htmlFor="postGraduateLevel" className={LABEL_CLASS}>
              Pós-graduação
            </Label>
            <input
              type="hidden"
              name="postGraduateLevel"
              value={postGraduateLevel}
            />
            <Select
              value={postGraduateLevel}
              onValueChange={setPostGraduateLevel}
            >
              <SelectTrigger
                id="postGraduateLevel"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {POST_GRADUATE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional: curso de pós-graduação */}
          {showPostGraduateCourse && (
            <div className="space-y-1.5 transition-all duration-150">
              <Label htmlFor="postGraduateCourse" className={LABEL_CLASS}>
                Curso de pós-graduação
              </Label>
              <Input
                id="postGraduateCourse"
                name="postGraduateCourse"
                defaultValue={profile?.postGraduateCourse ?? ""}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Certificações */}
          <div className="space-y-1.5">
            <Label htmlFor="certifications" className={LABEL_CLASS}>
              Certificações
            </Label>
            <input
              type="hidden"
              name="certifications"
              value={certifications}
            />
            <Select value={certifications} onValueChange={setCertifications}>
              <SelectTrigger
                id="certifications"
                className={`w-full ${INPUT_CLASS}`}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional: quais certificações */}
          {showCertificationsWhich && (
            <div className="space-y-1.5 transition-all duration-150">
              <Label htmlFor="certificationsWhich" className={LABEL_CLASS}>
                Quais certificações
              </Label>
              <Input
                id="certificationsWhich"
                name="certificationsWhich"
                defaultValue={profile?.certificationsWhich ?? ""}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Inglês */}
          <div className="space-y-1.5">
            <Label htmlFor="englishLevel" className={LABEL_CLASS}>
              Inglês
            </Label>
            <input type="hidden" name="englishLevel" value={englishLevel} />
            <Select value={englishLevel} onValueChange={setEnglishLevel}>
              <SelectTrigger
                id="englishLevel"
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

          {/* Espanhol */}
          <div className="space-y-1.5">
            <Label htmlFor="spanishLevel" className={LABEL_CLASS}>
              Espanhol
            </Label>
            <input type="hidden" name="spanishLevel" value={spanishLevel} />
            <Select value={spanishLevel} onValueChange={setSpanishLevel}>
              <SelectTrigger
                id="spanishLevel"
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

          {/* Outro idioma (sempre visível — campos opcionais) */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="otherLanguage" className={LABEL_CLASS}>
                Outro idioma
              </Label>
              <Input
                id="otherLanguage"
                name="otherLanguage"
                placeholder="Nome do idioma"
                defaultValue={profile?.otherLanguage ?? ""}
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

        {/* ── Seção 3: Conteúdo Descritivo ──────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Conteúdo Descritivo</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="responsibilities" className={LABEL_CLASS}>
              Responsabilidades e atribuições
            </Label>
            <Textarea
              id="responsibilities"
              name="responsibilities"
              required
              defaultValue={profile?.responsibilities ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qualifications" className={LABEL_CLASS}>
              Requisitos e qualificações
            </Label>
            <Textarea
              id="qualifications"
              name="qualifications"
              required
              defaultValue={profile?.qualifications ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="behaviors" className={LABEL_CLASS}>
              Características e competências comportamentais
            </Label>
            <Textarea
              id="behaviors"
              name="behaviors"
              required
              defaultValue={profile?.behaviors ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="challenges" className={LABEL_CLASS}>
              Principais desafios
            </Label>
            <Textarea
              id="challenges"
              name="challenges"
              required
              defaultValue={profile?.challenges ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="additionalInfo" className={LABEL_CLASS}>
              Informações complementares
            </Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              required
              defaultValue={profile?.additionalInfo ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
            />
          </div>
        </div>

        {/* ── Seção 4: Infraestrutura ────────────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Infraestrutura</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="systemsRequired" className={LABEL_CLASS}>
              Sistemas necessários
            </Label>
            <Textarea
              id="systemsRequired"
              name="systemsRequired"
              defaultValue={profile?.systemsRequired ?? ""}
              className={`${INPUT_CLASS} min-h-[80px] resize-y`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="networkFolders" className={LABEL_CLASS}>
              Pastas de rede
            </Label>
            <Textarea
              id="networkFolders"
              name="networkFolders"
              defaultValue={profile?.networkFolders ?? ""}
              className={`${INPUT_CLASS} min-h-[80px] resize-y`}
            />
          </div>
        </div>

        {/* ── Seção 5: Observações Internas ─────────────────────── */}
        <h2 className={SECTION_HEADING_CLASS}>Observações Internas</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes" className={LABEL_CLASS}>
              Observações internas
            </Label>
            <p className="text-[0.6875rem] text-on-surface/50">
              Anotações internas — não publicadas externamente.
            </p>
            <Textarea
              id="internalNotes"
              name="internalNotes"
              defaultValue={profile?.internalNotes ?? ""}
              className={`${INPUT_CLASS} min-h-[120px] resize-y`}
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
            {isPending ? "Salvando…" : "Salvar perfil"}
          </Button>
        </div>
      </form>
    </div>
  );
}
