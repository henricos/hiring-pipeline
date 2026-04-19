---
name: fechar-versao
description: Fecha uma release SemVer da aplicação usando o fluxo canônico do projeto (`npm version` + `git push origin main --follow-tags`), valida a cadeia externa no GitHub Actions e no GHCR, e aborta se as pré-condições de branch, sincronização com `main` ou working tree limpa não estiverem satisfeitas. Use esta skill sempre que o usuário quiser fechar uma versão, soltar uma release, gerar uma tag SemVer ou publicar uma nova imagem da aplicação — mesmo que não diga explicitamente "fechar versão".
command: /fechar-versao
---

# SKILL: Fechar Versao

## Instruções de Execução do Agente

Esta skill fecha uma release oficial da aplicação e valida a cadeia externa até GitHub Actions + GHCR. O objetivo é **orquestrar o fluxo canônico**, nunca escondê-lo atrás de wrapper opaco.

**Regras invioláveis:**

- **Nunca** siga se a branch atual não for `main`.
- **Nunca** siga se `main` local não estiver alinhada com `origin/main`.
- **Nunca** siga se a working tree não estiver limpa.
- **Nunca** faça commit, stash, reset ou limpeza automática para "destravar" a release.
- **Nunca** trate `--allow-same-version --force` como caminho padrão; isso é apenas recovery path para falha de ambiente restrito após o bump já ter sido aplicado.

---

## Passo 1: Pré-condições Git

Verifique, nesta ordem:

```bash
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git diff --quiet && git diff --cached --quiet
```

### Regras de aborto

1. Se a branch atual não for `main`, **aborte** e oriente explicitamente:

> *"A release oficial só pode ser fechada a partir de `main`. O esperado era estar em `main` antes de iniciar a skill."*

2. Se `HEAD` local não coincidir com `origin/main`, **aborte** e oriente explicitamente:

> *"A release oficial só pode ser fechada com `main` local alinhada a `origin/main`. O esperado era uma `main` atualizada e sem divergência antes do bump."*

3. Se a working tree não estiver limpa, **aborte** e oriente explicitamente:

> *"A working tree precisa estar limpa antes da release. Esta skill não faz commit nem stash de mudanças pendentes."*

---

## Passo 2: Determinar a Próxima Versão

Leia a versão atual do `package.json`.

Calcule as três opções canônicas:

- `patch` → próxima `X.Y.Z`
- `minor` → próxima `X.Y.0`
- `major` → próxima `X.0.0`

### Pergunta obrigatória ao usuário

> Se a ferramenta oferecer widget nativo de perguntas com opções, use-o. Caso contrário, apresente as opções numeradas.

Formato recomendado:

1. **Patch** — `1.0.0 → 1.0.1`
2. **Minor** — `1.0.0 → 1.1.0`
3. **Major** — `1.0.0 → 2.0.0`
4. **Cancelar**

Depois da escolha, confirme explicitamente:

> *"Vou fechar a release `vX.Y.Z` com bump `patch|minor|major`. Confirma?"*

Se o usuário não confirmar, **aborte sem executar comandos de release**.

---

## Passo 3: Gate Local Obrigatório

Execute exatamente estes checks:

```bash
npm test
npm run typecheck
```

Para o build de produção, use ambiente explícito e reproduzível:

```bash
APP_VERSION=[versao-alvo] \
NEXT_PUBLIC_GIT_HASH=[hash-curto-ou-placeholder] \
APP_BASE_PATH=/hiring-pipeline \
DATA_PATH=/tmp/build/data \
AUTH_USERNAME=build-user \
AUTH_PASSWORD=build-password \
NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 \
NEXTAUTH_URL=http://127.0.0.1:3000/hiring-pipeline \
npm run build
```

### Regras

- Se qualquer check falhar, **aborte**.
- O build pode emitir warnings do Turbopack; **warning não bloqueia** se o comando terminar com sucesso.

---

## Passo 4: Gerar a Release Oficial

O caminho canônico é sempre:

```bash
npm version patch|minor|major
```

Esse mecanismo deve:

- atualizar `package.json`
- atualizar `package-lock.json`
- criar o commit de release
- criar a tag Git `vX.Y.Z`

### Recovery path permitido

Se `npm version` falhar **depois** de aplicar o bump por limitação de ambiente:

1. Verifique se `package.json` e `package-lock.json` já foram para a versão-alvo.
2. Verifique se ainda **não** existe commit/tag da release.
3. Conclua com: `npm version X.Y.Z --allow-same-version --force`
4. Registre no resumo final que houve recuperação de release parcial.

---

## Passo 5: Publicar Commit e Tag

```bash
git push origin main --follow-tags
```

Se esse push falhar, **aborte** e informe que a cadeia externa não foi disparada.

---

## Passo 6: Validar a Cadeia Externa

Após o push, aguarde e valide o resultado do workflow e do pacote.

### 6.1 Workflow

Confirme que existe uma run do workflow de release para a tag e que o job de publicação terminou com `success`.

### 6.2 GHCR

Confirme que o pacote `ghcr.io/henricos/hiring-pipeline` existe com as tags `vX.Y.Z` e `latest`.

### Regras

- A skill só conclui com sucesso se workflow **e** pacote tiverem sido confirmados.
- Se o workflow falhar, reporte e pare.

---

## Passo 7: Resumo Final

Apresente um resumo curto com:

- versão anterior e nova
- tipo de bump
- commit e tag Git
- status do workflow e job de publicação
- status do pacote GHCR e tags confirmadas
- se houve ou não recovery path

---

## Arquivos de Referência

- `package.json` — versão oficial da aplicação
- `Dockerfile` — labels e argumentos de rastreabilidade
- `.github/workflows/` — pipelines de CI/CD (configurar quando o deploy estiver ativo)
