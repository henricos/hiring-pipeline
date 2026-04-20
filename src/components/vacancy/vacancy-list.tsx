"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteVacancy, advanceVacancyStatus } from "@/app/actions/vacancy";
import type { Vacancy, VacancyStatus } from "@/lib/vacancy";
import type { JobProfile } from "@/lib/profile";

interface VacancyListProps {
  vacancies: Vacancy[];
  profiles: Map<string, JobProfile>;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_BADGE_VARIANT: Record<VacancyStatus, BadgeVariant> = {
  Aberta: "default",
  "Em andamento": "secondary",
  Encerrada: "destructive",
};

export function VacancyList({ vacancies, profiles }: VacancyListProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Vacancy | null>(null);
  const [isPending, startTransition] = useTransition();

  // Ordenar por openedAt descendente (mais recente primeiro — D-15)
  const sorted = [...vacancies].sort((a, b) =>
    b.openedAt.localeCompare(a.openedAt)
  );

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteVacancy(deleteTarget.id);
      router.refresh();
    });
    setDeleteTarget(null);
  }

  function handleAdvanceStatus(vacancyId: string) {
    startTransition(async () => {
      await advanceVacancyStatus(vacancyId);
      router.refresh();
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-md font-medium text-on-surface mb-2">
          Nenhuma vaga aberta ainda
        </h3>
        <p className="text-body-md text-on-surface/60 mb-6">
          Abra uma nova vaga selecionando um perfil. Cada vaga rastreia o ciclo
          de vida da requisição.
        </p>
        <Link href="/vacancies/new">
          <Button>Abrir primeira vaga</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {sorted.map((vacancy) => {
          const profile = profiles.get(vacancy.profileId);
          const vacancyTitle = profile?.title ?? "(Perfil não encontrado)";
          const openedDate = new Date(vacancy.openedAt).toLocaleDateString(
            "pt-BR",
            { day: "2-digit", month: "2-digit", year: "numeric" }
          );

          return (
            <div
              key={vacancy.id}
              className="flex items-center justify-between py-4 gap-4"
            >
              {/* Coluna esquerda: título, info secundária e badge */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface truncate">
                    {vacancyTitle}
                  </p>
                  <p className="text-body-md text-on-surface/70">
                    Qty: {vacancy.quantity}
                    {vacancy.costCenter ? ` • ${vacancy.costCenter}` : ""}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[vacancy.status]}>
                  {vacancy.status}
                </Badge>
              </div>

              {/* Data de abertura */}
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/70 shrink-0">
                {openedDate}
              </div>

              {/* Ações */}
              <div
                className="flex gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Avançar status (oculto quando Encerrada) */}
                {vacancy.status !== "Encerrada" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="min-h-[40px] min-w-[40px] text-on-surface/50 hover:text-on-surface"
                    aria-label={`Avançar status da vaga ${vacancyTitle}`}
                    onClick={() => handleAdvanceStatus(vacancy.id)}
                    disabled={isPending}
                    title="Avançar status"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {/* Editar */}
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  className="min-h-[40px] min-w-[40px]"
                  aria-label={`Editar vaga ${vacancyTitle}`}
                >
                  <Link href={`/vacancies/${vacancy.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>

                {/* Excluir */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-[40px] min-w-[40px] text-on-surface/50 hover:text-destructive"
                  aria-label={`Excluir vaga ${vacancyTitle}`}
                  onClick={() => setDeleteTarget(vacancy)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A vaga &apos;
              {deleteTarget
                ? (profiles.get(deleteTarget.profileId)?.title ??
                  "(Sem título)")
                : ""}
              &apos; será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter vaga</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
