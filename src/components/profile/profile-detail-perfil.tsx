"use client";

import { Badge } from "@/components/ui/badge";
import type { JobProfile } from "@/lib/profile";

const SECTION_HEADING_CLASS =
  "text-[1.125rem] font-medium text-on-surface mt-8 mb-4";

interface ProfileDetailPerfilProps {
  profile: JobProfile;
}

export function ProfileDetailPerfil({ profile }: ProfileDetailPerfilProps) {
  const handleEditClick = () => {
    window.location.assign(`/profiles/${profile.id}/edit`);
  };

  return (
    <div className="space-y-8">
      {/* Header com título e botão Editar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.5rem] font-medium tracking-tight text-on-surface">
            {profile.title}
          </h2>
          <p className="text-body-md text-on-surface/70 mt-1">
            {profile.suggestedTitle}
          </p>
        </div>
        <button
          onClick={handleEditClick}
          className="text-body-md font-medium text-tertiary hover:underline"
        >
          Editar
        </button>
      </div>

      {/* Responsabilidades */}
      {profile.responsibilities.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Responsabilidades</h3>
          <ul className="space-y-2">
            {profile.responsibilities.map((item, idx) => (
              <li
                key={idx}
                className="text-body-md text-on-surface flex gap-3"
              >
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Qualificações com badges */}
      {profile.qualifications.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Qualificações</h3>
          <div className="space-y-2">
            {profile.qualifications.map((qual, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge
                  variant={qual.required ? "default" : "outline"}
                  className="shrink-0 mt-0.5"
                >
                  {qual.required ? "Obrigatório" : "Desejável"}
                </Badge>
                <span className="text-body-md text-on-surface">
                  {qual.text}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências Comportamentais */}
      {profile.behaviors.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>
            Competências Comportamentais
          </h3>
          <ul className="space-y-2">
            {profile.behaviors.map((item, idx) => (
              <li
                key={idx}
                className="text-body-md text-on-surface flex gap-3"
              >
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desafios */}
      {profile.challenges.length > 0 && (
        <section>
          <h3 className={SECTION_HEADING_CLASS}>Desafios</h3>
          <ul className="space-y-2">
            {profile.challenges.map((item, idx) => (
              <li
                key={idx}
                className="text-body-md text-on-surface flex gap-3"
              >
                <span className="shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
