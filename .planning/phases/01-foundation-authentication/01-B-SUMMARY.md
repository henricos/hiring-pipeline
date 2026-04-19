---
phase: "01-foundation-authentication"
plan: "B"
subsystem: "scaffolding"
tags: ["next.js", "tailwind4", "shadcn", "inter-font", "base-path", "design-system"]
dependency_graph:
  requires: ["01-A"]
  provides: ["package.json", "tsconfig.json", "next.config.ts", "globals.css", "base-path.ts", "utils.ts", "app-brand.ts", "layout.tsx", "Inter fonts"]
  affects: ["01-C", "01-D", "01-E", "01-F"]
tech_stack:
  added:
    - "next ^16.2.4"
    - "react 19.2.4"
    - "next-auth 5.0.0-beta.30"
    - "zod 4.3.6"
    - "tailwindcss 4.2.2"
    - "shadcn ^4.3.0"
    - "lucide-react ^1.8.0"
    - "clsx ^2.1.1 + tailwind-merge ^3.5.0"
    - "tw-animate-css ^1.4.0"
  patterns:
    - "Tailwind 4 via @theme{} em CSS (sem tailwind.config.js)"
    - "Inter via localFont com woff2 locais (sem Google Fonts)"
    - "Base path configurável via APP_BASE_PATH + normalizeBasePath()"
    - "Design tokens do Digital Curator portados do ai-pkm"
key_files:
  created:
    - "package.json — dependências com versões exatas do RESEARCH.md"
    - "tsconfig.json — configuração TypeScript com path alias @/*"
    - "components.json — shadcn/ui config com style radix-nova"
    - "postcss.config.mjs — integração PostCSS para Tailwind 4"
    - "next.config.ts — basePath configurável, output standalone, git hash"
    - "src/app/globals.css — design tokens Tailwind 4 sem partes PKM-específicas"
    - "src/app/fonts/inter-latin-{400,500,600,700}-normal.woff2 — fontes locais"
    - "src/app/layout.tsx — RootLayout com Inter localFont, lang=pt-BR"
    - "src/lib/base-path.ts — normalizeBasePath, withBasePath, getConfiguredBasePath"
    - "src/lib/utils.ts — cn() helper (clsx + tailwind-merge)"
    - "src/lib/app-brand.ts — appId=hiring-pipeline, appName=Hiring Pipeline"
  modified: []
decisions:
  - "Fontes Inter via localFont (woff2 locais) em vez de next/font/google — evita dependência de rede em Docker"
  - "globals.css sem katex, @tailwindcss/typography e viewer presets — removidos pois são PKM-específicos"
  - "package-lock.json incluído no commit — garante reprodutibilidade das versões instaladas"
metrics:
  duration: "~12 minutos de execução efetiva"
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 14
  files_modified: 0
---

# Phase 01 Plan B: Scaffolding Next.js — Summary

**One-liner:** Scaffolding completo Next.js 16 + Tailwind 4 + Inter localFont + design tokens Digital Curator portados do ai-pkm, com base path configurável via APP_BASE_PATH.

## Tasks Completed

| Task | Name | Commit | Arquivos |
|------|------|--------|----------|
| B-1 | Criar package.json, tsconfig.json, components.json e postcss.config.mjs | 847cd53 | package.json, tsconfig.json, components.json, postcss.config.mjs |
| B-2 | Criar next.config.ts, globals.css, fontes Inter e lib/ utilitários | 26c58e2 | next.config.ts, globals.css, 4x woff2, layout.tsx, base-path.ts, utils.ts, app-brand.ts |

## Verification Results

```
npm install — 840 pacotes instalados, 0 vulnerabilidades
npm test -- base-path — 5/5 testes GREEN
npm run typecheck — 0 erros nos arquivos deste plano (erros em lib/env.ts e lib/data-service.ts são esperados — pertencem a PLAN-C e PLAN-D)
```

## File Origins

| Arquivo | Origem | Operação |
|---------|--------|----------|
| package.json | ai-pkm/package.json | Adaptado — removidas deps PKM-específicas (shiki, gray-matter, react-markdown, fuse.js, radix-ui specifics) |
| tsconfig.json | ai-pkm/tsconfig.json | Copiado exato |
| components.json | ai-pkm/components.json | Copiado exato |
| postcss.config.mjs | Novo | Criado — não existe no ai-pkm como template explícito |
| next.config.ts | ai-pkm/next.config.ts | Copiado exato — sem deps PKM neste arquivo |
| src/app/globals.css | ai-pkm/src/app/globals.css | Adaptado — removidos: @import katex, @plugin typography, .prose, viewer presets (chatgpt, github, excalidraw) |
| src/app/fonts/*.woff2 | ai-pkm/src/app/fonts/ | Copiado exato — 4 pesos Inter (400, 500, 600, 700) |
| src/app/layout.tsx | ai-pkm/src/app/layout.tsx | Adaptado — removidos excalifont e buildViewerThemeBootstrapScript |
| src/lib/base-path.ts | ai-pkm/src/lib/base-path.ts | Copiado exato |
| src/lib/utils.ts | ai-pkm/src/lib/utils.ts | Copiado exato |
| src/lib/app-brand.ts | ai-pkm/src/lib/app-brand.ts | Adaptado — appId, appName, appDescription para hiring-pipeline |

## Deviations from Plan

None — plano executado exatamente como escrito. Todos os arquivos PKM-específicos foram removidos conforme instruído (katex, typography, viewer presets, excalifont, gray-matter, shiki, fuse.js). Typecheck indica apenas erros esperados em módulos que pertencem a PLAN-C (lib/env.ts, lib/auth.ts) e PLAN-D (lib/data-service.ts).

## Threat Surface Scan

Nenhuma superfície nova além do previsto no threat model do plano:
- `next.config.ts` lê `APP_BASE_PATH` (T-1-02, mitigado por normalizeBasePath)
- `next.config.ts` expõe `NEXT_PUBLIC_GIT_HASH` (T-1-07, aceito — informação pública)

## Self-Check: PASSED

Todos os 14 arquivos criados verificados. Commits 847cd53 e 26c58e2 confirmados no histórico git.
