import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { exigirAdmin, comTravaAgenda } from "../../shared/auth.ts";
import { hojeSP, agoraMinSP, slotsDisponiveis } from "../../shared/agenda.ts";
const digits = (v) => String(v || "").replace(/\D/g, "");
function out(value, status=200) { return Response.json(value, {status}); }
export default async function(req) {
  try {
    const svc = createClientFromRequest(req).asServiceRole;
    const p = await req.json();
    if (p.acao === "inscrever") {
      const nome = String(p.nome || "").trim().slice(0,80);
      let tel = digits(p.whatsapp);
      if (tel.length > 11 && tel.startsWith("55")) tel = tel.slice(2);
      const data = String(p.data || "");
      const ids = Array.isArray(p.servico_ids) ? [...new Set(p.servico_ids.map(String))].slice(0,8) : [];
      if (nome.length < 2 || tel.length < 10 || tel.length > 11 || !/^\d{4}-\d{2}-\d{2}$/.test(data) || data < hojeSP() || !ids.length) return out({ok:false,error:"dados_invalidos"},400);
      const [services,cfg,funcs,excs,ags] = await Promise.all([svc.entities.Servico.list(),svc.entities.ConfigApp.list(),svc.entities.ConfigAgenda.filter({tipo:"funcionamento"}),svc.entities.ConfigAgenda.filter({tipo:"excecao"}),svc.entities.Agendamento.filter({data,status:{$ne:"cancelado"}})]);
      const limit = Math.min(365,Math.max(1,cfg[0]?.limite_agendamento_dias || 180));
      const h=hojeSP().split("-").map(Number); const dtMax=new Date(h[0],h[1]-1,h[2]+limit); const max=dtMax.getFullYear()+"-"+String(dtMax.getMonth()+1).padStart(2,"0")+"-"+String(dtMax.getDate()).padStart(2,"0");
      if(data > max) return out({ok:false,error:"data_fora_limite"},400);
      const chosen=ids.map(id=>services.find(s=>s.id===id && s.ativo!==false));
      if(chosen.some(s=>!s)) return out({ok:false,error:"servico_invalido"},400);
      const duration=chosen.reduce((t,s)=>t+(s.duracao>0?s.duracao:60),0);
      const wd = new Date(data+"T12:00:00").getDay();
      const day=(funcs[0]?.horarios || []).find(d=>Number(d.dia)===wd);
      if(!day || day.ativo===false || !(day.periodos||[]).some(v=>v.inicio<v.fim) || excs.some(e=>e.data===data)) return out({ok:false,error:"dia_fechado"},409);
      const available=slotsDisponiveis({funcionamento:funcs[0],excecoes:excs,dataISO:data,duracao:duration,ocupados:ags,agoraMin:data===hojeSP()?agoraMinSP():0});
      if(available.length) return out({ok:false,error:"horarios_disponiveis"},409);
      return await comTravaAgenda(svc,async()=>{
        const previous=await svc.entities.ListaEspera.filter({data,whatsapp:tel,status:"aguardando"});
        if(previous.some(a=>JSON.stringify([...a.servico_ids].sort())===JSON.stringify([...ids].sort()))) return out({ok:true,duplicada:true});
        await svc.entities.ListaEspera.create({nome,whatsapp:tel,data,servico_ids:ids,servicos_nome:chosen.map(s=>s.nome).join(" + "),duracao:duration,status:"aguardando",criado_em:new Date().toISOString()});
        return out({ok:true});
      });
    }
    await exigirAdmin(svc,p.token);
    if (p.acao === "listar") {
      const rows=await svc.entities.ListaEspera.list("-created_date",500);
      return out({ok:true,registros:rows});
    }
    if (p.acao === "status") {
      if(!["contatada","atendida","cancelada","aguardando"].includes(p.status)) return out({ok:false,error:"status_invalido"},400);
      const row=await svc.entities.ListaEspera.get(p.id);
      if(!row) return out({ok:false,error:"nao_encontrado"},404);
      await svc.entities.ListaEspera.update(row.id,{status:p.status,...(p.status==="contatada"?{contatada_em:new Date().toISOString()}: {})});
      return out({ok:true});
    }
    return out({ok:false,error:"acao_invalida"},400);
  }catch(e){return out({ok:false,error:e.message==="sessao_invalida"?"sessao_invalida":"erro_interno"},500);}
}