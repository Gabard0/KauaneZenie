import React,{useEffect,useMemo,useState} from "react";
import { base44 } from "@/api/base44Client";
import { getToken } from "@/lib/adminAuth";
import { slotsDoDia, hojeLocalMin } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageCircle } from "lucide-react";

export default function ListaEspera(){
  const [registros,setRegistros]=useState([]);
  const [config,setConfig]=useState(null);
  const [loading,setLoading]=useState(false);
  const [erro,setErro]=useState("");
  const carregar=async()=>{
    setLoading(true);setErro("");
    try{
      const [r,c]=await Promise.all([
        base44.functions.invoke("listaEspera",{acao:"listar",token:getToken()}),
        base44.functions.invoke("getBookingConfig",{})
      ]);
      if(!r.data?.ok) throw new Error("Não foi possível consultar a lista.");
      setRegistros(r.data.registros||[]);
      setConfig(c.data);
    }catch(e){setErro(e.message||"Erro de conexão");}
    finally{setLoading(false);}
  };
  useEffect(()=>{carregar();},[]);
  const ativos=useMemo(()=>registros.filter(r=>r.status==="aguardando"||r.status==="contatada").sort((a,b)=>String(a.criado_em||a.created_date||"").localeCompare(String(b.criado_em||b.created_date||""))),[registros]);
  const horarios=(r)=>slotsDoDia({funcionamento:config?.funcionamento,periodosEspeciais:config?.periodosEspeciais||[],excecoes:config?.excecoes||[],ocupados:config?.ocupados||[],dataISO:r.data,duracao:r.duracao||60,agoraMin:r.data===new Date().toLocaleDateString("en-CA")?hojeLocalMin():0});
  const status=async(r,novo)=>{
    try{const x=await base44.functions.invoke("listaEspera",{acao:"status",token:getToken(),id:r.id,status:novo});if(!x.data?.ok)throw new Error("Falha ao salvar");setRegistros(a=>a.map(v=>v.id===r.id?{...v,status:novo}:v));}
    catch{setErro("Não foi possível atualizar o status.");}
  };
  const chamar=(r,slots)=>{
    const msg="Olá, "+r.nome+"! 💕 Aqui é a Kauane Zenie. Surgiu uma possível vaga no dia "+r.data.split("-").reverse().join("/")+" ("+slots.slice(0,3).join(", ")+") para "+r.servicos_nome+". Tem interesse? O horário só será reservado após confirmarmos. ✨";
    window.open("https://wa.me/55"+r.whatsapp.replace(/\D/g,"")+"?text="+encodeURIComponent(msg),"_blank","noopener,noreferrer");
    status(r,"contatada");
  };
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-3 items-center justify-between"><div><h1 className="font-heading text-2xl">Lista de espera</h1><p className="text-sm text-muted-foreground">Clientes interessadas em dias lotados, por ordem de inscrição.</p></div><Button variant="outline" onClick={carregar} disabled={loading}><RefreshCw className="w-4 h-4 mr-2"/>Atualizar vagas</Button></div>
    {erro&&<p role="alert" className="text-destructive text-sm">{erro}</p>}
    {loading?<p className="text-muted-foreground">Consultando lista e agenda...</p>:ativos.length===0?<div className="bg-card rounded-2xl border p-6 text-center text-muted-foreground">Nenhuma cliente aguardando no momento.</div>:ativos.map(r=>{
      const slots=horarios(r);
      return <section key={r.id} className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{r.nome}</p><p className="text-xs text-muted-foreground">{r.whatsapp} · {r.servicos_nome}</p></div><span className="text-sm font-medium text-gold">{r.data.split("-").reverse().join("/")}</span></div>
        <p className="text-sm">{slots.length?<><span className="text-emerald-600 font-semibold">Vaga encontrada:</span> {slots.slice(0,4).join(", ")}{slots.length>4?"…":""}</>:"Nenhum horário livre compatível no momento."}</p>
        <div className="flex flex-wrap gap-2"><Button disabled={!slots.length} onClick={()=>chamar(r,slots)}><MessageCircle className="w-4 h-4 mr-2"/>Chamar no WhatsApp</Button><Button variant="outline" onClick={()=>status(r,"atendida")}>Resolvida</Button><Button variant="ghost" onClick={()=>status(r,"cancelada")}>Remover</Button></div>
        <p className="text-xs text-muted-foreground">O contato não reserva a vaga. Confirme e crie o agendamento na Agenda para bloquear o horário.</p>
      </section>;
    })}
  </div>;
}