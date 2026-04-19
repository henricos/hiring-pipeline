import { describe, expect, test } from "vitest";

import { normalizeBasePath, withBasePath } from "../lib/base-path";

describe("base path helpers", () => {
  test("CFG-03: normaliza /hiring-pipeline sem alterar o valor canônico", () => {
    expect(normalizeBasePath("/hiring-pipeline")).toBe("/hiring-pipeline");
  });

  test("CFG-03: normaliza /hiring-pipeline/ removendo a barra final", () => {
    expect(normalizeBasePath("/hiring-pipeline/")).toBe("/hiring-pipeline");
  });

  test("CFG-03: compõe a raiz da aplicação com o prefixo configurado", () => {
    expect(withBasePath("/", "/hiring-pipeline")).toBe("/hiring-pipeline");
  });

  test("CFG-03: compõe paths internos com o prefixo configurado", () => {
    expect(withBasePath("/login", "/hiring-pipeline")).toBe("/hiring-pipeline/login");
    expect(withBasePath("/profiles/item-1", "/hiring-pipeline")).toBe("/hiring-pipeline/profiles/item-1");
  });

  test("CFG-03: rejeita entradas inválidas com erro claro em pt-BR", () => {
    expect(() => normalizeBasePath("hiring-pipeline")).toThrow('APP_BASE_PATH inválido: o valor deve começar com "/". Exemplo: "/pkm".');
    expect(() => normalizeBasePath("/hiring-pipeline//section")).toThrow("APP_BASE_PATH inválido: não use barras duplicadas.");
    expect(() => withBasePath("dashboard", "/hiring-pipeline")).toThrow('pathname inválido: o path interno deve começar com "/".');
  });
});
