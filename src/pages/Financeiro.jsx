import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MovimentacaoLista from "@/components/financeiro/MovimentacaoLista";
import MovimentacaoDialog from "@/components/financeiro/MovimentacaoDialog";
import { Plus } from "lucide-react";
import { formatBRL, todayISO, toISO, FORMAS, Carregando } from "@/lib/helpers";

const PERIODOS = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
  { id: "custom", label: "Período" },
];

const CORES_BARRAS = ["bg-gold", "bg-gold/70", "bg-gold/50", "bg-gold/35", "bg-gold/25"];

export default function Financeiro() {
  const [atendimentos, setAtendimentos] = useState(null);
  const [periodo, setPeriodo] = useState("mes");
  const [de, setDe] = useState(todayISO());
  const [ate, setAte] = useState(todayISO());

  const [novaEntrada, setNovaEntrada] = useState(false);

  const [ags, setAgs] = useState([]);
  const carregar = async () => {
    const [ats, agsNovos] = await Promise.all([
      base44.entities.Atendimento.list("-data"),
      base44.entities.Agendamento.list(),
    ]);
    setAtendimentos(ats);
    setAgs(agsNovos);
  };
  useEffect(() => {
    carregar();
  }, []);

  const [ini, fim] = useMemo(() => {
    const agora = new Date();
    if (periodo === "hoje") return [todayISO(), todayISO()];
    if (periodo === "semana") {
      const i = new Date(agora);
      i.setDate(agora.getDate() - ((agora.getDay() + 6) % 7));
      const f = new Date(i);
      f.setDate(i.getDate() + 6);
      return [toISO(i), toISO(f)];
    }
    if (periodo === "mes") {
      const i = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const f = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
      return [toISO(i), toISO(f)];
    }
    return [de, ate];
  }, [periodo, de, ate]);

  if (atendimentos === null) return <Carregando />;

  // Taxas de reserva: vinculam o valor pago ao serviço e à cliente do agendamento
  const mapaAgs = {};
  ags.forEach((a) => { mapaAgs[a.id] = a; });
  const sel = atendimentos
    .filter((a) => a.data && a.data >= ini && a.data <= fim)
    .map((a) =>
      a.tipo_receita === "taxa" && mapaAgs[a.agendamento_id]
        ? { ...a, servico_nome: mapaAgs[a.agendamento_id].servico_nome || a.servico_nome }
        : a
    );
  const total = sel.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const clientesAtendidas = new Set(sel.map((a) => a.cliente_id)).size;
  const ticket = sel.filter(a => a.tipo_receita !== "taxa").length ? total / sel.filter(a => a.tipo_receita !== "taxa").length : 0;

  const porForma = Object.entries(FORMAS)
    .map(([k, label], idx) => ({
      k,
      label,
      valor: sel.filter((a) => a.forma_pagamento === k).reduce((s, a) => s + (Number(a.valor) || 0), 0),
      cor: CORES_BARRAS[idx],
    }))
    .filter((f) => f.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const contagem = {};
  sel.filter((a) => a.tipo_receita !== "taxa").forEach((a) => {
    const nome = a.servico_nome || "Outro";
    contagem[nome] = (contagem[nome] || 0) + 1;
  });
  const porServico = Object.entries(contagem)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-heading font-semibold">Financeiro</h1>

      <div className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriodo(p.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
              periodo === p.id
                ? "bg-primary text-primary-foreground border-gold"
                : "bg-card hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {periodo === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">De</label>
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="h-12" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Até</label>
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="h-12" />
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card text-foreground border border-gold/40 p-5">
        <p className="text-sm opacity-80">Faturamento</p>
        <p className="text-3xl sm:text-4xl font-display text-gold mt-1">{formatBRL(total)}</p>
      </div>

      <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Atendimentos</p>
          <p className="text-lg sm:text-xl font-semibold mt-1 break-words">{sel.filter(a => a.tipo_receita !== "taxa").length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Clientes</p>
          <p className="text-lg sm:text-xl font-semibold mt-1 break-words">{clientesAtendidas}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="text-lg sm:text-xl font-semibold mt-1 break-words">{formatBRL(ticket)}</p>
        </div>
      </div>

      {porForma.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading font-semibold text-lg">Formas de pagamento</h2>
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            {porForma.map((f) => (
              <div key={f.k} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span>{formatBRL(f.valor)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.cor}`}
                    style={{ width: `${total ? Math.round((f.valor / total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {porServico.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading font-semibold text-lg">Procedimentos mais realizados</h2>
          <div className="space-y-2">
            {porServico.map((s, idx) => (
              <div
                key={s.nome}
                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
              >
                <span className="font-medium">
                  {idx === 0 && "🥇 "}
                  {s.nome}
                </span>
                <span className="text-sm text-muted-foreground">{s.qtd}x</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Movimentações</h2>
          <Button size="sm" onClick={() => setNovaEntrada(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nova entrada
          </Button>
        </div>
        {sel.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma movimentação neste período.
          </div>
        ) : (
          <MovimentacaoLista registros={sel} onChanged={carregar} />
        )}
      </section>

      <MovimentacaoDialog
        open={novaEntrada}
        registro={null}
        onClose={() => setNovaEntrada(false)}
        onSaved={carregar}
      />
    </div>
  );
}
