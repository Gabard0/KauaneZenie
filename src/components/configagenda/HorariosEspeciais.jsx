import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, CalendarRange, AlertTriangle } from "lucide-react";
import DiaFuncionamento from "@/components/configagenda/DiaFuncionamento";

const SEMANA = [1,2,3,4,5,6,0];
const NOMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const diasVazios = () => SEMANA.map(dia=>({dia,ativo:false,periodos:[]}));
const padrao = () => ({data_inicio:"",data_fim:"",horarios:diasVazios()});
const isoOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s+"T12:00:00").getTime());
const horaOk = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(s || "");
function validar(form, existentes, editId) {
  if (!isoOk(form.data_inicio) || !isoOk(form.data_fim) || form.data_fim < form.data_inicio) return "Informe datas válidas, com término após o início.";
  if (existentes.some(p=>p.id!==editId && p.data_inicio<=form.data_fim && p.data_fim>=form.data_inicio))
    return "Já existe um horário especial nesse intervalo. Edite o período existente ou escolha datas sem sobreposição.";
  if (!(form.horarios||[]).some(h=>h.ativo)) return "Ative pelo menos um dia de atendimento.";
  for(const d of form.horarios||[]) {
    if (!d.ativo) continue;
    const ps=[...(d.periodos||[])].sort((a,b)=>a.inicio.localeCompare(b.inicio));
    if(!ps.length) return "Adicione horários em "+NOMES[d.dia]+".";
    if(ps.some((p,i)=>!horaOk(p.inicio)||!horaOk(p.fim)||p.inicio>=p.fim||(i>0&&ps[i-1].fim>p.inicio)))
      return "Corrija os horários inválidos ou sobrepostos em "+NOMES[d.dia]+".";
  }
  return "";
}
export default function HorariosEspeciais() {
  const [periodos,setPeriodos]=useState([]);
  const [form,setForm]=useState(null);
  const [editId,setEditId]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [erro,setErro]=useState("");
  const [sucesso,setSucesso]=useState("");
  const carregar=async()=>{
    setLoading(true);setErro("");
    try {
      const rows=await base44.entities.ConfigAgenda.filter({tipo:"periodo"});
      setPeriodos((rows||[]).sort((a,b)=>a.data_inicio.localeCompare(b.data_inicio)));
    } catch { setErro("Não foi possível consultar os horários especiais."); }
    finally { setLoading(false); }
  };
  useEffect(()=>{carregar();},[]);
  const novo=()=>{setForm(padrao());setEditId(null);setErro("");setSucesso("");};
  const editar=p=>{
    setForm({data_inicio:p.data_inicio,data_fim:p.data_fim,horarios:SEMANA.map(dia=>p.horarios?.find(h=>Number(h.dia)===dia)||{dia,ativo:false,periodos:[]})});
    setEditId(p.id);setErro("");setSucesso("");
  };
  const salvar=async()=>{
    const msg=validar(form,periodos,editId);
    if(msg){setErro(msg);return;}
    setSaving(true);setErro("");setSucesso("");
    try {
      const payload={tipo:"periodo",data_inicio:form.data_inicio,data_fim:form.data_fim,horarios:form.horarios};
      if(editId) await base44.entities.ConfigAgenda.update(editId,payload);
      else await base44.entities.ConfigAgenda.create(payload);
      setForm(null);setEditId(null);setSucesso("Período especial salvo. O link público já pode utilizar esses horários.");
      await carregar();
    } catch {setErro("Falha ao salvar o período especial. Nenhuma confirmação foi registrada.");}
    finally {setSaving(false);}
  };
  const excluir=async(p)=>{
    if(!window.confirm("Excluir o período especial de "+p.data_inicio+" até "+p.data_fim+"? Os agendamentos existentes serão preservados."))return;
    setSaving(true);setErro("");setSucesso("");
    try{
      await base44.entities.ConfigAgenda.delete(p.id);
      if(editId===p.id){setForm(null);setEditId(null);}
      setSucesso("Período removido. O horário semanal volta a valer nessas datas.");
      await carregar();
    }catch{setErro("Não foi possível excluir esse período.");}
    finally{setSaving(false);}
  };
  const setDia=(dia,valor)=>setForm(f=>({...f,horarios:f.horarios.map(d=>d.dia===dia?valor:d)}));
  const formatar=iso=>iso?.split("-").reverse().join("/")||"";
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Crie horários exclusivos para dezembro, feriados ou qualquer intervalo. Eles substituem a semana normal apenas nas datas selecionadas; folgas bloqueadas continuam fechadas.</p>
    {erro&&<p role="alert" className="animate-field-shake rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
    {sucesso&&<p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">{sucesso}</p>}
    {loading?<p className="text-sm text-muted-foreground">Carregando períodos...</p>:periodos.length===0?<p className="text-sm rounded-xl border border-dashed p-4 text-muted-foreground">Nenhum período especial cadastrado.</p>:
      <div className="space-y-2">{periodos.map(p=><div key={p.id} className="flex flex-wrap items-center gap-2 rounded-2xl border p-3 bg-background/70">
        <CalendarRange className="w-5 h-5 text-gold shrink-0"/>
        <div className="min-w-0 flex-1"><p className="font-medium text-sm">{formatar(p.data_inicio)} a {formatar(p.data_fim)}</p><p className="text-xs text-muted-foreground">{(p.horarios||[]).filter(h=>h.ativo).length} dias da semana ativos</p></div>
        <Button size="sm" variant="outline" onClick={()=>editar(p)}>Editar</Button>
        <Button size="icon" variant="ghost" aria-label="Excluir período" disabled={saving} onClick={()=>excluir(p)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
      </div>)}</div>}
    {!form?<Button type="button" variant="outline" className="h-12 w-full sm:w-auto" onClick={novo}><Plus className="w-4 h-4 mr-2"/>Novo período especial</Button>:
      <div className="rounded-2xl border border-gold/30 p-3 sm:p-5 space-y-4">
        <h3 className="font-semibold">{editId?"Editar período especial":"Novo período especial"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="especial-inicio">Data inicial</Label><Input id="especial-inicio" type="date" className="h-12" value={form.data_inicio} onChange={e=>setForm(f=>({...f,data_inicio:e.target.value}))}/></div>
          <div className="space-y-1.5"><Label htmlFor="especial-fim">Data final</Label><Input id="especial-fim" type="date" className="h-12" value={form.data_fim} onChange={e=>setForm(f=>({...f,data_fim:e.target.value}))}/></div>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground"><AlertTriangle className="w-4 h-4 shrink-0"/>Dias desativados neste período ficam fechados, mesmo que estejam ativos na semana normal.</div>
        <div className="space-y-2">{form.horarios.map(d=><DiaFuncionamento key={d.dia} dia={d} label={NOMES[d.dia]} onChange={v=>setDia(d.dia,v)}/>)}</div>
        <div className="flex flex-wrap gap-2">
          <Button className="h-12 flex-1 sm:flex-none" disabled={saving} onClick={salvar}><Save className="w-4 h-4 mr-2"/>{saving?"Salvando...":"Salvar período"}</Button>
          <Button className="h-12" variant="outline" disabled={saving} onClick={()=>{setForm(null);setErro("");}}>Cancelar</Button>
        </div>
      </div>}
  </div>;
}