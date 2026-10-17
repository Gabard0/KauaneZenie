import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { MENSAGEM_PADRAO, carregarConfig, exigirAdmin } from "../../shared/auth.ts";

function erro(msg) {
  return Response.json({ ok: false, error: msg });
}

const temaNormalizado = (t) => (t === "rose" || t === "feminino" ? "rose" : "barbozza");
const modoNormalizado = (m) => (m === "escuro" ? "escuro" : "claro");

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

    const acao = String(payload.acao || "");
    const cfg = await exigirAdmin(svc, payload.token);

    if (acao === "ler") {
      return Response.json({
        ok: true,
        tema: temaNormalizado(cfg.tema),
        modo: modoNormalizado(cfg.modo),
        whatsapp: cfg.whatsapp || "4185250785",
        mensagem_whatsapp: cfg.mensagem_whatsapp || MENSAGEM_PADRAO,
        exigir_taxa: cfg.exigir_taxa !== false,
        taxa_agendamento: cfg.taxa_agendamento > 0 ? cfg.taxa_agendamento : 30,
        pix_qr_code_url: cfg.pix_qr_code_url || "",
        pix_copia_cola: cfg.pix_copia_cola || "",
        whatsapp_comprovantes: cfg.whatsapp_comprovantes || "41985250785",
        tempo_reserva_minutos: cfg.tempo_reserva_minutos > 0 ? cfg.tempo_reserva_minutos : 15,
      });
    }

    if (acao === "salvar") {
      const dados = {};
      if (payload.tema !== undefined) dados.tema = temaNormalizado(payload.tema);
      if (payload.modo !== undefined) dados.modo = modoNormalizado(payload.modo);
      if (typeof payload.whatsapp === "string") {
        const d = payload.whatsapp.replace(/\D/g, "").slice(0, 13);
        if (d.length >= 10 && d.length <= 13) dados.whatsapp = d;
        else if (payload.whatsapp === "") return erro("whatsapp_invalido");
      }
      if (typeof payload.mensagem_whatsapp === "string") {
        if (payload.mensagem_whatsapp.trim().length < 5) return erro("mensagem_invalida");
        if (payload.mensagem_whatsapp.length > 1500) return erro("mensagem_invalida");
        dados.mensagem_whatsapp = payload.mensagem_whatsapp;
      }
      if (payload.exigir_taxa !== undefined) dados.exigir_taxa = payload.exigir_taxa === true;
      if (payload.taxa_agendamento !== undefined) {
        const t = Number(payload.taxa_agendamento);
        if (!isNaN(t) && t >= 0) dados.taxa_agendamento = t;
      }
      if (typeof payload.pix_qr_code_url === "string") dados.pix_qr_code_url = payload.pix_qr_code_url;
      if (typeof payload.pix_copia_cola === "string") dados.pix_copia_cola = payload.pix_copia_cola;
      if (typeof payload.whatsapp_comprovantes === "string") {
        const d = payload.whatsapp_comprovantes.replace(/\D/g, "").slice(0, 13);
        if (d.length >= 10 && d.length <= 13) dados.whatsapp_comprovantes = d;
        else if (payload.whatsapp_comprovantes === "") dados.whatsapp_comprovantes = "";
      }
      if (payload.tempo_reserva_minutos !== undefined) {
        const t = Number(payload.tempo_reserva_minutos);
        if (!isNaN(t) && t > 0) dados.tempo_reserva_minutos = t;
      }
      if (Object.keys(dados).length === 0) return erro("nada_para_salvar");

      await svc.entities.ConfigApp.update(cfg.id, dados);
      return Response.json({ ok: true, ...dados });
    }

    return erro("acao_invalida");
  } catch (error) {
    return Response.json({ ok: false, error: error.message === "sessao_invalida" ? "sessao_invalida" : "erro_interno" }, { status: error.message === "sessao_invalida" ? 401 : 500 });
  }
}
