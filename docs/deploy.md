# Deploy

Este documento descreve como subir o `hiring-pipeline` via Docker Compose, usando a imagem publicada.

Use este guia quando o objetivo for colocar a aplicação em produção. Para desenvolvimento local, use `docs/dev.md`. Para criar uma nova release, use `docs/release.md`.

## Pré-requisitos

- Docker Engine com `docker compose`
- Credenciais reais para as variáveis de ambiente
- Repositório de dados `hiring-pipeline-data` clonado e acessível no host

## 1. Configure as variáveis de ambiente

Crie um arquivo `.env` no diretório de deploy com os valores reais do seu ambiente:

```bash
AUTH_USERNAME=gestor
AUTH_PASSWORD=senha-segura-minimo-8-chars
NEXTAUTH_SECRET=<gerado-com-openssl-rand-base64-32>
NEXTAUTH_URL=https://seu-dominio/hiring-pipeline
DATA_HOST_PATH=/caminho/absoluto/para/hiring-pipeline-data
WEB_HOST_PORT=3000
```

## 2. Suba a aplicação

```bash
docker compose up -d
```

Para atualizar para a imagem mais recente publicada:

```bash
docker compose pull
docker compose up -d
```

## 3. Compose de produção

```yaml
services:
  web:
    image: ghcr.io/henricos/hiring-pipeline:latest
    container_name: hiring-pipeline
    restart: unless-stopped
    environment:
      APP_ROOT_PATH: /app
      APP_BASE_PATH: /hiring-pipeline
      DATA_PATH: /data
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "${WEB_HOST_PORT:-3000}:3000"
    volumes:
      - type: bind
        source: ${DATA_HOST_PATH}
        target: /data
```

## Relação com outros guias

- Para desenvolvimento local: `docs/dev.md`.
- Para fechar uma nova versão: `docs/release.md`.
