import ConfiguracoesDialog from "@/components/ConfiguracoesDialog";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Cake, Scissors, BarChart3, Trash2, QrCode, Clock, Palette, KeyRound, ClipboardList, ShieldCheck } from "lucide-react";
import { Carregando } from "@/lib/helpers";


const GRUPOS = [
  { titulo: "Agenda e reservas", descricao: "Comece pelos serviços, horários e pelo link para suas clientes.", links: [
    { to: "/servicos", label: "Serviços e preços", desc: "Procedimentos, valores e duração", icon: Scissors },
    { to: "/config-agenda", label: "Horários da agenda", desc: "Funcionamento, períodos especiais e folgas", icon: Clock },
    { to: "/lista-espera", label: "Lista de espera", desc: "Clientes aguardando vaga", icon: ClipboardList },
    { to: "/agendamento-online", label: "Agendamento online", desc: "Link, QR Code, limite da agenda e Pix", icon: QrCode },
  ] },
  { titulo: "Clientes e resultados", descricao: "Acompanhe datas especiais e o desempenho do espaço.", links: [
    { to: "/aniversarios", label: "Aniversários", desc: "Parabenize suas clientes", icon: Cake },
    { to: "/relatorios", label: "Relatórios", desc: "Resumo mensal e clientes", icon: BarChart3 },
  ] },
  { titulo: "Identidade visual", descricao: "Personalize a experiência do seu espaço.", links: [
    { to: "/aparencia", label: "Aparência", desc: "Modo claro ou escuro", icon: Palette },
    { to: "/conformidade", label: "Conformidade do site", desc: "LGPD, documentos, copyright e checklist", icon: ShieldCheck },
  ] },
  { titulo: "Conta", descricao: "Gerencie o acesso ao sistema.", links: [
    { to: "/conta", label: "Trocar senha", desc: "Defina sua própria senha de acesso", icon: KeyRound },
  ] },
];

export default function Mais() {
  const [dadosOpen, setDadosOpen] = useState(false);
  const [temDemo, setTemDemo] = useState(undefined); // undefined = verificando
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    if (!dadosOpen) return;
    const verificar = async () => {
      const [a, t, c, s] = await Promise.all([
        base44.entities.Agendamento.filter({ demo: true }),
        base44.entities.Atendimento.filter({ demo: true }),
        base44.entities.Cliente.filter({ demo: true }),
        base44.entities.Servico.filter({ demo: true }),
      ]);
      setTemDemo(a.length + t.length + c.length + s.length > 0);
    };
    verificar().catch(() => setTemDemo(null));
  }, [dadosOpen]);

  const removerDemo = async () => {
    if (!window.confirm("Remover todos os dados de demonstração? Esta ação não pode ser desfeita.")) return;
    setRemovendo(true);
    try {
      await base44.entities.Agendamento.deleteMany({ demo: true });
      await base44.entities.Atendimento.deleteMany({ demo: true });
      await base44.entities.Cliente.deleteMany({ demo: true });
      await base44.entities.Servico.deleteMany({ demo: true });
      setTemDemo(false);
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Seu espaço, do seu jeito</p>
        <h1 className="text-2xl font-heading font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Tudo o que você precisa para organizar os atendimentos.</p>
      </div>
      <ConfiguracoesDialog titulo="Dados de demonstração" descricao="Gerencie os exemplos usados para conhecer o sistema." open={dadosOpen} onOpenChange={setDadosOpen}>
      {temDemo === undefined ? (
        <Carregando />
      ) : temDemo === null ? <p className="text-sm text-destructive">Não foi possível carregar os dados. Feche e tente novamente.</p> : temDemo ? (
        <div className="rounded-2xl bg-gold/10 border border-gold/30 p-5 space-y-3">
          <p className="text-sm text-foreground/80">
            Existem dados de demonstração no sistema. Após conhecer o sistema, remova-os para começar
            a usar com seus dados reais.
          </p>
          <Button variant="destructive" className="h-12" onClick={removerDemo} disabled={removendo}>
            <Trash2 className="w-4 h-4 mr-1" />
            {removendo ? "Removendo..." : "Remover dados de demonstração"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum dado de demonstração no sistema.</p>
      )}
      </ConfiguracoesDialog>
      </div>

      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo} className="space-y-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">{grupo.titulo}</h2>
            <p className="text-sm text-muted-foreground">{grupo.descricao}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {grupo.links.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-2xl border border-gold/20 bg-card p-4 flex items-center gap-3 hover:border-gold/60 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <l.icon className="w-5 h-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{l.label}</p>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <Button variant="outline" onClick={() => { const token=localStorage.getItem("barbozza_token"); base44.functions.invoke("adminAuth",{acao:"sair",token}).catch(()=>{}); localStorage.removeItem("barbozza_token"); window.location.href="/login"; }}>Sair da conta</Button>


    </div>
  );
}