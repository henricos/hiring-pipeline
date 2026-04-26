"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileDetailPerfil } from "./profile-detail-perfil";
import { ProfileDetailVagas } from "./profile-detail-vagas";
import { ProfileDetailResumo } from "./profile-detail-resumo";
import type { JobProfile } from "@/lib/profile";
import type { Research } from "@/lib/repositories/research-repository";

type TabValue = "perfil" | "vagas" | "resumo";

interface TabItem {
  value: TabValue;
  label: string;
}

const TABS: TabItem[] = [
  { value: "perfil", label: "Perfil" },
  { value: "vagas", label: "Vagas" },
  { value: "resumo", label: "Resumo de Mercado" },
];

// Estende Research para carregar o conteúdo do resumo pré-carregado pelo servidor
type ResearchWithResumo = Research & { resumoContent?: any };

interface ProfileDetailTabsProps {
  profile: JobProfile;
  researches: ResearchWithResumo[];
  allVagas?: Record<string, any[]>;
}

export function ProfileDetailTabs({
  profile,
  researches,
  allVagas = {},
}: ProfileDetailTabsProps) {
  // researches já contém resumoContent pré-carregado pelo servidor (WR-01)
  const [activeTab, setActiveTab] = useState<TabValue>("perfil");

  return (
    <div>
      {/* TabsList */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="grid w-full grid-cols-3 rounded-lg bg-muted p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`tabpanel-${tab.value}`}
            id={`tab-${tab.value}`}
            data-state={activeTab === tab.value ? "active" : "inactive"}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TabsContent: Perfil */}
      <div
        id="tabpanel-perfil"
        role="tabpanel"
        aria-labelledby="tab-perfil"
        hidden={activeTab !== "perfil"}
        className="mt-8"
      >
        {activeTab === "perfil" && <ProfileDetailPerfil profile={profile} />}
      </div>

      {/* TabsContent: Vagas */}
      <div
        id="tabpanel-vagas"
        role="tabpanel"
        aria-labelledby="tab-vagas"
        hidden={activeTab !== "vagas"}
        className="mt-8"
      >
        {activeTab === "vagas" && (
          <ProfileDetailVagas researches={researches} allVagas={allVagas} />
        )}
      </div>

      {/* TabsContent: Resumo */}
      <div
        id="tabpanel-resumo"
        role="tabpanel"
        aria-labelledby="tab-resumo"
        hidden={activeTab !== "resumo"}
        className="mt-8"
      >
        {activeTab === "resumo" && (
          <ProfileDetailResumo researches={researches} />
        )}
      </div>
    </div>
  );
}
