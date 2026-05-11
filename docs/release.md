# Guia de Release

Este documento define o fluxo canônico de release para gerar uma nova versão da aplicação e publicar a imagem Docker correspondente.

Use este guia quando o objetivo for fechar uma release oficial. Se quiser apenas subir a aplicação já publicada, siga `docs/deploy.md`.

## Como fechar uma versão

O fluxo de release é orquestrado pela skill `/fechar-versao`. Basta invocar a skill no Claude Code:

```
/fechar-versao
```

A skill realiza e valida cada etapa automaticamente. Não execute os passos manualmente — a skill é a fonte canônica do procedimento.

## O que a skill faz

1. Verifica pré-condições Git (branch `main`, alinhamento com `origin/main`, working tree limpa).
2. Pergunta o tipo de bump: `patch`, `minor` ou `major`.
3. Pede confirmação explícita antes de executar qualquer mudança.
4. Roda o gate local: `npm test`, `npm run typecheck` e `npm run build`.
5. Executa `npm version patch|minor|major` — atualiza `package.json`, `package-lock.json`, cria o commit e a tag Git.
6. Publica com `git push origin main --follow-tags`.
7. Aguarda e confirma o resultado do workflow no GitHub Actions.
8. Confirma que a imagem foi publicada no GHCR com as tags `vX.Y.Z` e `latest`.

## Pré-condições obrigatórias

- branch atual deve ser `main`
- `main` local deve estar alinhada com `origin/main`
- working tree deve estar limpa
- testes, typecheck e build devem passar antes do bump

## Conferência de rastreabilidade

Depois da release, confirme:

1. `package.json` mostra a nova versão `X.Y.Z`.
2. Existe uma tag Git `vX.Y.Z` no repositório remoto.
3. O GitHub Actions executou o workflow `release-ghcr` com sucesso.
4. A imagem `ghcr.io/henricos/hiring-pipeline` foi publicada com as tags `vX.Y.Z` e `latest`.

## Relação com outros guias

- Para subir a aplicação em produção: `docs/deploy.md`.
- Para operações de desenvolvimento local: `docs/dev.md`.
