const BASE_PATH_ERROR_PREFIX = "APP_BASE_PATH inválido:";

function assertNonEmptyString(input: unknown): asserts input is string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} informe um path absoluto, como "/pkm".`);
  }
}

export function normalizeBasePath(input: string): string {
  assertNonEmptyString(input);

  if (input !== input.trim()) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} não use espaços antes ou depois do valor.`);
  }

  if (!input.startsWith("/")) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} o valor deve começar com "/". Exemplo: "/pkm".`);
  }

  if (input.includes("//")) {
    throw new Error(`${BASE_PATH_ERROR_PREFIX} não use barras duplicadas.`);
  }

  if (input.length > 1 && input.endsWith("/")) {
    return input.slice(0, -1);
  }

  return input;
}

export function getConfiguredBasePath(rawBasePath = process.env.APP_BASE_PATH ?? "/"): string {
  return normalizeBasePath(rawBasePath);
}

function normalizeInternalPath(pathname: string): string {
  assertNonEmptyString(pathname);

  if (pathname !== pathname.trim()) {
    throw new Error('pathname inválido: não use espaços antes ou depois do path.');
  }

  if (!pathname.startsWith("/")) {
    throw new Error('pathname inválido: o path interno deve começar com "/".');
  }

  if (pathname.includes("//")) {
    throw new Error("pathname inválido: não use barras duplicadas.");
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

// Use em redirect(), callback URLs e composição server-side onde o framework não auto-prefixa.
// Não use por padrão em next/link ou consumers já auto-prefixados pelo basePath do Next.js.
export function withBasePath(pathname: string, basePath = getConfiguredBasePath()): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  const normalizedPathname = normalizeInternalPath(pathname);

  if (normalizedBasePath === "/") {
    return normalizedPathname;
  }

  if (normalizedPathname === "/") {
    return normalizedBasePath;
  }

  return `${normalizedBasePath}${normalizedPathname}`;
}
