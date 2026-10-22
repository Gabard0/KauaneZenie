import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminLerConfig, adminSalvarConfig } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, AlertCircle, ExternalLink } from "lucide-react";

const ITENS = [
  ["Política de privacidade","Página criada: descreve dados, finalidades, direitos e canal de solicitação.","feito"],
  ["Termos de serviço","Página pública disponível; a responsável precisa validar as condições comerciais.","verificar"],
  ["Aviso de cookies","Banner informativo e página; sem pixels opcionais no código atual.","feito"],
  ["Política de reembolso","Página e aviso de reserva criados; validar situações específicas.","verificar"],
  ["Formulários na LGPD","Registro da ciência de termos e escolha separada para aniversário.","feito"],
  ["Só dados necessários","Nome/WhatsApp para agenda, aniversário opcional com autorização.","feito"],
  ["Scripts de tracking","Nenhum pixel próprio de anúncios ou analytics inserido; revisar novas integrações antes de publicá-las.","feito"],
  ["Acessibilidade","Foco visível, navegação por teclado, links para conteúdo e redução de movimento; requer auditoria manual.","verificar"],
  ["Alt nas imagens","Textos alternativos e imagens decorativas marcadas; conferir cada novo upload.","verificar"],
  ["Contraste corrigido","Cores críticas revistas em estilo; validar com auditoria WCAG no site publicado.","verificar"],
  ["Navegação por teclado","Setas nos carrosséis, links acessíveis e foco; testar em navegadores reais.","verificar"],
  ["Sem avaliações falsas","A página utiliza apenas materiais de feedback já cadastrados; verificar origem e autorização de cada depoimento.","verificar"],
  ["Sem promessas falsas","Descrições moderadas e valores pendentes identificados; revisar ofertas e resultados anunciados.","verificar"],
  ["Copyright das imagens","Rodapé com aviso e contato para remoção; conferir cessão/autorização das pessoas fotografadas.","verificar"],
  ["Dados da empresa","Preencha nome empresarial e CNPJ abaixo, se houver, com dados oficiais.","pendente"],
  ["Conformidade LGPD","Controles implementados; exige avaliação de contratos, retenção e práticas operacionais.","verificar"],
  ["Riscos jurídicos","Revisar política comercial, publicidade, fotos, documentos e terceiros antes de vender/publicar.","verificar"]
];
export default function Conformidade() {
  const [form,setForm] = useState({nome_empresarial:"",cnpj:"",email_comercial:""});
  const [status,setStatus] = useState("Carregando dados comerciais...");
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  useEffect(()=>{
    adminLerConfig().then(d=>{
      if (!d.ok) throw Error("Falha ao buscar configurações");
      setForm({nome_empresarial:d.nome_empresarial||"",cnpj:d.cnpj||"",email_comercial:d.email_comercial||""});
      setStatus("");
    }).catch(()=>setStatus("Não foi possível consultar os dados. Atualize a página."))
      .finally(()=>setLoading(false));
  },[]);
  const change=(key,value)=>setForm(p=>({...p,[key]:value}));
  const salvar=async()=>{
    setStatus("");
    const cnpj=form.cnpj.replace(/\D/g,"");
    if(cnpj && cnpj.length!==14){setStatus("Informe um CNPJ com 14 dígitos, ou deixe em branco se não houver.");return;}
    setSaving(true);
    try{
      const r=await adminSalvarConfig({...form,cnpj});
      if(!r.ok) throw Error(r.error||"Falha ao salvar");
      setStatus("Identificação do estúdio salva. Os dados informados aparecem na Política de Privacidade.");
    }catch(e){setStatus("Não foi possível salvar: "+e.message);}
    finally{setSaving(false);}
  };
  return <div className="space-y-6">
    <div><p className="text-xs tracking-widest uppercase text-gold">Segurança e responsabilidade</p><h1 className="text-2xl font-heading mt-2">Conformidade do site</h1>
      <p className="text-sm text-muted-foreground mt-2">Checklist operacional baseado nas melhorias solicitadas. Não é certificação jurídica nem substitui uma auditoria.</p></div>
    <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
      <h2 className="font-heading text-xl">Identificação oficial</h2>
      <p className="text-sm text-muted-foreground">Use dados reais e conferidos. Não inventamos CNPJ, razão social ou endereço de e-mail.</p>
      <div className="space-y-1.5"><Label htmlFor="empresa-nome">Nome empresarial / razão social</Label><Input id="empresa-nome" maxLength={150} value={form.nome_empresarial} onChange={e=>change("nome_empresarial",e.target.value)} disabled={loading}/></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="empresa-cnpj">CNPJ (se houver)</Label><Input id="empresa-cnpj" inputMode="numeric" value={form.cnpj} onChange={e=>change("cnpj",e.target.value)} disabled={loading} placeholder="00.000.000/0000-00"/></div>
        <div className="space-y-1.5"><Label htmlFor="empresa-email">E-mail comercial (se houver)</Label><Input id="empresa-email" type="email" maxLength={150} value={form.email_comercial} onChange={e=>change("email_comercial",e.target.value)} disabled={loading}/></div>
      </div>
      <Button onClick={salvar} disabled={loading||saving} className="h-12 w-full sm:w-auto">{saving?"Salvando...":"Salvar dados oficiais"}</Button>
      {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
    </section>
    <section className="space-y-3">
      <h2 className="font-heading text-xl">17 verificações</h2>
      {ITENS.map(([nome,descricao,s],i)=><div key={nome} className="rounded-xl bg-card border p-4 flex items-start gap-3">
        <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gold/10 text-sm font-bold text-gold">{i+1}</span>
        <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-sm">{nome}</h3>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">{s==="feito"?<Check size={12}/>:<AlertCircle size={12}/>}
          {s==="feito"?"Implementação realizada":s==="pendente"?"Dados pendentes":"Revisão necessária"}</span></div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{descricao}</p></div>
      </div>)}
    </section>
    <div className="grid grid-cols-2 gap-2">
      <Button asChild variant="outline"><Link to="/privacidade" target="_blank">Privacidade <ExternalLink size={14}/></Link></Button>
      <Button asChild variant="outline"><Link to="/reembolso" target="_blank">Reembolsos <ExternalLink size={14}/></Link></Button>
    </div>
    <p className="text-xs text-muted-foreground">Antes da publicação definitiva, revise também retenção de registros, consentimentos de imagem, contratos com fornecedores e canais para pedidos de titulares.</p>
  </div>;
}
