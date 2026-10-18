import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { formatBRL, todayISO, formatData, FORMAS, Carregando } from "@/lib/helpers";

const PERIODOS = [
  { id: "este", label: "Este mês" },
  { id: "anterior", label: "Mês anterior" },
  { id: "custom", label: "Personalizado" },
];

export default function Relatorios() {
  const hoje = todayISO();
  const [periodo, setPeriodo] = useState("este");
  const [ini, setIni] = useState(hoje.slice(0, 8) + "01");
  const [fim, setFim] = useState(hoje);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Atendimento.list(),
      base44.entities.Cliente.list(),
    ]).then(([ats, cls]) => setDados({ ats, cls }));
  }, []);

  const mesAnterior = useMemo(() => {
    const [a, m] = hoje.split("-").map(Number);
    const d = new Date(a, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [hoje]);

  if (!dados) return <Carregando />;
  const { ats, cls } = dados;

  let range;
  if (periodo === "este") {
    range = { ini: hoje.slice(0, 8) + "01", fim: hoje };
  } else if (periodo === "anterior") {
    const [a, m] = mesAnterior.split("-").map(Number);
    const ultimo = new Date(a, m, 0).getDate();
    range = { ini: `${mesAnterior}-01`, fim: `${mesAnterior}-${String(ultimo).padStart(2, "0")}` };
  } else {
    range = { ini, fim };
  }

  const sel = ats.filter(
    (a) => (a.data || "") >= range.ini && (a.data || "") <= range.fim
  );
  const total = sel.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const atendidas = new Set(sel.map((a) => a.cliente_id)).size;
  const ticket = sel.filter(a => a.tipo_receita !== "taxa").length ? total / sel.filter(a => a.tipo_receita !== "taxa").length : 0;

  // Formas de pagamento (valores recebidos)
  const contForma = {};
  sel.forEach((a) => {
    const f = FORMAS[a.forma_pagamento] || "Outro";
    contForma[f] = (contForma[f] || 0) + (Number(a.valor) || 0);
  });
  const formas = Object.entries(contForma).sort((a, b) => b[1] - a[1]);

  // Evolução por dia do período
  const porDia = {};
  sel.forEach((a) => {
    porDia[a.data] = (porDia[a.data] || 0) + (Number(a.valor) || 0);
  });
  const dias = Object.entries(porDia).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDia = Math.max(1, ...dias.map((d) => d[1]));

  // Valores por procedimento
  const porProc = {};
  sel.forEach((a) => {
    const n = a.servico_nome || "Outro";
    porProc[n] = (porProc[n] || 0) + (Number(a.valor) || 0);
  });
  const procs = Object.entries(porProc).sort((a, b) => b[1] - a[1]);

  const tituloPeriodo =
    periodo === "custom"
      ? `${formatData(range.ini)} — ${formatData(range.fim)}`
      : periodo === "este"
        ? "Este mês"
        : "Mês anterior";

  // Clientes
  const mesRef = hoje.slice(0, 7);
  const novasNoMes = cls.filter((c) => (c.created_date || "").startsWith(mesRef)).length;

  const lim = new Date();
  lim.setDate(lim.getDate() - 60);
  const limISO = lim.toISOString().slice(0, 10);
  const ultima = {};
  ats.forEach((a) => {
    if (a.cliente_id && (!ultima[a.cliente_id] || a.data > ultima[a.cliente_id]))
      ultima[a.cliente_id] = a.data;
  });
  const inativas = cls
    .filter((c) => !ultima[c.id] || ultima[c.id] < limISO)
    .map((c) => ({ c, ultimo: ultima[c.id] || null }))
    .sort((a, b) => (a.ultimo || "").localeCompare(b.ultimo || ""));

  const vazio = (msg) => (
    <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
      {msg}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-semibold">Relatórios</h1>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-lg">Financeiro</h2>
        <div className="flex rounded-xl border bg-card p-1 gap-1 flex-wrap">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodo(p.id)}
              className={`flex-1 h-10 min-w-[110px] rounded-lg text-sm font-medium transition-colors ${
                periodo === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {periodo === "custom" && (
          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[150px] max-w-xs">
              <label className="text-sm text-muted-foreground">De</label>
              <Input type="date" value={ini} onChange={(e) => setIni(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-1 flex-1 min-w-[150px] max-w-xs">
              <label className="text-sm text-muted-foreground">Até</label>
              <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="h-12" />
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground capitalize">{tituloPeriodo}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-2xl bg-card border border-gold/40 p-5">
            <p className="text-xs text-gold/90 uppercase tracking-widest">Faturamento do período</p>
            <p className="text-4xl font-display text-gold mt-2">{formatBRL(total)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {sel.filter(a => a.tipo_receita !== "taxa").length} {sel.filter(a => a.tipo_receita !== "taxa").length === 1 ? "atendimento realizado" : "atendimentos realizados"}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Atendimentos</p>
            <p className="text-2xl font-display font-semibold mt-1">{sel.filter(a => a.tipo_receita !== "taxa").length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Ticket médio</p>
            <p className="text-2xl font-display font-semibold mt-1">{formatBRL(ticket)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total recebido</p>
            <p className="text-2xl font-display text-gold mt-1">{formatBRL(total)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Clientes atendidas</p>
            <p className="text-2xl font-display font-semibold mt-1">{atendidas}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Formas de pagamento</p>
          {formas.length === 0 ? (
            vazio("Sem recebimentos no período.")
          ) : (
            formas.map(([f, v]) => (
              <div key={f} className="space-y-1">
                <div className="flex justify-between text-sm gap-3">
                  <span className="font-medium">{f}</span>
                  <span className="text-muted-foreground shrink-0">
                    {formatBRL(v)} · {total ? Math.round((v / total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${total ? (v / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Evolução por período</p>
          {dias.length === 0 ? (
            vazio("Sem atendimentos no período.")
          ) : (
            <div className="flex items-end gap-1 h-36 rounded-2xl border bg-card p-4">
              {dias.map(([d, v]) => (
                <div
                  key={d}
                  className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1 h-full"
                  title={`${formatData(d)} · ${formatBRL(v)}`}
                >
                  <div
                    className="w-full max-w-[36px] rounded-t bg-gold/80 hover:bg-gold transition-colors"
                    style={{ height: `${Math.max(4, (v / maxDia) * 100)}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {d.slice(8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Valores por procedimento</p>
          {procs.length === 0 ? (
            vazio("Sem procedimentos no período.")
          ) : (
            procs.map(([n, v], i) => (
              <div
                key={n}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium truncate">{n}</span>
                </span>
                <span className="font-semibold shrink-0">{formatBRL(v)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-lg">Clientes</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Cadastradas</p>
            <p className="text-xl font-semibold mt-1">{cls.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Novas neste mês</p>
            <p className="text-xl font-semibold mt-1">{novasNoMes}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Atendidas no período</p>
            <p className="text-xl font-semibold mt-1">{atendidas}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-lg">Clientes que não voltaram</h2>
        <p className="text-sm text-muted-foreground -mt-2">
          {inativas.length === 0
            ? "Todas as clientes retornaram nos últimos 60 dias. 🎉"
            : `${inativas.length} ${inativas.length === 1 ? "cliente não agenda" : "clientes não agendam"} há mais de 60 dias.`}
        </p>
        {inativas.length > 0 && (
          <div className="space-y-2">
            {inativas.map(({ c, ultimo }) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <span className="font-medium truncate">{c.nome}</span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {ultimo ? `último: ${formatData(ultimo)}` : "nunca atendida"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

