import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Garantir cleanup do DOM entre testes (necessário quando render é importado dinamicamente)
afterEach(() => {
  cleanup();
});

// Tornar window.location mutável no JSDOM para testes de navegação
// O JSDOM bloqueia window.location por padrão; esta configuração
// permite que window.location.href seja lido após chamadas de navegação.
const _location = {
  href: "http://localhost:3000/",
  assign(url: string) {
    this.href = url;
  },
  replace(url: string) {
    this.href = url;
  },
  reload() {},
  toString() {
    return this.href;
  },
};

Object.defineProperty(window, "location", {
  value: _location,
  writable: true,
  configurable: true,
});
