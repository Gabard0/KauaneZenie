const POLITICA_RESERVA = "A taxa de reserva não é reembolsável em caso de cancelamento ou não comparecimento. O valor do procedimento é pago no dia do atendimento.";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { hojeSP, expirarReservasAguardando } from "../../shared/agenda.ts";
import { MENSAGEM_PADRAO, comTravaAgenda } from "../../shared/auth.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const hoje = hojeSP();

    // Libera horários de reservas temporárias vencidas antes de montar a agenda
    await comTravaAgenda(svc, () => expirarReservasAguardando(svc));

    const resultados = await Promise.all([
      svc.entities.Servico.filter({ ativo: true }),
      svc.entities.ConfigAgenda.filter({ tipo: "funcionamento" }),
      svc.entities.ConfigAgenda.filter({ tipo: "excecao" }),
      svc.entities.ConfigAgenda.filter({ tipo: "periodo" }),
      svc.entities.Agendamento.filter({ data: { $gte: hoje }, status: { $ne: "cancelado" } }),
      svc.entities.ConfigApp.list(),
    ]);
    const servicos = resultados[0];
    const funcionamentos = resultados[1];
    const excecoesRecs = resultados[2];
    const especiais = resultados[3];
    const ags = resultados[4];
    const cfg = resultados[5][0] || null;

    const duracaoPorServico = {};
    for (const s of servicos) duracaoPorServico[s.id] = s.duracao > 0 ? s.duracao : 60;

    const ocupados = ags
      .filter((a) => a.horario)
      .map((a) => ({
        data: a.data,
        horario: a.horario,
        duracao: a.duracao > 0 ? a.duracao : duracaoPorServico[a.servico_id] || 60,
      }));

    const exigirTaxa = cfg ? cfg.exigir_taxa !== false : true;
    const taxa = cfg && cfg.taxa_agendamento > 0 ? cfg.taxa_agendamento : 30;

    return Response.json({
      politica_reserva: cfg?.politica_reserva || POLITICA_RESERVA,
      manutencao_automatica: cfg?.manutencao_automatica !== false,
      limite_agendamento_dias: Number.isInteger(cfg?.limite_agendamento_dias) && cfg.limite_agendamento_dias >= 1 && cfg.limite_agendamento_dias <= 365 ? cfg.limite_agendamento_dias : 60,
      servicos: servicos
        .filter((s) => s.ativo !== false)
        .map((s) => ({
          id: s.id,
          nome: s.nome,
          preco: s.preco || 0,
          duracao: s.duracao > 0 ? s.duracao : 60,
          gera_manutencao: cfg?.manutencao_automatica !== false && s.gera_manutencao === true,
          manutencao_servico_id: s.manutencao_servico_id || "",
          intervalo_manutencao: s.intervalo_manutencao > 0 ? s.intervalo_manutencao : 20,
        })),
      funcionamento: funcionamentos[0] || null,
      periodosEspeciais: especiais.map(p => ({ id:p.id, data_inicio:p.data_inicio, data_fim:p.data_fim, horarios:p.horarios || [] })),
      excecoes: excecoesRecs.map((e) => ({ data: e.data, motivo: e.motivo || "" })),
      ocupados,
      whatsapp_profissional: (cfg && cfg.whatsapp) || "41998047493",
      mensagem_whatsapp: (cfg && cfg.mensagem_whatsapp) || MENSAGEM_PADRAO,
      pagamento: exigirTaxa
        ? {
            exigir_taxa: true,
            taxa,
            pix_qr_code_url: (cfg && cfg.pix_qr_code_url) || "",
            pix_copia_cola: (cfg && cfg.pix_copia_cola) || "",
            whatsapp_comprovantes: (cfg && cfg.whatsapp_comprovantes) || (cfg && cfg.whatsapp) || "41998047493",
            tempo_reserva_minutos: (cfg && cfg.tempo_reserva_minutos > 0 ? cfg.tempo_reserva_minutos : 15),
          }
        : { exigir_taxa: false, taxa, pix_qr_code_url: "", pix_copia_cola: "", whatsapp_comprovantes: "", tempo_reserva_minutos: 15 },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

