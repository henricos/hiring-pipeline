# Formulário GH — Campos da Requisição de Pessoal

> Mapeamento do template `templates/requisicao-de-pessoal.xlsx` (aba "Perfil Vaga").
> Referência canônica para garantir que perfis e vagas cubram todos os campos necessários
> para preencher o formulário de requisição enviado ao GH/Werecruiter.

---

## Campos da Vaga (específicos por abertura — Phase 4)

Preenchidos no momento da abertura de uma vaga. Não fazem parte do perfil reutilizável.

| Campo | Tipo | Observações |
|---|---|---|
| Tipo de requisição | Seleção | Recrutamento interno / Recrutamento externo |
| Quantidade de vagas | Número | |
| Data da requisição | Data | |
| Cargo (título interno) | Texto | |
| Cargo sugerido para anúncio | Texto | Título para publicação externa (Gupy) |
| Vaga solicitada por | Texto | Nome do solicitante |
| Nome do padrinho | Texto | |
| Centro de custo | Texto | |
| Faixa salarial | Texto | |
| Vaga confidencial | Seleção | Sim / Não |
| Vaga orçada | Seleção | Sim / Não |
| Aumento de quadro | Seleção | Sim / Não — se Não, informar nome do substituído |
| Horário de trabalho | Seleção | Das 08h às 17h / Das 09h às 18h / Outro |
| Disponibilidade para viagens | Seleção | Sim / Não |
| Reporte imediato | Texto | |
| Reporte mediato | Texto | |
| Modalidade de trabalho | Seleção | Presencial / Remoto / Híbrido |
| Data prevista de contratação | Data | |
| Composição da equipe | Texto longo | Estrutura da área e quantidade de pessoas por cargo |
| Cargo validado pelo GH | Texto | Preenchido pelo GH |
| Salário validado pelo GH | Texto | Preenchido pelo GH |

---

## Campos do Perfil (reutilizáveis entre aberturas — Phase 2)

Fazem parte do perfil-base da vaga. Ao abrir uma vaga, esses campos são herdados do perfil
e podem ser ajustados pontualmente.

### Requisitos de Candidato

| Campo | Tipo | Observações |
|---|---|---|
| Tempo de experiência | Seleção | < 1 ano / 1-3 anos / 3-5 anos / 5-10 anos / > 10 anos |
| Nível de escolaridade | Seleção | Ensino médio / Superior cursando / Superior completo + campo "Curso" |
| Pós-graduação | Seleção | Desejável / Necessário + campo "Curso" |
| Certificações | Seleção | Sim / Não / Desejável + campo "Quais" |
| Inglês | Seleção | Não exigido / Básico / Intermediário / Avançado / Fluente |
| Espanhol | Seleção | Não exigido / Básico / Intermediário / Avançado / Fluente |
| Outro idioma | Texto + Seleção | Nome do idioma + nível |

### Conteúdo Descritivo (5 textareas — núcleo do perfil)

Esses 5 campos são o núcleo do perfil. Sem eles o formulário GH não pode ser preenchido.

| Campo | Instrução no formulário GH |
|---|---|
| **Responsabilidades e atribuições** | "Descreva as responsabilidades e atribuições. Cite também as experiências que se espera do candidato. (Visão geral das cinco maiores responsabilidades do cargo)" |
| **Requisitos e qualificações** | "Descreva os requisitos e qualificações, falando sobre ferramentas, habilidades..." — inclui obrigatórios e diferenciais/opcionais no mesmo campo |
| **Características e competências comportamentais** | "Principais características e competências comportamentais esperadas no candidato. (Descreva com base em nossos valores: simplificar a vida das pessoas, inovar...)" |
| **Principais desafios** | "Principais desafios. (Visão geral de como poderá contribuir para o crescimento da área)" — campo genérico, sem equivalente direto na Gupy |
| **Informações complementares** | Campo livre para informações adicionais sobre o perfil |

### Infraestrutura (opcional, depende do cargo)

| Campo | Tipo | Observações |
|---|---|---|
| Sistemas necessários | Checkboxes + texto livre | Lista de sistemas do formulário + campo "Outros sistemas" |
| Pastas de rede | Texto | Pastas de rede necessárias |

### Metadados do Perfil (não vão para o formulário GH)

| Campo | Tipo | Observações |
|---|---|---|
| Observações internas | Texto longo | Anotações do gestor — não publicadas externamente |

---

## Mapeamento Perfil → Formulário GH

Ao gerar o formulário na Phase 4, os campos são distribuídos assim:

```
Perfil.titulo_cargo              → GH "Cargo"
Perfil.cargo_anuncio             → GH "Cargo sugerido para anúncio"
Perfil.tempo_experiencia         → GH "Tempo de experiência"
Perfil.escolaridade              → GH "Nível de escolaridade"
Perfil.pos_graduacao             → GH "Pós-graduação"
Perfil.certificacoes             → GH "Certificações"
Perfil.ingles / espanhol / outro → GH "Inglês / Espanhol / Outro"
Perfil.responsabilidades         → GH campo row 43-46
Perfil.requisitos_qualificacoes  → GH campo row 47-49
Perfil.comportamentais           → GH campo row 51-53
Perfil.principais_desafios       → GH campo row 54-57
Perfil.informacoes_complementares→ GH campo row 58
Perfil.sistemas_necessarios      → GH checkboxes row 61-66
Perfil.pastas_rede               → GH campo row 68

Vaga.tipo_requisicao             → GH "Tipo de requisição"
Vaga.quantidade                  → GH "Quantidade de vagas"
[... demais campos da vaga ...]
```
