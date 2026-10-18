import { studioMessage } from "@/lib/brand";

export const MENSAGEM_PADRAO = `Oi, Kauane! 💕 Acabei de realizar o pagamento da taxa de agendamento.

👤 Nome: {nome}
📱 WhatsApp: {whatsapp}
✨ Procedimento: {procedimentos}
📅 Data: {data}
⏰ Horário: {horario}
💰 Taxa paga: {taxa}

Estou enviando o comprovante para confirmar meu horário. ✨`;

export const MENSAGEM_ADMIN = `Olá, {nome}! ✨

Confirmando seu agendamento no Kauane Zenie · Studio de Beleza:

📅 {data}
⏰ {horario}
✨ {procedimentos}
💰 {valor}

Até lá! ✨`;

export const VARS = [
  "nome",
  "procedimentos",
  "data",
  "horario",
  "valor",
  "whatsapp",
  "taxa",
  "data_manutencao",
  "horario_manutencao",
];

export const VAR_LABELS = {
  nome: "{nome}",
  procedimentos: "{procedimentos}",
  data: "{data}",
  horario: "{horario}",
  valor: "{valor}",
  whatsapp: "{whatsapp}",
  taxa: "{taxa}",
  data_manutencao: "{data_manutencao}",
  horario_manutencao: "{horario_manutencao}",
};

export function montarMensagem(template, dados) {
  let m = studioMessage(template || MENSAGEM_PADRAO);
  for (const v of VARS) {
    const rotulo = VAR_LABELS[v];
    const valor = dados[v] != null ? String(dados[v]) : rotulo;
    m = m.split(rotulo).join(valor);
  }
  // Remove linhas que ficaram sem conteúdo (apenas emoji/pontuação/espaços),
  // por exemplo as linhas de manutenção quando não houve manutenção.
  m = m
    .split("\n")
    .filter((line) => /[a-zA-Z0-9\u00C0-\u024F]/.test(line))
    .join("\n")
    .trim();
  return m;
}

export const DADOS_EXEMPLO = {
  nome: "Maria Silva",
  procedimentos: "Volume Brasileiro",
  data: "15/09/2026",
  horario: "14:00",
  valor: "R$ 120,00",
  whatsapp: "(41) 99999-9999",
  taxa: "R$ 30,00",
  data_manutencao: "05/10/2026",
  horario_manutencao: "14:00",
};

