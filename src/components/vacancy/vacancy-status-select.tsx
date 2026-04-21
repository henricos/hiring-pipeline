"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeVacancyStatus } from "@/app/actions/vacancy";
import { VACANCY_STATUSES } from "@/lib/vacancy";
import type { VacancyStatus } from "@/lib/vacancy";

interface VacancyStatusSelectProps {
  vacancyId: string;
  currentStatus: VacancyStatus;
}

export function VacancyStatusSelect({
  vacancyId,
  currentStatus,
}: VacancyStatusSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await changeVacancyStatus(vacancyId, newStatus as VacancyStatus);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecionar status" />
        </SelectTrigger>
        <SelectContent>
          {VACANCY_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <span className="text-sm text-muted-foreground">Salvando...</span>
      )}
    </div>
  );
}
