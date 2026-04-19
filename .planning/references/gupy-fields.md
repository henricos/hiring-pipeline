# Gupy — Campos da Publicação de Vaga

> Mapeamento dos campos usados ao cadastrar uma vaga na Gupy.
> Referência canônica para garantir que o perfil e a vaga cubram o conteúdo necessário
> para publicação externa sem retrabalho.

---

## Campos da Vaga na Gupy

### Descrição da vaga

Texto introdutório sobre a empresa, o produto e a área contratante.
**Responsabilidade do GH** — preenchido pelo time de Gestão Humana/Werecruiter ao cadastrar
na Gupy. Não é campo do perfil nem da vaga no sistema.

### Responsabilidades e atribuições

Mapeamento direto do campo **Responsabilidades e atribuições** do perfil (1:1).

### Requisitos e qualificações

Campo composto por três sub-áreas, todas alimentadas a partir do perfil:

| Sub-área Gupy | Origem no perfil |
|---|---|
| **Qualificações** | Campo "Características e competências comportamentais" |
| **Requisitos** | Campo "Requisitos e qualificações" — parte obrigatória |
| **Diferenciais** | Campo "Requisitos e qualificações" — parte opcional/diferencial |

> O gestor escreve obrigatórios e diferenciais no mesmo campo do perfil/formulário GH.
> Na publicação da Gupy, separa os dois ao preencher as sub-áreas manualmente.

### Informações adicionais

Benefícios, regime de contratação, informações da empresa (vale-refeição, plano de saúde, etc.).
Alimentado parcialmente pelo campo **Informações complementares** do perfil.

---

## Campos sem equivalente na Gupy

| Campo do perfil/formulário GH | Situação na Gupy |
|---|---|
| Principais desafios | Sem equivalente direto — não publicado na Gupy |
| Sistemas necessários | Sem equivalente direto — interno ao processo GH |
| Pastas de rede | Sem equivalente direto — interno ao processo GH |
| Campos administrativos da vaga | Internos ao formulário GH — não publicados |

---

## Fluxo de publicação (Phase 4)

```
Sistema gera formulário GH (.xlsx)
    ↓
Gestor envia para GH/Werecruiter por email
    ↓
GH cadastra vaga na Gupy manualmente
    ↓
GH preenche "Descrição da vaga" (responsabilidade deles)
GH preenche "Responsabilidades" ← direto do perfil
GH distribui "Requisitos e qualificações" em 3 sub-áreas:
    - Qualificações ← campo comportamentais do perfil
    - Requisitos    ← parte obrigatória do campo requisitos do perfil
    - Diferenciais  ← parte opcional do campo requisitos do perfil
GH preenche "Informações adicionais" ← info complementares + benefícios
```
