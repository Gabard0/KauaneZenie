// Identificação de clientes: telefone normalizado é o identificador principal,
// nome normalizado (sem acentos/caixa) é apoio.

export const normalizarTelefone = (t) => {
  let d = (t || "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d;
};

export const telefoneIgual = (a, b) => {
  const da = normalizarTelefone(a);
  const db = normalizarTelefone(b);
  if (!da || !db) return false;
  return da === db;
};

export const normalizarNome = (n) =>
  (n || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const encontrarPorTelefone = (clientes, telefone) =>
  (clientes || []).find((c) => telefoneIgual(c.telefone, telefone)) || null;

// Somente correspondência muito provável: exatamente o mesmo nome, ignorando
// acentos, caixa e espaços extras. Nunca une automaticamente por semelhança.
export const encontrarNomesParecidos = (clientes, nome) => {
  const alvo = normalizarNome(nome);
  if (!alvo) return [];
  return (clientes || []).filter((c) => normalizarNome(c.nome) === alvo);
};
