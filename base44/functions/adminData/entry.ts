import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { exigirAdmin, comTravaAgenda } from "../../shared/auth.ts";
import { schemas } from "../../shared/adminSchemas.ts";
import { slotsDisponiveis, hojeSP, agoraMinSP } from "../../shared/agenda.ts";

function validar(nome, data) {
  const schema = schemas[nome];
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("dados_invalidos");
  for (const [key, value] of Object.entries(data)) {
    const rule = schema.properties[key];
    if (!rule || value === null || typeof value !== rule.type && !(rule.type === "array" && Array.isArray(value))) throw new Error("dados_invalidos");
    if (rule.enum && !rule.enum.includes(value)) throw new Error("dados_invalidos");
    if (rule.type === "number" && (!Number.isFinite(value) || value < 0)) throw new Error("dados_invalidos");
  }
  if (nome === "ConfigAgenda" && data.horarios) {
    for (const dia of data.horarios) {
      const periods = [...(dia.periodos || [])].sort((a,b) => a.inicio.localeCompare(b.inicio));
      for (let i=0; i<periods.length; i++) {
        const p = periods[i];
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.inicio) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.fim) || p.inicio >= p.fim || (i && periods[i-1].fim > p.inicio)) throw new Error("horarios_invalidos");
      }
    }
  }
  return data;
}

async function listar(entity, query, sort) {
  const result = [];
  for (let skip=0; ; skip+=500) {
    const page = query ? await entity.filter(query, sort, 500, skip) : await entity.list(sort, 500, skip);
    result.push(...page);
    if (page.length < 500) return result;
  }
}

async function garantirHorario(svc, data, id) {
  if (!data.horario || data.status === "cancelado") return;
  const [funcs, excs, ags] = await Promise.all([
    svc.entities.ConfigAgenda.filter({tipo:"funcionamento"}),
    svc.entities.ConfigAgenda.filter({tipo:"excecao"}),
    svc.entities.Agendamento.filter({data:data.data}),
  ]);
  const hoje = hojeSP();
  if (data.data < hoje) throw new Error("data_passada");
  const slots = slotsDisponiveis({funcionamento:funcs[0],excecoes:excs,ocupados:ags.filter(a=>a.id!==id && a.status!=="cancelado"),dataISO:data.data,duracao:data.duracao || 60,agoraMin:data.data===hoje?agoraMinSP():0});
  if (!slots.includes(data.horario)) throw new Error("horario_ocupado");
}

export default async function(req) {
  try {
    const svc = createClientFromRequest(req).asServiceRole;
    const p = await req.json();
    await exigirAdmin(svc, p.token);
    if (p.acao === "finalizar") return await comTravaAgenda(svc, async()=>{
      const ag = await svc.entities.Agendamento.get(p.id);
      if (!ag || ag.status === "cancelado") throw new Error("agendamento_invalido");
      const existentes = await svc.entities.Atendimento.filter({agendamento_id:p.id});
      const receita = existentes.find(a=>a.tipo_receita !== "taxa");
      const escolhido = p.servico_id && p.servico_id !== ag.servico_id ? await svc.entities.Servico.get(p.servico_id) : null;
      if (escolhido && escolhido.ativo === false) throw new Error("servico_inativo");
      if (!["pix","dinheiro","debito","credito","outro"].includes(p.forma_pagamento)) throw new Error("forma_pagamento_invalida");
      const v = Number(p.valor);
      if (!Number.isFinite(v) || v <= 0) throw new Error("valor_invalido");
      if (!receita) await svc.entities.Atendimento.create({cliente_id:ag.cliente_id,cliente_nome:ag.cliente_nome,agendamento_id:ag.id,servico_id:escolhido?.id || ag.servico_id || "",servico_nome:escolhido?.nome || ag.servico_nome || "",data:hojeSP(),valor:v,forma_pagamento:p.forma_pagamento,observacao:p.observacao || "",tipo_receita:"servico"});
      await svc.entities.Agendamento.update(ag.id,{status:"concluido"});
      return Response.json({ok:true});
    });
    if (!schemas[p.entidade]) throw new Error("entidade_invalida");
    const entity = svc.entities[p.entidade];
    const args = Array.isArray(p.args) ? p.args : [];
    if (p.metodo === "list") return Response.json({ok:true,result:await listar(entity,null,args[0])});
    if (p.metodo === "filter") return Response.json({ok:true,result:await listar(entity,args[0] || {},args[1])});
    if (p.metodo === "get") return Response.json({ok:true,result:await entity.get(args[0])});
    return await comTravaAgenda(svc, async()=>{
      let result;
      if (p.metodo === "create") {
        const data = validar(p.entidade,args[0]);
        if (p.entidade === "Agendamento") await garantirHorario(svc,data,null);
        for (const key of schemas[p.entidade].required || []) if (data[key]===undefined) throw new Error("dados_invalidos");
        result = await entity.create(data);
      } else if (p.metodo === "update") {
        const data = validar(p.entidade,args[1]);
        const old = await entity.get(args[0]);
        if (p.entidade === "Agendamento" && (data.data || data.horario || data.duracao)) await garantirHorario(svc,{...old,...data},old.id);
        if (p.entidade === "Agendamento" && data.status_pagamento === "pago" && old.tipo !== "manutencao") {
          if (old.status === "cancelado" || old.status_pagamento === "expirado") throw new Error("reserva_expirada");
          const rows = await svc.entities.Atendimento.filter({agendamento_id:old.id,tipo_receita:"taxa"});
          if (!rows.length && old.taxa_reserva > 0) await svc.entities.Atendimento.create({cliente_id:old.cliente_id,cliente_nome:old.cliente_nome,agendamento_id:old.id,servico_id:old.servico_id || "",servico_nome:old.servico_nome || "Taxa de reserva",data:hojeSP(),valor:old.taxa_reserva,forma_pagamento:"pix",tipo_receita:"taxa"});
        }
        result = await entity.update(args[0],data);
      } else if (p.metodo === "delete") result = await entity.delete(args[0]);
      else if (p.metodo === "deleteMany" && args[0]?.demo === true && Object.keys(args[0]).length===1) result = await entity.deleteMany({demo:true});
      else throw new Error("operacao_invalida");
      return Response.json({ok:true,result});
    });
  } catch (e) {
    return Response.json({ok:false,error:e.message || "erro_interno"},{status:e.message==="sessao_invalida"?401:409});
  }
}