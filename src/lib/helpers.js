export const LOGO_URL = "/brand/kauane-signature.jpg";

export const POLITICA_RESERVA = "A taxa de reserva não é reembolsável em caso de cancelamento ou não comparecimento. O valor do procedimento é pago no dia do atendimento.";

export const WHATSAPP_STUDIO = "41998047493";

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayISO = () => toISO(new Date());

export const formatBRL = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatData = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

export const dataLonga = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const dataMedia = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

export const diaCurto = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" });

export const mesAno = (iso) => {
  const [a, m] = iso.split("-").map(Number);
  const s = new Date(a, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const waLink = (telefone, msg) => {
  const digits = (telefone || "").replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : "55" + digits;
  return `https://wa.me/${full}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
};

export const idade = (iso) => {
  if (!iso) return null;
  const b = new Date(iso + "T00:00:00");
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
};

export const diasAteAniversario = (iso) => {
  if (!iso) return null;
  const now = new Date();
  const b = new Date(iso + "T00:00:00");
  const hoje0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
  if (next < hoje0) next = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next - hoje0) / 86400000);
};

export const STATUS = {
  agendado: { label: "Agendado", cls: "bg-foreground/10 text-foreground/80" },
  confirmado: { label: "Confirmado", cls: "bg-gold/20 text-gold" },
  concluido: { label: "Concluído", cls: "bg-primary text-primary-foreground border border-gold/40" },
  cancelado: { label: "Cancelado", cls: "bg-foreground/5 text-muted-foreground" },
  nao_compareceu: { label: "Não compareceu", cls: "bg-destructive/15 text-destructive" },
};

export const STATUS_PAGAMENTO = {
  pendente: { label: "Sem taxa", cls: "" },
  aguardando_comprovante: { label: "Aguardando comprovante", cls: "bg-amber-400/20 text-amber-600 dark:text-amber-400" },
  pago: { label: "Taxa paga", cls: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  cancelado: { label: "Pagamento cancelado", cls: "bg-foreground/5 text-muted-foreground" },
  expirado: { label: "Reserva expirada", cls: "bg-foreground/5 text-muted-foreground" },
};

export const FORMAS = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito: "Crédito",
  outro: "Outro",
};

import React from "react";

export const Carregando = () =>
  React.createElement(
    "div",
    { className: "flex items-center justify-center py-20" },
    React.createElement("div", {
      className: "w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin",
    })
  );

