// Grupo 3: Dados comuns da área (settings.json)
// Campos compartilhados entre todas as vagas — D-05, D-06

export interface AreaSettings {
  managerName: string; // Vaga solicitada por (nome do gestor)
  godfather: string; // Nome do padrinho
  immediateReport: string; // Reporte imediato (nome)
  mediateReport: string; // Reporte mediato (nome)
  teamComposition: string; // Estrutura da área e quantidade de pessoas por cargo
}

// Padrão com strings vazias — nunca null
export function defaultSettings(): AreaSettings {
  return {
    managerName: "",
    godfather: "",
    immediateReport: "",
    mediateReport: "",
    teamComposition: "",
  };
}
