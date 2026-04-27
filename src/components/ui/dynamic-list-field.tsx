"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";

interface Item {
  id: string;
  value: string;
}

interface DynamicListFieldProps {
  name: string;
  label: string;
  initialItems?: string[];
  required?: boolean;
  labelClassName?: string;
}

export function DynamicListField({
  name,
  label,
  initialItems,
  required,
  labelClassName,
}: DynamicListFieldProps) {
  const [items, setItems] = useState<Item[]>(() => {
    const source = initialItems && initialItems.length > 0 ? initialItems : [""];
    return source.map(value => ({ id: crypto.randomUUID(), value }));
  });

  const update = (id: string, value: string) =>
    setItems(prev => prev.map(item => (item.id === id ? { ...item, value } : item)));

  const add = () =>
    setItems(prev => [...prev, { id: crypto.randomUUID(), value: "" }]);

  const remove = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClassName ?? LABEL_CLASS}>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-start">
            {/*
              PITFALL: o textarea visível NÃO tem name.
              Somente o hidden input tem name — evita duplicação no FormData.
              CONTRATO: getAll(name) requer .filter(Boolean) — pode enviar strings vazias.
            */}
            <input type="hidden" name={name} value={item.value} />
            <textarea
              value={item.value}
              onChange={e => update(item.id, e.target.value)}
              required={required && index === 0}
              rows={2}
              className={`flex-1 resize-none px-3 py-2 text-body-md text-on-surface border border-input rounded-sm ${INPUT_CLASS}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(item.id)}
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
