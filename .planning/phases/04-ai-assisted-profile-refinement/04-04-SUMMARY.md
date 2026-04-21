---
phase: 04-ai-assisted-profile-refinement
plan: "04"
subsystem: data
tags: [json, profiles, vacancies, settings, seed-data]

requires:
  - phase: 04-02
    provides: profile.ts com string[] nos 4 campos descritivos
  - phase: 04-03
    provides: AreaSettings com aiProfileInstructions, ProfileForm com DynamicListField

provides:
  - 3 perfis reais criados a partir dos XLSXs de data/examples/ com schema string[] correto
  - 3 vagas correspondentes (status Aberta, Recrutamento externo)
  - data/settings.json recriado com campos reais da área + aiProfileInstructions
  - Base dev zerada — JSONs antigos com schema string removidos

affects: [04-05, skills/refinar-perfil, skills/abrir-vaga]

tech-stack:
  added: []
  patterns: [seed data gerado via script Node.js lendo XLSX via AdmZip]

key-files:
  created:
    - data/profiles/7ceddc1d-ba42-46ea-9cbd-450ef1b61056.json (Cientista de Dados)
    - data/profiles/f21fd1e8-f10b-47b1-9339-42d944bcef40.json (Desenvolvedor Frontend Pleno)
    - data/profiles/cc4590a9-8867-4301-bf17-5fb7fd0b144d.json (Analista de Sistemas Pleno / Java)
    - data/vacancies/c7112cd5-73b6-404c-bb5f-bb95e213e538.json
    - data/vacancies/625d2335-6c80-45da-85e8-d8cb5047c518.json
    - data/vacancies/a900a3d9-9233-4f04-800e-84ea56d7d74a.json
    - data/settings.json
  modified: []

key-decisions:
  - "Geração automática via Node.js lendo XLSX com AdmZip — sem preenchimento manual do formulário web"
  - "educationLevel: 'Superior completo' para todos (campo não legível de checkboxes do template)"
  - "experienceLevel: '3-5 anos' para todos (ctrlProp15 marcado nos exemplos)"
  - "workMode: 'Híbrido' — checkboxes dos exemplos tinham resíduo do template; valor definido por convenção da área"
  - "aiProfileInstructions: 'Pesquise vagas recentes desse perfil para sugerir melhorias'"

patterns-established: []

requirements-completed: [IA-01, IA-02, IA-03]

duration: 15min
completed: 2026-04-21
---

# Phase 4 Plan 04: Zeragem e Seed Real da Base Dev

**3 perfis reais + 3 vagas criados a partir dos XLSXs de exemplo; base de desenvolvimento zerada e compatível com schema string[] da Phase 4.**
