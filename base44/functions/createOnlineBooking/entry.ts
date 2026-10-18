import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { comTravaAgenda } from "../../shared/auth.ts";
import {
  hojeSP,
  agoraMinSP,
  slotsDisponiveis,
  digits,
  maskTelefone,
  criarManutencaoPara,
  expiraEmISO_SP,
  expirarReservasAguardando,
} from "../../shared/agenda.ts";

function invalido() {
  return Response.json({ ok: false, error: "dados_invalidos" });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    let payload = {};
    try {
      payload = await req.json();
    } catch (e) {
      payload = {};
    }

    return await comTravaAgenda(svc, async () => {
    await expirarReservasAguardando(svc);
    const nome = String(payload.nome || "").trim();
    const whatsBruto = digits(payload.whatsapp);
    const whatsapp =
      whatsBruto.length > 11 && whatsBruto.startsWith("55")
        ? whatsBruto.slice(2)
        : whatsBruto;
    const servicoIds = Array.isArray(payload.servico_ids)
      ? payload.servico_ids.slice(0, 10).map((id) => String(id))
      : [];
    const data = String(payload.data || "");
    const horario = String(payload.horario || "");
    const nascimento = String(payload.data_nascimento || "");

    if (nome.length < 2 || nome.length > 80) return invalido();
    if (whatsapp.length < 10 || whatsapp.length > 11) return invalido();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return invalido();
    if (!/^\d{2}:\d{2}$/.test(horario)) return invalido();
    if (!servicoIds.length || new Set(servicoIds).size !== servicoIds.length) return invalido();

    const hoje = hojeSP();
    if (data < hoje) return invalido();
    const nascimentoOK =
      /^\d{4}-\d{2}-\d{2}$/.test(nascimento) &&
      nascimento > "1900-01-01" &&
      nascimento < hoje
        ? nascimento
        : "";
    const h = hoje.split("-").map(Number);
    const limite = new Date(h[0], h[1] - 1, h[2] + 60);
    const limiteISO =
      limite.getFullYear() +
      "-" +
      String(limite.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(limite.getDate()).padStart(2, "0");
    if (data > limiteISO) return invalido();

    const resultados = await Promise.all([
      svc.entities.Servico.list(),
      svc.entities.ConfigAgenda.filter({ tipo: "funcionamento" }),
      svc.entities.ConfigAgenda.filter({ tipo: "excecao" }),
      svc.entities.Agendamento.filter({ data, status: { $ne: "cancelado" } }),
      svc.entities.ConfigApp.list(),
    ]);
    const servicos = resultados[0];
    const funcionamentos = resultados[1];
    const excecoesRecs = resultados[2];
    const agsDoDia = resultados[3];
    const cfg = resultados[4][0] || null;

    const escolhidos = servicoIds
      .map((id) => servicos.find((s) => s.id === id && s.ativo !== false))
      .filter(Boolean);
    if (!escolhidos.length || escolhidos.length !== servicoIds.length)
      return invalido();

    const duracaoTotal = escolhidos.reduce(
      (t, s) => t + (s.duracao > 0 ? s.duracao : 60),
      0
    );
    const valorTotal = escolhidos.reduce((t, s) => t + (s.preco || 0), 0);

    const duracaoPorServico = {};
    for (const s of servicos) duracaoPorServico[s.id] = s.duracao > 0 ? s.duracao : 60;
    const ocupados = agsDoDia
      .filter((a) => a.horario)
      .map((a) => ({
        data: a.data,
        horario: a.horario,
        duracao: a.duracao > 0 ? a.duracao : duracaoPorServico[a.servico_id] || 60,
      }));
    const excecoes = excecoesRecs.map((e) => ({ data: e.data, motivo: e.motivo || "" }));
    const agoraMin = data === hoje ? agoraMinSP() : 0;
    const slots = slotsDisponiveis({
      funcionamento: funcionamentos[0] || null,
      excecoes,
      ocupados,
      dataISO: data,
      duracao: duracaoTotal,
      agoraMin,
    });
    if (slots.indexOf(horario) === -1) {
      return Response.json({ ok: false, error: "horario_ocupado" });
    }

    const clientes = await svc.entities.Cliente.list();
    const w9 = whatsapp.slice(-9);
    let cliente = clientes.find((c) => {
      const d = digits(c.telefone);
      return (d.startsWith("55") && d.length > 11 ? d.slice(2) : d) === whatsapp;
    });
    if (!cliente) {
      cliente = await svc.entities.Cliente.create({
        nome,
        telefone: maskTelefone(whatsapp),
        ...(nascimentoOK ? { data_nascimento: nascimentoOK } : {}),
      });
    } else if (nascimentoOK && !cliente.data_nascimento) {
      await svc.entities.Cliente.update(cliente.id, { data_nascimento: nascimentoOK });
    }

    const servicoNome = escolhidos.map((s) => s.nome).join(" + ");
    const exigirTaxa = cfg ? cfg.exigir_taxa !== false : true;
    const taxa = cfg && cfg.taxa_agendamento > 0 ? cfg.taxa_agendamento : 30;
    const tempoReserva = cfg && cfg.tempo_reserva_minutos > 0 ? cfg.tempo_reserva_minutos : 15;

    if (exigirTaxa && (!cfg?.pix_copia_cola || !cfg?.pix_qr_code_url)) {
      return Response.json({ ok: false, error: "pix_nao_configurado" }, { status: 409 });
    }
    const baseAgendamento = {
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      servico_id: escolhidos[0].id,
      servico_nome: servicoNome,
      data,
      horario,
      origem: "online",
      duracao: duracaoTotal,
      valor: valorTotal,
      observacao: "Agendamento Online",
    };

    let agCriado;
    if (exigirTaxa) {
      agCriado = await svc.entities.Agendamento.create({
        ...baseAgendamento,
        status: "agendado",
        status_pagamento: "aguardando_comprovante",
        taxa_reserva: taxa,
        reserva_expira_em: expiraEmISO_SP(tempoReserva),
        comprovante_enviado: false,
      });
    } else {
      agCriado = await svc.entities.Agendamento.create({
        ...baseAgendamento,
        status: "confirmado",
      });
    }

    // Manutenção automática vinculada (quando o procedimento principal gera)
    let manutencao = null;
    try {
      manutencao = await criarManutencaoPara({
        svc,
        principal: agCriado,
        servicos,
        funcionamento: funcionamentos[0] || null,
        excecoes,
        hoje,
      });
    } catch (e) {
      /* não bloqueia o agendamento principal */
    }

    const pagamento = exigirTaxa
      ? {
          exigir_taxa: true,
          taxa,
          pix_qr_code_url: (cfg && cfg.pix_qr_code_url) || "",
          pix_copia_cola: (cfg && cfg.pix_copia_cola) || "",
          whatsapp_comprovantes:
            (cfg && cfg.whatsapp_comprovantes) || (cfg && cfg.whatsapp) || "41998047493",
        }
      : null;

    return Response.json({
      ok: true,
      agendamento: {
        id: agCriado.id,
        cliente_nome: cliente.nome,
        servico_nome: servicoNome,
        data,
        horario,
        valor_total: valorTotal,
        duracao: duracaoTotal,
        taxa_reserva: exigirTaxa ? taxa : 0,
        status_pagamento: exigirTaxa ? "aguardando_comprovante" : "pendente",
      },
      manutencao,
      pagamento,
    });
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message === "agenda_ocupada" ? "horario_ocupado" : "erro_interno" }, { status: error.message === "agenda_ocupada" ? 409 : 500 });
  }
}

