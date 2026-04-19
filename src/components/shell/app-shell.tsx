"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { appBrand } from "@/lib/app-brand";
import { LeftRail } from "@/components/shell/left-rail";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [railOpen, setRailOpen] = useState(true);
  const [workspacePending, setWorkspacePending] = useState(false);

  const toggleRail = useCallback(() => {
    setRailOpen((prev) => !prev);
  }, []);

  const handleNavigationStart = useCallback(() => {
    setWorkspacePending(true);
  }, []);

  useEffect(() => {
    setWorkspacePending(false);
  }, [pathname]);

  // Timeout de segurança: se pathname não mudar (ex: navegação falhou), reseta após 5s
  useEffect(() => {
    if (!workspacePending) return;
    const timeout = setTimeout(() => setWorkspacePending(false), 5000);
    return () => clearTimeout(timeout);
  }, [workspacePending]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside
        aria-label="Painel de navegação"
        data-testid="navigation-rail"
        aria-expanded={railOpen}
        className={[
          "flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden",
          "bg-surface-container-low",
          railOpen ? "w-72" : "w-12",
        ].join(" ")}
      >
        <div className="flex items-center h-12 px-3 shrink-0">
          {railOpen && (
            <span
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/40 truncate"
              aria-hidden="true"
            >
              {appBrand.appName}
            </span>
          )}
        </div>

        <div
          id="rail-content"
          className="flex-1 overflow-hidden min-h-0"
          aria-hidden={!railOpen}
        >
          {railOpen && (
            <LeftRail onNavigationStart={handleNavigationStart} />
          )}
        </div>

        <div className="shrink-0 flex items-center justify-end px-2 py-2">
          <button
            onClick={toggleRail}
            aria-label={railOpen ? "Recolher painel" : "Expandir painel"}
            aria-expanded={railOpen}
            aria-controls="rail-content"
            className="flex items-center justify-center w-7 h-7 rounded-sm text-on-surface/35 hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {railOpen ? (
                <>
                  <path d="M9 4L5 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 4L9 8L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <path d="M4 4L8 8L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </aside>

      <main
        className="relative flex-1 min-w-0 h-full overflow-y-auto bg-surface-container-lowest"
        aria-label="Área de conteúdo"
      >
        {workspacePending && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="h-0.5 overflow-hidden bg-surface-container">
              <div className="workspace-loading-bar h-full w-1/3" />
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
