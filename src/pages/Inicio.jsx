import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AgendamentoRow from "@/components/agendamento/AgendamentoRow";
import AgendamentoDetalhe from "@/components/agendamento/AgendamentoDetalhe";
import AgendamentoDialog from "@/components/agendamento/AgendamentoDialog";
import ClienteForm from "@/components/clientes/ClienteForm";
import ComprovantesPendentes from "@/components/agendamento/ComprovantesPendentes";
import { formatBRL, todayISO, diasAteAniversario, formatData, Carregando } from "@/lib/helpers";
import { CalendarPlus, UserPlus, Cake, Link2, Copy, Check } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Inicio() {
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [erroLink, setErroLink] = useState("");
  const copiarLink = async () => {
    setErroLink("");
    try {
      await navigator.clipboard.writeText(new URL("/agendar", window.location.origin).href);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    } catch { setErroLink("Abra Agendamento Online para copiar ou compartilhar o link."); }
  };
  const hoje = todayISO();
  const [dados, setDados] = useState(null);
  const [novoAg, setNovoAg] = useState(false);
  const [novaCli, setNovaCli] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarTodosProx, setMostrarTodosProx] = useState(false);

  const carregar = async () => {
    const [ags, ats, cls] = await Promise.all([
      base44.entities.Agendamento.list(),
      base44.entities.Atendimento.list(),
      base44.entities.Cliente.list(),
    ]);
    setDados({ ags, ats, cls });
  };
  useEffect(() => {
    carregar();
    // Tempo real: um agendamento online novo atualiza o painel na hora
    const unsub = base44.entities.Agendamento.subscribe(() => carregar());
    return unsub;
  }, []);

  if (!dados) return <Carregando />;

  const { ags, ats, cls } = dados;
  const doDia = ags
    .filter((a) => a.data === hoje)
    .sort((a, b) => a.horario.localeCompare(b.horario));
  const atsHoje = ats.filter((a) => a.data === hoje);
  const recebidoHoje = atsHoje.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const atsMes = ats.filter((a) => (a.data || "").startsWith(hoje.slice(0, 7)));
  const recebidoMes = atsMes.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const horaAtual = new Date().toTimeString().slice(0, 5);
  const proximos = ags
    .filter(
      (a) =>
        a.cliente_id &&
        ["agendado", "confirmado"].includes(a.status) &&
        (a.data > hoje || (a.data === hoje && a.horario >= horaAtual))
    )
    .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
  const proximo = proximos[0];
  const anivs = cls
    .map((c) => ({ c, dias: c.data_nascimento ? diasAteAniversario(c.data_nascimento) : null }))
    .filter((x) => x.dias !== null && x.dias <= 30)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 4);
  const temDemo = cls.some((c) => c.demo) || ags.some((a) => a.demo) || ats.some((a) => a.demo);

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      {temDemo && (
        <div className="rounded-xl bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-gold flex items-center justify-between gap-3">
          <span>Você está com dados de demonstração para conhecer o sistema.</span>
          <Link to="/mais" className="font-semibold underline shrink-0">
            Remover
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" className="w-12 h-12 sm:w-16 sm:h-16" />
          <div>
            <h1 className="font-display text-3xl font-semibold">Olá, Kauane</h1>
            <p className="text-sm text-muted-foreground capitalize">{dataHoje}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button className="flex-1 sm:flex-none h-12" onClick={() => setNovoAg(true)}>
            <CalendarPlus className="w-4 h-4 mr-1" /> Novo agendamento
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none h-12" onClick={() => setNovaCli(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Nova cliente
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/30 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-gold font-semibold"><Link2 className="w-5 h-5" /> Link para suas clientes</div>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 w-full" onClick={copiarLink}>{linkCopiado ? <Check /> : <Copy />}{linkCopiado ? "Link copiado!" : "Copiar link"}</Button>
          <Button variant="outline" className="h-12 w-full" asChild><Link to="/agendamento-online"><Link2 /> Link e QR Code</Link></Button>
        </div>
        {erroLink && <p className="text-sm text-destructive">{erroLink}</p>}
      </div>

      <ComprovantesPendentes ags={ags} onAbrirDetalhe={setSelecionado} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-3 rounded-2xl bg-card border border-gold/40 p-5">
          <p className="text-xs text-gold/90 uppercase tracking-widest">Financeiro do mês</p>
          <p className="text-4xl font-display text-gold mt-2">{formatBRL(recebidoMes)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {atsMes.length} {atsMes.length === 1 ? "atendimento realizado" : "atendimentos realizados"} · Hoje: {formatBRL(recebidoHoje)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Recebido hoje</p>
          <p className="text-2xl font-display text-gold mt-1">{formatBRL(recebidoHoje)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Agendadas hoje</p>
          <p className="text-2xl font-display font-semibold mt-1">{doDia.filter((a) => a.cliente_id).length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Atendimentos hoje</p>
          <p className="text-2xl font-display font-semibold mt-1">{atsHoje.length}</p>
        </div>
      </div>

      {proximo && (
        <section className="space-y-3">
          <button
            type="button"
            className="w-full text-left rounded-2xl border border-gold/60 bg-gold/10 p-5 flex items-center gap-4 transition-shadow hover:shadow-md"
            onClick={() => setSelecionado(proximo.id)}
          >
            <div className="rounded-xl bg-primary text-primary-foreground px-3.5 py-2.5 text-center shrink-0">
              <p className="text-lg font-bold leading-none">{proximo.horario}</p>
              <p className="text-[10px] uppercase tracking-wide mt-1 opacity-80">
                {proximo.duracao || 60}min
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Próximo agendamento
                </p>
                {proximo.origem === "online" && (
                  <span className="text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                    ONLINE
                  </span>
                )}
              </div>
              <p className="font-semibold truncate mt-0.5">{proximo.cliente_nome}</p>
              <p className="text-sm text-muted-foreground truncate">{proximo.servico_nome}</p>
              <p className="text-sm mt-1">
                <span className="font-semibold text-gold">{formatBRL(proximo.valor)}</span>
                <span className="text-muted-foreground"> · {formatData(proximo.data)}</span>
              </p>
            </div>
          </button>

          {proximos.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-muted-foreground px-1">Próximos</p>
              {(mostrarTodosProx ? proximos.slice(1) : proximos.slice(1, 4)).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelecionado(a.id)}
                  className="w-full text-left flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors"
                >
                  <span className="font-semibold text-gold w-12 shrink-0">{a.horario}</span>
                  <span className="font-medium truncate flex-1">{a.cliente_nome}</span>
                  <span className="text-muted-foreground truncate hidden sm:inline sm:max-w-[40%]">
                    {a.servico_nome}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatData(a.data)}</span>
                </button>
              ))}
              {proximos.length > 4 && (
                <button
                  type="button"
                  onClick={() => setMostrarTodosProx((v) => !v)}
                  className="w-full text-sm font-medium text-gold py-1.5 hover:underline"
                >
                  {mostrarTodosProx ? "Mostrar menos" : `Mostrar mais (${proximos.length - 1})`}
                </button>
              )}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Agenda de hoje</h2>
          <Link to="/agenda" className="text-sm font-medium text-gold">
            Ver agenda
          </Link>
        </div>
        {doDia.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhum agendamento para hoje.
          </div>
        ) : (
          <div className="space-y-2">
            {doDia.map((a) => (
              <AgendamentoRow key={a.id} agendamento={a} onClick={() => setSelecionado(a.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Próximos aniversários</h2>
          <Link to="/aniversarios" className="text-sm font-medium text-gold">
            Ver todos
          </Link>
        </div>
        {anivs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhum aniversário nos próximos 30 dias.
          </div>
        ) : (
          <div className="space-y-2">
            {anivs.map(({ c, dias }) => (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5"
              >
                <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <Cake className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatData(c.data_nascimento)} ·{" "}
                    {dias === 0 ? "é hoje! 🎂" : `em ${dias} ${dias === 1 ? "dia" : "dias"}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <AgendamentoDialog
        open={novoAg}
        onClose={() => setNovoAg(false)}
        onSaved={carregar}
        defaults={{ data: hoje }}
      />
      <ClienteForm open={novaCli} onClose={() => setNovaCli(false)} onSaved={carregar} />
      {selecionado && (
        <AgendamentoDetalhe
          agendamentoId={selecionado}
          onClose={() => setSelecionado(null)}
          onChanged={carregar}
        />
      )}
    </div>
  );
}

