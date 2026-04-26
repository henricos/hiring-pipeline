"use client";

import { useState } from "react";
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
  defaultExpanded?: string;
}

export function ProfileDetailVagas({
  researches,
  allVagas,
  defaultExpanded,
}: ProfileDetailVagasProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    defaultExpanded ?? researches[0]?.date ?? null
  );

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

  const jobsList: Job[] = selectedDate ? (allVagas[selectedDate] ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Seletor de data — só aparece quando há mais de uma pesquisa */}
      {researches.length > 1 && (
        <div className="flex items-center gap-4">
          <label
            htmlFor="research-date-select"
            className="text-label-sm uppercase text-on-surface/60"
          >
            Pesquisa:
          </label>
          <select
            id="research-date-select"
            value={selectedDate ?? ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-sm bg-surface-container px-3 py-2 text-body-md border border-outline-variant"
          >
            {researches.map((r) => (
              <option key={r.date} value={r.date}>
                {r.date}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de vagas */}
      {jobsList.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-title-md font-medium text-on-surface">
            {jobsList.length} vaga{jobsList.length !== 1 ? "s" : ""} encontrada
            {jobsList.length !== 1 ? "s" : ""}{" "}
            {researches.length === 1 && selectedDate ? `— ${selectedDate}` : ""}
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
          {selectedDate
            ? `Nenhuma vaga encontrada para ${selectedDate}.`
            : "Selecione uma pesquisa para ver as vagas."}
        </p>
      )}
    </div>
  );
}
