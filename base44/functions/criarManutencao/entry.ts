import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { exigirAdmin, comTravaAgenda } from "../../shared/auth.ts";
import { hojeSP, criarManutencaoPara } from "../../shared/agenda.ts";

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
    const cfg = await exigirAdmin(svc, payload.token);
    if (cfg.manutencao_automatica === false) return Response.json({ ok: true, manutencao: null, desativada: true });
    return await comTravaAgenda(svc, async () => {
    const principalId = String(payload.agendamento_principal_id || "");
    if (!principalId) return Response.json({ ok: false, error: "dados_invalidos" });

    const [principal, servicos, funcionamentos, excecoesRecs, especiais] = await Promise.all([
      svc.entities.Agendamento.get(principalId),
      svc.entities.Servico.list(),
      svc.entities.ConfigAgenda.filter({ tipo: "funcionamento" }),
      svc.entities.ConfigAgenda.filter({ tipo: "excecao" }),
      svc.entities.ConfigAgenda.filter({ tipo: "periodo" }),
    ]);
    const excecoes = excecoesRecs.map((e) => ({ data: e.data, motivo: e.motivo || "" }));

    const manutencao = await criarManutencaoPara({
      svc,
      principal,
      servicos,
      funcionamento: funcionamentos[0] || null,
      periodosEspeciais: especiais,
      excecoes,
      hoje: hojeSP(),
    });
    if (!manutencao) return Response.json({ ok: false, error: "sem_manutencao" });

    return Response.json({ ok: true, manutencao });
    });
  } catch (error) {
    return Response.json({ ok: false, error: "erro_interno" }, { status: 500 });
  }
}
