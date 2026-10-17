export const TEMAS = {
  barbozza: {
    nome: "Letícia · Pérola e Ouro",
    emoji: "🦋",
    desc: "Pérola, champagne e dourado",
    cores: ["#F7F2E6", "#C9A227", "#7A5C1B", "#2E2418"],
  },
  rose: {
    nome: "Rosé",
    emoji: "🌹",
    desc: "Rosé, rosa suave, nude e champagne",
    cores: ["#B76E79", "#E8CFC4", "#F7E7CE", "#D4AF37"],
  },
};

export const MODOS = {
  claro: { nome: "Claro", emoji: "☀️" },
  escuro: { nome: "Escuro", emoji: "🌙" },
};

export function aplicarTema(tema, modo) {
  const t = TEMAS[tema] ? tema : "barbozza";
  const m = MODOS[modo] ? modo : "claro";
  document.documentElement.dataset.tema = t;
  document.documentElement.dataset.modo = m;
  localStorage.setItem("barbozza_tema", t);
  localStorage.setItem("barbozza_modo", m);
  return { tema: t, modo: m };
}

export const temaSalvo = () => {
  const t = localStorage.getItem("barbozza_tema");
  if (t === "rose" || t === "feminino") return "rose";
  return "barbozza";
};

export const modoSalvo = () =>
  localStorage.getItem("barbozza_modo") === "escuro" ? "escuro" : "claro";

export const preferenciaSalva = () => ({ tema: temaSalvo(), modo: modoSalvo() });