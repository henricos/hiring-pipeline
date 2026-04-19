# Hiring Pipeline

## Visão geral

O Hiring Pipeline é uma ferramenta interna de contratação pensada para apoiar o processo de abertura de vagas, triagem de candidatos, registro de entrevistas e apoio à decisão com IA.

O sistema será de uso pessoal/profissional do gestor da área, hospedado em infraestrutura própria, com foco inicial no processo de contratação da área de Pesquisa e Desenvolvimento da linha de negócio de Educação da Techne, responsável pelo produto Lyceum.

A proposta é reduzir retrabalho operacional, padronizar critérios de avaliação e acelerar etapas críticas do processo seletivo.

## Contexto atual

Hoje o processo de contratação começa com o preenchimento de um formulário padrão da área de Gestão Humana (GH), disponibilizado em uma planilha Excel.

Esse arquivo possui ao menos duas abas:

1. Uma aba com campos administrativos e objetivos da vaga, como cargo, título da vaga, salário, centro de custo e demais informações formais.
2. Uma aba com um questionário reflexivo, voltado à justificativa da contratação e ao entendimento do papel da vaga.

Após o preenchimento, a planilha é enviada por email para a responsável pelo recrutamento, que faz a conferência inicial, conduz aprovações internas necessárias e depois agenda uma reunião de alinhamento com a empresa terceira responsável pelo recrutamento e seleção.

Atualmente essa empresa é a Werecruiter.

Na reunião de alinhamento, o perfil da vaga é discutido e os textos da planilha são revisados, pois servirão de base para cadastro na Gupy e divulgação em outros canais.

Depois disso, inicia-se a busca por candidatos.

Após alguns dias, normalmente em lotes de 4 a 6 currículos, a consultoria envia shortlists por email para avaliação do gestor. Nessa etapa, o gestor precisa analisar os currículos, decidir quem segue para entrevista e justificar recusas com base nos critérios da vaga.

Depois das entrevistas, também é necessário registrar anotações, percepções, pontos fortes, pontos fracos e eventualmente notas, para permitir comparação posterior entre candidatos e apoiar a decisão final.

## Problemas identificados

O processo atual apresenta os seguintes problemas principais:

- retrabalho no preenchimento da planilha de abertura de vaga;
- baixa aderência do questionário reflexivo da segunda aba ao contexto de P&D e desenvolvimento;
- reaproveitamento manual e pouco estruturado de respostas padrão;
- dependência de email para troca de informações do processo;
- esforço elevado na leitura e comparação de currículos;
- dificuldade de manter registro estruturado das entrevistas;
- dificuldade de comparar candidatos de forma consistente ao final do processo;
- ausência de uma base reutilizável de perfis de vagas e critérios de avaliação.

## Objetivo do produto

Construir uma ferramenta web própria para apoiar o processo de contratação, desde a definição do perfil da vaga até a comparação final entre candidatos entrevistados.

O foco inicial é recrutamento e seleção.

No futuro, a ferramenta poderá ser expandida para apoiar também processos de gestão da equipe, como registro de avaliações, desempenho, acompanhamento individual e histórico profissional.

## Objetivos específicos

- reduzir o tempo gasto na abertura de vagas;
- transformar perfis de vaga em ativos reutilizáveis;
- gerar descrições de vaga melhores com apoio de IA;
- facilitar o preenchimento do formulário padrão da GH;
- centralizar o acompanhamento de vagas abertas;
- apoiar a triagem de currículos com base em critérios objetivos;
- registrar entrevistas de forma estruturada;
- facilitar comparação, ranking e decisão entre candidatos;
- manter histórico organizado de cada processo seletivo.

## Escopo inicial

O escopo inicial da ferramenta contempla cinco frentes principais:

### 1. Cadastro de perfis de vaga

A ferramenta deverá permitir cadastrar e manter perfis-base de vaga, por exemplo:

- desenvolvedor Java pleno;
- engenheiro de dados;
- QA;
- product owner;
- tech lead.

Cada perfil poderá armazenar informações como:

- título do perfil;
- descrição geral;
- responsabilidades;
- requisitos obrigatórios;
- requisitos desejáveis;
- habilidades técnicas;
- competências comportamentais;
- critérios de avaliação;
- texto descritivo da vaga;
- observações internas.

> **Nota:** Esta lista é uma sugestão inicial na fase de ideação. A lista correta e definitiva de campos será determinada após análise do formulário modelo da GH e discussão detalhada dos requisitos do produto.

### 2. Geração assistida de conteúdo com IA

A IA deverá apoiar a criação e atualização dos perfis de vaga, ajudando a:

- pesquisar referências de mercado;
- sugerir requisitos e habilidades;
- estruturar responsabilidades;
- melhorar redação de descrições de vaga;
- adaptar textos para contexto da área;
- consolidar critérios de triagem e entrevista.

A ideia é que o sistema mantenha uma biblioteca reutilizável de perfis e textos, evitando recriar conteúdo sempre do zero.

### 3. Abertura de vagas a partir de perfis

Ao abrir uma nova vaga, o gestor deverá poder selecionar um perfil existente e complementar apenas os dados específicos daquela solicitação.

Exemplos de informações adicionais:

- quantidade de vagas;
- faixa ou valor salarial;
- centro de custo;
- contexto do time;
- projeto ou produto relacionado;
- observações específicas;
- urgência da contratação.

Essas informações poderão ser fornecidas de forma conversacional, em linguagem natural.

Com base nisso, a ferramenta deverá consolidar os dados e gerar uma cópia preenchida do formulário padrão da GH em Excel.

### 4. Gestão de candidatos e shortlists

A ferramenta deverá permitir registrar candidatos recebidos para cada vaga e organizar o processo de triagem.

Funcionalidades esperadas nessa etapa:

- registrar shortlists recebidas da consultoria;
- anexar ou associar currículos;
- avaliar candidatos com base nos critérios da vaga;
- apoiar a decisão de avanço ou recusa;
- sugerir justificativas e feedbacks com IA;
- manter histórico por lote e por candidato.

### 5. Gestão de entrevistas e decisão final

A ferramenta deverá permitir registrar entrevistas e consolidar percepções sobre cada candidato.

**Fluxo de entrada de dados:**
Na fase inicial, a edição de informações de entrevistas e anotações será realizada de forma conversacional através de um **agente CLI integrado** (skill de IA), que:
- Conversa com o usuário em linguagem natural;
- Transforma respostas em campos estruturados;
- Persiste os dados na aplicação;
- Permite iteração rápida sem sair do contexto do agente.

**Informações esperadas:**

- data da entrevista;
- entrevistadores;
- resumo da conversa;
- pontos fortes;
- pontos fracos;
- riscos percebidos;
- aderência ao perfil;
- nota geral ou notas por critério;
- recomendação final.

**Interface de consulta:**
A aplicação web oferecerá uma interface **read-only** inicial que consolida todas as informações capturadas, facilitando:
- Visualização de perfil completo de cada candidato;
- Comparação estruturada entre candidatos;
- Ranking final com base em critérios ponderados;
- Decisão entre avançar com uma contratação ou solicitar novos candidatos.

Edições futuras poderão ser realizadas novamente via agente conversacional ou, em futuras iterações, diretamente na UI web.

## Papel da IA no produto

A IA é um elemento central da ferramenta, mas sempre como apoio à decisão humana.

A estratégia de integração de IA é baseada em **agentes CLI com skills customizadas** (ex: Claude Code, Cursor, Codex CLI, ou similares), evitando complexidade de integração nativa e permitindo interação conversacional direta com o usuário.

Os principais usos previstos são:

- sugerir requisitos e descrições de vagas com base em perfis profissionais e contexto de mercado;
- transformar informações em linguagem natural em campos estruturados do processo;
- gerar ou revisar textos do formulário da GH;
- apoiar a triagem inicial de currículos com base nos critérios definidos;
- sugerir justificativas de recusa para candidatos não aderentes;
- ajudar a resumir anotações e entrevistas;
- apoiar a comparação entre candidatos ao final do processo.

A decisão final sobre contratação continuará sendo humana. As skills de IA serão invocadas através de uma interface conversacional intuitiva, permitindo que o usuário itere rapidamente sem sair do contexto do agente.

## Diretrizes de produto

A ferramenta deve seguir estas diretrizes:

- ser simples e pragmática;
- priorizar ganho operacional real;
- evitar excesso de burocracia;
- respeitar o fluxo real do gestor;
- preservar memória e contexto das decisões;
- permitir reaproveitamento máximo de informações anteriores;
- usar IA como aceleração, não como substituição de julgamento.

## Considerações técnicas iniciais

### Arquitetura e hospedagem

- o sistema será hospedado em infraestrutura própria do autor do projeto;
- a aplicação será uma aplicação web (stack sugerido: Node/Next, aberto a alternativas);
- a aplicação será acessada via um caminho configurável em contexto (padrão: `/hiring-pipeline`);
- o repositório do projeto será privado;
- o nome do repositório será `hiring-pipeline`;
- o formulário padrão da GH será mantido como arquivo modelo dentro do repositório;
- a solução deve ser pensada para futura evolução, sem exigir complexidade desnecessária no início.

### Estratégia de implementação em fases

**Primeira onda (MVP local):**
- Execução local da aplicação web
- Agente CLI externo (Claude Code, Cursor, etc.) para operações de IA e edição de dados
- Visualização read-only via servidor web local
- Propósito: validar fluxos, ganhar velocidade, reduzir complexidade inicial

**Segunda onda (deployment em homeserver):**
- Integração do agente de IA nativo na aplicação (utilizando Agent SDK da Anthropic ou similar)
- Execução de skills de IA 100% no runtime da instalação (sem dependência de CLI externo)
- Distribuição via container Docker
- Automatização de build e deploy com GitHub Actions
- Ambiente pronto para produção em infraestrutura local

Essa abordagem permite validação rápida na primeira fase e evolução gradual para uma solução integrada e auto-contida.

## Evoluções futuras possíveis

Fora do escopo inicial, mas já mapeadas como possibilidades futuras:

- gestão contínua da equipe;
- histórico de avaliações;
- registro de desempenho;
- acompanhamento individual;
- decisões de desenvolvimento de carreira;
- consolidação de informações de liderança da área.

## Resumo executivo

O Hiring Pipeline nasce para resolver um problema concreto: transformar um processo de contratação hoje fragmentado, manual e pouco estruturado em um fluxo assistido, reaproveitável e apoiado por IA.

O foco inicial está em:

- abrir vagas com menos esforço;
- reutilizar perfis e descrições;
- gerar o formulário da GH com mais agilidade;
- organizar candidatos e entrevistas;
- melhorar a qualidade e velocidade da decisão final.
