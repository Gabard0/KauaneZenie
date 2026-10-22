export function hojeSP() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function agoraMinSP() {
  const hm = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const parts = hm.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function isoSP(d) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t) => (parts.find((p) => p.type === t) || {}).value || "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

export function agoraISO_SP() {
  return isoSP(new Date());
}

export function expiraEmISO_SP(min) {
  return isoSP(new Date(Date.now() + (min || 15) * 60000));
}

export function digits(t) {
  return (t || "").replace(/\D/g, "");
}

export function maskTelefone(v) {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? "(" + d : "";
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

function toMin(hhmm) {
  if (!hhmm || hhmm.indexOf(":") === -1) return 0;
  const parts = hhmm.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function fromMin(m) {
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

export function weekdayOf(dataISO) {
  const parts = dataISO.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
}

// Um período especial substitui o horário semanal apenas nas datas selecionadas.
// Bloqueios de dia inteiro continuam prevalecendo sobre qualquer período.
export function horarioNaData(funcionamento, periodosEspeciais = [], dataISO) {
  if (!dataISO) return null;
  const wd = weekdayOf(dataISO);
  const aplicaveis = (periodosEspeciais || []).filter((p) =>
    p.data_inicio && p.data_fim && p.data_inicio <= dataISO && p.data_fim >= dataISO
  );
  // Regras legadas sobrepostas: período mais recente por data de início prevalece.
  aplicaveis.sort((a,b) => String(b.data_inicio).localeCompare(String(a.data_inicio)) ||
    String(b.created_date || b.id || "").localeCompare(String(a.created_date || a.id || "")));
  const especial = aplicaveis[0];
  if (especial) return (especial.horarios || []).find(h => Number(h.dia) === wd) || null;
  return (funcionamento?.horarios || []).find(h => Number(h.dia) === wd) || null;
}

export function slotsDisponiveis(args) {
  const funcionamento = args.funcionamento;
  const periodosEspeciais = args.periodosEspeciais || [];
  const excecoes = args.excecoes || [];
  const ocupados = args.ocupados || [];
  const dataISO = args.dataISO;
  const duracao = Math.max(30, args.duracao || 30);
  const agoraMin = args.agoraMin || 0;

  if (!dataISO) return [];
  if (excecoes.some((e) => e.data === dataISO)) return [];
  const dia = horarioNaData(funcionamento, periodosEspeciais, dataISO);
  if (!dia || dia.ativo === false) return [];

  const periodos = (dia.periodos || [])
    .filter((p) => p.inicio && p.fim)
    .map((p) => ({ ini: toMin(p.inicio), fim: toMin(p.fim) }))
    .filter((p) => p.fim > p.ini);

  const busy = ocupados
    .filter((o) => o.data === dataISO && o.horario)
    .map((o) => {
      const ini = toMin(o.horario);
      return { ini, fim: ini + (o.duracao > 0 ? o.duracao : 60) };
    });

  const slots = [];
  for (const p of periodos) {
    for (let t = p.ini; t + duracao <= p.fim; t += 30) {
      if (t < agoraMin) continue;
      if (busy.some((b) => t < b.fim && t + duracao > b.ini)) continue;
      slots.push(fromMin(t));
    }
  }
  return [...new Set(slots)];
}

export function addDays(iso, n) {
  const parts = iso.split("-").map(Number);
  const dt = new Date(parts[0], parts[1] - 1, parts[2] + n);
  return (
    dt.getFullYear() +
    "-" +
    String(dt.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dt.getDate()).padStart(2, "0")
  );
}

// Cancela reservas temporárias expiradas (aguardando comprovante, sem comprovante
// enviado e com prazo vencido). Cancela também a manutenção vinculada. Retorna
// a quantidade de reservas expiradas.
export async function expirarReservasAguardando(svc) {
  const agora = agoraISO_SP();
  const candidatos = await svc.entities.Agendamento.filter({
    status_pagamento: "aguardando_comprovante",
    status: { $ne: "cancelado" },
  });
  const expirados = candidatos.filter(
    (a) => a.reserva_expira_em && a.reserva_expira_em <= agora
  );
  for (const a of expirados) {
    try {
      await svc.entities.Agendamento.update(a.id, {
        status: "cancelado",
        status_pagamento: "expirado",
      });
    } catch (e) {}
    if (a.manutencao_vinculada_id) {
      try {
        await svc.entities.Agendamento.update(a.manutencao_vinculada_id, {
          status: "cancelado",
          status_pagamento: "expirado",
        });
      } catch (e) {}
    }
  }
  return expirados.length;
}

// Cria ou recalcula a manutenção automática vinculada a um atendimento principal.
// Retorna { data, horario, servico_nome, status } ou null quando o procedimento
// não gera manutenção.
export async function criarManutencaoPara({ svc, principal, servicos, funcionamento, periodosEspeciais = [], excecoes, hoje }) {
  const configs = await svc.entities.ConfigApp.list();
  if (configs[0]?.manutencao_automatica === false) return null;
  const svcConfig = servicos.find((s) => s.id === principal.servico_id);
  if (!svcConfig || !svcConfig.gera_manutencao || !svcConfig.manutencao_servico_id) return null;
  const svcManut = servicos.find((s) => s.id === svcConfig.manutencao_servico_id);
  if (!svcManut || svcManut.gera_manutencao) return null;

  const intervalo = svcConfig.intervalo_manutencao > 0 ? svcConfig.intervalo_manutencao : 20;
  const dataManut = addDays(principal.data, intervalo);
  const durManut = svcManut.duracao > 0 ? svcManut.duracao : 60;

  const agsM = await svc.entities.Agendamento.filter({
    data: dataManut,
    status: { $ne: "cancelado" },
  });
  const duracaoPorServico = {};
  for (const s of servicos) duracaoPorServico[s.id] = s.duracao > 0 ? s.duracao : 60;
  const manutId = principal.manutencao_vinculada_id || "";
  const ocupadosM = agsM
    .filter((a) => a.horario && a.id !== manutId)
    .map((a) => ({
      data: a.data,
      horario: a.horario,
      duracao: a.duracao > 0 ? a.duracao : duracaoPorServico[a.servico_id] || 60,
    }));
  const agoraMinM = dataManut === hoje ? agoraMinSP() : 0;
  const slotsM = slotsDisponiveis({
    funcionamento,
    periodosEspeciais,
    excecoes,
    ocupados: ocupadosM,
    dataISO: dataManut,
    duracao: durManut,
    agoraMin: agoraMinM,
  });

  let horarioManut = "";
  let statusManut = "aguardando_horario";
  if (slotsM.length) {
    horarioManut = slotsM.indexOf(principal.horario) !== -1 ? principal.horario : (slotsM.find((h) => h >= principal.horario) || slotsM[0]);
    statusManut = "agendada";
  }
  const manutNome = "Manutenção — " + svcManut.nome;
  const statusPagamento = principal.status_pagamento || "pendente";

  if (manutId) {
    await svc.entities.Agendamento.update(manutId, {
      data: dataManut,
      horario: horarioManut,
      duracao: durManut,
      manutencao_status: statusManut,
      servico_nome: manutNome,
      status_pagamento: statusPagamento,
    });
  } else {
    const criado = await svc.entities.Agendamento.create({
      cliente_id: principal.cliente_id,
      cliente_nome: principal.cliente_nome,
      servico_id: svcManut.id,
      servico_nome: manutNome,
      data: dataManut,
      horario: horarioManut,
      status: "agendado",
      origem: principal.origem || "manual",
      duracao: durManut,
      valor: 0,
      tipo: "manutencao",
      agendamento_principal_id: principal.id,
      manutencao_status: statusManut,
      status_pagamento: statusPagamento,
      observacao: "Manutenção automática",
    });
    await svc.entities.Agendamento.update(principal.id, {
      manutencao_vinculada_id: criado.id,
    });
  }

  return { data: dataManut, horario: horarioManut, servico_nome: manutNome, status: statusManut };
}