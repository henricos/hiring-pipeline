"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteProfile } from "@/app/actions/profile";
import type { JobProfile } from "@/lib/profile";

interface ProfileListProps {
  profiles: JobProfile[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<JobProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = [...profiles].sort((a, b) => b.updatedAt - a.updatedAt);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(() => {
      deleteProfile(deleteTarget.id);
    });
    setDeleteTarget(null);
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-title-md font-medium text-on-surface mb-2">
          Nenhum perfil criado ainda
        </h3>
        <p className="text-body-md text-on-surface/60 mb-6">
          Crie um perfil-base para reutilizar ao abrir vagas. Cada perfil guarda
          requisitos, responsabilidades e qualificações.
        </p>
        <Link href="/profiles/new">
          <Button>Criar primeiro perfil</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {sorted.map((profile) => {
          const updatedDate = new Date(profile.updatedAt).toLocaleDateString(
            "pt-BR",
            { day: "2-digit", month: "2-digit", year: "numeric" }
          );

          return (
            <div
              key={profile.id}
              className="flex items-center justify-between py-4 gap-4 cursor-pointer"
              onClick={() => router.push(`/profiles/${profile.id}/edit`)}
            >
              {/* Coluna esquerda: título e cargo sugerido */}
              <div className="flex-1 min-w-0">
                <p className="text-body-md font-medium text-on-surface truncate">
                  {profile.title}
                </p>
                <p className="text-body-md text-on-surface/70">
                  {profile.suggestedTitle}
                </p>
              </div>

              {/* Data de atualização */}
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/70 shrink-0">
                {updatedDate}
              </div>

              {/* Ações */}
              <div
                className="flex gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  className="min-h-[40px] min-w-[40px]"
                  aria-label={`Editar perfil ${profile.title}`}
                >
                  <Link href={`/profiles/${profile.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-[40px] min-w-[40px] text-on-surface/50 hover:text-destructive"
                  aria-label={`Excluir perfil ${profile.title}`}
                  onClick={() => setDeleteTarget(profile)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O perfil &apos;
              {deleteTarget?.title}&apos; será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter perfil</AlertDialogCancel>
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
