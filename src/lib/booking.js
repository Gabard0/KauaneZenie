export const digits = (t) => (t || "").replace(/\D/g, "");

export const maskTelefone = (v) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const toMin = (hhmm) => {
  if (!hhmm || !hhmm.includes(":")) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fromMin = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function horarioNaData(funcionamento, periodosEspeciais = [], dataISO) {
  if (!dataISO) return null;
  const wd = weekdayOf(dataISO);
  const ativos = (periodosEspeciais || []).filter(p =>
    p.data_inicio && p.data_fim && p.data_inicio <= dataISO && dataISO <= p.data_fim
  ).sort((a,b) => String(b.data_inicio).localeCompare(String(a.data_inicio)));
  return ativos.length
    ? (ativos[0].horarios || []).find(h => Number(h.dia) === wd) || null
    : (funcionamento?.horarios || []).find(h => Number(h.dia) === wd) || null;
}

const weekdayOf = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};

export const hojeLocalMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

export function slotsDoDia({ funcionamento, periodosEspeciais = [], excecoes = [], ocupados = [], dataISO, duracao, agoraMin = 0 }) {
  if (!dataISO) return [];
  if ((excecoes || []).some((e) => e.data === dataISO)) return [];
  const dia = horarioNaData(funcionamento, periodosEspeciais, dataISO);
  if (!dia || dia.ativo === false) return [];

  const periodos = (dia.periodos || [])
    .filter((p) => p.inicio && p.fim)
    .map((p) => ({ ini: toMin(p.inicio), fim: toMin(p.fim) }))
    .filter((p) => p.fim > p.ini);

  const total = Math.max(30, duracao || 30);
  const busy = (ocupados || [])
    .filter((o) => o.data === dataISO && o.horario)
    .map((o) => {
      const ini = toMin(o.horario);
      return { ini, fim: ini + (o.duracao > 0 ? o.duracao : 60) };
    });

  const slots = [];
  for (const p of periodos) {
    for (let t = p.ini; t + total <= p.fim; t += 30) {
      if (t < agoraMin) continue;
      if (busy.some((b) => t < b.fim && t + total > b.ini)) continue;
      slots.push(fromMin(t));
    }
  }
  return slots;
}

// Todos os horários do dia (livres e ocupados) para exibir os bloqueados desfocados
export function horariosDoDia({ funcionamento, periodosEspeciais = [], excecoes = [], ocupados = [], dataISO, duracao, agoraMin = 0 }) {
  if (!dataISO) return [];
  if ((excecoes || []).some((e) => e.data === dataISO)) return [];
  const dia = horarioNaData(funcionamento, periodosEspeciais, dataISO);
  if (!dia || dia.ativo === false) return [];

  const periodos = (dia.periodos || [])
    .filter((p) => p.inicio && p.fim)
    .map((p) => ({ ini: toMin(p.inicio), fim: toMin(p.fim) }))
    .filter((p) => p.fim > p.ini);

  const total = Math.max(30, duracao || 30);
  const busy = (ocupados || [])
    .filter((o) => o.data === dataISO && o.horario)
    .map((o) => {
      const ini = toMin(o.horario);
      return { ini, fim: ini + (o.duracao > 0 ? o.duracao : 60) };
    });

  const out = [];
  for (const p of periodos) {
    for (let t = p.ini; t + 30 <= p.fim; t += 30) {
      const passou = t < agoraMin;
      const livre = !passou && !busy.some((b) => t < b.fim && t + total > b.ini);
      out.push({ hora: fromMin(t), livre });
    }
  }
  return out;
}