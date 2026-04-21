"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProfileItem } from "@/lib/profile";

const LABEL_CLASS =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60";
const INPUT_CLASS =
  "rounded-sm bg-surface-container-low focus-visible:bg-surface-container-lowest focus-visible:border-b-2 focus-visible:border-b-tertiary";

interface Item {
  id: string;
  text: string;
  required: boolean;
}

interface ProfileItemFieldProps {
  name: string;
  label: string;
  initialItems?: ProfileItem[];
  labelClassName?: string;
}

export function ProfileItemField({
  name,
  label,
  initialItems,
  labelClassName,
}: ProfileItemFieldProps) {
  const [items, setItems] = useState<Item[]>(() => {
    const source =
      initialItems && initialItems.length > 0
        ? initialItems
        : [{ text: "", required: true }];
    return source.map(item => ({ id: crypto.randomUUID(), text: item.text, required: item.required }));
  });

  const update = (id: string, text: string) =>
    setItems(prev => prev.map(item => (item.id === id ? { ...item, text } : item)));

  const toggleRequired = (id: string) =>
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, required: !item.required } : item))
    );

  const add = () =>
    setItems(prev => [...prev, { id: crypto.randomUUID(), text: "", required: true }]);

  const remove = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-1.5">
      <Label className={labelClassName ?? LABEL_CLASS}>{label}</Label>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center">
            {/*
              CONTRATO: getAll(name) + getAll(name_required) são arrays paralelos.
              A server action faz .map((text, i) => ({ text, required: requireds[i] !== "false" }))
              e filtra itens com text vazio.
            */}
            <input type="hidden" name={name} value={item.text} />
            <input type="hidden" name={`${name}_required`} value={item.required.toString()} />
            <Input
              value={item.text}
              onChange={e => update(item.id, e.target.value)}
              className={`flex-1 ${INPUT_CLASS}`}
            />
            <button
              type="button"
              onClick={() => toggleRequired(item.id)}
              className={`shrink-0 text-[0.6875rem] font-semibold px-2 py-1 rounded-sm border transition-colors ${
                item.required
                  ? "border-tertiary/40 text-tertiary bg-tertiary/8 hover:bg-tertiary/15"
                  : "border-on-surface/20 text-on-surface/50 bg-surface-container hover:bg-surface-container-low"
              }`}
              title="Clique para alternar entre Obrigatório e Diferencial"
            >
              {item.required ? "Obrigatório" : "Diferencial"}
            </button>
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
