"use client";

import type { Research } from "@/lib/repositories/research-repository";

interface Job {
  title: string;
  company: string;
  companySize?: string;
  stack?: string[];
  snippet?: string;
  salaryRange?: { min: number; max: number } | null;
}

interface ProfileDetailVagasProps {
  researches: Research[];
  allVagas: Record<string, Job[]>;
}

/**
 * D-32..D-34 (Phase 9 / Item 7): UI read-only da pesquisa mais recente.
 * Switcher de pesquisa (estado selectedDate + <select>) removido.
 * Histórico permanece persistido no repo montado em /data (D-35).
 */
export function ProfileDetailVagas({
  researches,
  allVagas,
}: ProfileDetailVagasProps) {
  if (researches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-md font-medium text-on-surface mb-2">
          Nenhuma pesquisa de mercado
        </h3>
        <p className="text-body-md text-on-surface/60 mb-4">
          Nenhuma pesquisa foi realizada para este perfil.
        </p>
        <p className="text-body-md text-on-surface/60">
          Execute a skill{" "}
          <code className="bg-surface-container px-2 py-1 rounded-sm">
            /pesquisar-mercado
          </code>{" "}
          para gerar dados.
        </p>
      </div>
    );
  }

  const mostRecent = researches[0];
  const jobsList: Job[] = allVagas[mostRecent.date] ?? [];

  return (
    <div className="space-y-6">
      {/* D-33: data exibida sempre, mesmo com 1 pesquisa */}
      <p className="text-label-sm text-on-surface/60">
        Pesquisa de: {mostRecent.date}
      </p>

      {jobsList.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-title-md font-medium text-on-surface">
            {jobsList.length} vaga{jobsList.length !== 1 ? "s" : ""} encontrada
            {jobsList.length !== 1 ? "s" : ""}
          </h4>
          <div className="space-y-3">
            {jobsList.map((job, idx) => (
              <div
                key={idx}
                className="rounded-sm bg-surface-container-low p-4 space-y-3"
              >
                <div>
                  <p className="text-body-md font-medium text-on-surface">
                    {job.title}
                  </p>
                  <p className="text-body-md text-on-surface/70">
                    <span>{job.company}</span>
                    {job.companySize && (
                      <span className="text-on-surface/50">
                        {" "}
                        ({job.companySize})
                      </span>
                    )}
                  </p>
                </div>

                {job.stack && job.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.stack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-sm bg-surface-container text-label-sm text-on-surface/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {job.snippet && (
                  <p className="text-body-md text-on-surface/80">
                    {job.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-body-md text-on-surface/60 text-center py-8">
          Nenhuma vaga encontrada para {mostRecent.date}.
        </p>
      )}
    </div>
  );
}
