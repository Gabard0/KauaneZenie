// A chave interna barbozza mantém compatibilidade com as preferências já salvas.
// Sua apresentação agora é inteiramente da Kauane Zenie.
export const TEMAS = {
  barbozza: {
    nome: "Kauane · Assinatura",
    emoji: "✦",
    desc: "Vinho profundo, marfim e rosé",
    cores: ["#560623", "#C16F84", "#F8EFEB", "#321522"],
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
  document.documentElement.classList.toggle("dark", m === "escuro");
  localStorage.setItem("kauane_tema", t);
  localStorage.setItem("kauane_modo", m);
  return { tema: t, modo: m };
}

export const temaSalvo = () => "barbozza";
export const modoSalvo = () =>
  (localStorage.getItem("kauane_modo") || localStorage.getItem("barbozza_modo")) === "escuro" ? "escuro" : "claro";
export const preferenciaSalva = () => ({ tema: temaSalvo(), modo: modoSalvo() });
