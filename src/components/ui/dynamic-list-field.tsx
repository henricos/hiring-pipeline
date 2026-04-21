"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";

interface DynamicListFieldProps {
  name: string;        // nome do campo para FormData (repetido nos hidden inputs)
  label: string;       // texto do Label acima da lista
  initialItems?: string[];   // itens iniciais — array do perfil existente
  required?: boolean;  // se true, o primeiro input recebe required
  labelClassName?: string;   // sobrescreve LABEL_CLASS se fornecido
}

export function DynamicListField({
  name,
  label,
  initialItems,
  required,
  labelClassName,
}: DynamicListFieldProps) {
  // PITFALL CRÍTICO: initializar com [""] se array vazio — garante ao menos 1 input
  const [items, setItems] = useState<string[]>(
    initialItems && initialItems.length > 0 ? initialItems : [""]
  );

  const update = (index: number, value: string) =>
    setItems(prev => prev.map((item, i) => (i === index ? value : item)));

  const add = () => setItems(prev => [...prev, ""]);

  const remove = (index: number) => {
    if (items.length === 1) return; // manter ao menos 1 input
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClassName ?? LABEL_CLASS}>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            {/*
              PITFALL: o <Input> visível NÃO tem name.
              Somente o hidden input tem name — evita duplicação no FormData.
              A server action usa formData.getAll(name) para receber o array.
            */}
            <input type="hidden" name={name} value={item} />
            <Input
              value={item}
              onChange={e => update(index, e.target.value)}
              required={required && index === 0}
              className={`flex-1 ${INPUT_CLASS}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              disabled={items.length === 1}
              className="rounded-sm shrink-0"
              aria-label="Remover item"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="rounded-sm text-[0.75rem] h-8 px-3"
        >
          + Adicionar item
        </Button>
      </div>
    </div>
  );
}
