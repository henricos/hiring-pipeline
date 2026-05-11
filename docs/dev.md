# Desenvolvimento local

Este documento cobre setup e operações do dia a dia de desenvolvimento do `hiring-pipeline`.

Para runtime empacotado via Docker, use `docs/deploy.md`. Para fechar uma release, use `docs/release.md`.

## Pré-requisitos

- **Node.js 22+**
- **npm** (incluído com o Node)

## 1. Instalação

```bash
npm install
```

## 2. Configuração

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com os valores do seu ambiente. O `.env.local` nunca deve ser commitado.

### Variáveis obrigatórias

| Variável | Descrição |
| :--- | :--- |
| `AUTH_USERNAME` | Usuário único de acesso à aplicação |
| `AUTH_PASSWORD` | Senha (mínimo 8 caracteres) |
| `NEXTAUTH_SECRET` | Secret JWT — gerar com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base incluindo o base path (ex: `http://localhost:3000/hiring-pipeline`) |
| `APP_BASE_PATH` | Base path da aplicação (padrão: `/hiring-pipeline`) |
| `DATA_PATH` | Caminho absoluto para o diretório de dados JSON |

### DATA_PATH em desenvolvimento

A pasta `data/` no repositório é um symlink para o repositório vizinho `hiring-pipeline-data`. Para desenvolvimento local, `DATA_PATH` deve apontar para um caminho absoluto válido — o symlink já resolve isso se o repositório de dados estiver no lugar esperado.

## 3. Rodar a aplicação

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000/hiring-pipeline`.

## 4. Rodar os testes

```bash
npm test
```

Para modo watch:

```bash
npm run test:watch
```

## 5. Verificação de tipos

```bash
npm run typecheck
```

## 6. Build de produção local

```bash
APP_VERSION=dev \
NEXT_PUBLIC_GIT_HASH=local \
APP_BASE_PATH=/hiring-pipeline \
DATA_PATH=/tmp/build/data \
AUTH_USERNAME=build-user \
AUTH_PASSWORD=build-password \
NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234 \
NEXTAUTH_URL=http://127.0.0.1:3000/hiring-pipeline \
npm run build
```
