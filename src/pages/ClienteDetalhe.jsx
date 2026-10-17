import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AgendamentoRow from "@/components/agendamento/AgendamentoRow";
import AgendamentoDetalhe from "@/components/agendamento/AgendamentoDetalhe";
import AgendamentoDialog from "@/components/agendamento/AgendamentoDialog";
import ClienteForm from "@/components/clientes/ClienteForm";
import PromocoesSection from "@/components/clientes/PromocoesSection";
import {
  formatBRL,
  todayISO,
  formatData,
  idade,
  waLink,
  FORMAS,
  Carregando,
} from "@/lib/helpers";
import { ArrowLeft, Pencil, MessageCircle, CalendarPlus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClienteDetalhe() {
  const { id } = useParams();
  const hoje = todayISO();
  const [cliente, setCliente] = useState(undefined); // undefined = carregando
  const [hist, setHist] = useState(null);
  const [ags, setAgs] = useState([]);
  const [prox, setProx] = useState([]);
  const [editar, setEditar] = useState(false);
  const [novoAg, setNovoAg] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [excluir, setExcluir] = useState(false);
  const navegar = useNavigate();

  const carregar = async () => {
    const [c, ats, ags] = await Promise.all([
      base44.entities.Cliente.get(id).catch(() => null),
      base44.entities.Atendimento.list(),
      base44.entities.Agendamento.list(),
    ]);
    setCliente(c);
    setAgs(ags);
    setHist(
      ats
        .filter((a) => a.cliente_id === id)
        .sort((a, b) => (b.data || "").localeCompare(a.data || ""))
    );
    setProx(
      ags
        .filter(
          (a) =>
            a.cliente_id === id &&
            ["agendado", "confirmado"].includes(a.status) &&
            a.data >= hoje
        )
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario))
    );
  };
  useEffect(() => {
    carregar();
  }, [id]);

  if (cliente === undefined || hist === null) return <Carregando />;
  if (!cliente)
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">Cliente não encontrada.</p>
        <Link to="/clientes"><Button variant="outline">Voltar para clientes</Button></Link>
      </div>
    );

  const anos = idade(cliente.data_nascimento);
  const msgOla = `Oi, ${cliente.nome}! Tudo bem? 💅`;
  const totalGasto = hist.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const agsById = {};
  for (const a of ags) agsById[a.id] = a;

  const confirmarExclusao = async () => {
    await base44.entities.Cliente.delete(id);
    navegar("/clientes");
  };

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Clientes
      </Link>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-heading font-semibold truncate">{cliente.nome}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cliente.telefone || "sem telefone"}
              {cliente.data_nascimento && ` · ${formatData(cliente.data_nascimento)}`}
              {anos !== null && ` (${anos} anos)`}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setEditar(true)} aria-label="Editar">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 text-destructive hover:text-destructive"
              onClick={() => setExcluir(true)}
              aria-label="Excluir cliente"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {cliente.observacoes && (
          <p className="text-sm rounded-xl bg-muted/50 px-4 py-3">{cliente.observacoes}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {cliente.data_nascimento && (
            <span className="rounded-full bg-gold/10 text-gold text-sm px-3 py-1.5">
              🎂 {formatData(cliente.data_nascimento)}
            </span>
          )}
          {(cliente.promocoes || []).length > 0 && (
            <span className="rounded-full bg-gold/10 text-gold text-sm px-3 py-1.5">
              🎁 {cliente.promocoes.length} promoção(ões)/brinde(s)
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button className="h-12" onClick={() => setNovoAg(true)}>
            <CalendarPlus className="w-4 h-4 mr-1" /> Agendar
          </Button>
          {cliente.telefone ? (
            <a href={waLink(cliente.telefone, msgOla)} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full h-12">
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="h-12" disabled>
              <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
            </Button>
          )}
        </div>
      </div>

      <PromocoesSection cliente={cliente} onSaved={carregar} />

      {prox.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading font-semibold text-lg">Próximos agendamentos</h2>
          <div className="space-y-2">
            {prox.map((a) => (
              <AgendamentoRow key={a.id} agendamento={a} onClick={() => setSelecionado(a.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-lg">Histórico de atendimentos</h2>
          <span className="text-sm text-muted-foreground">
            {hist.length} · {formatBRL(totalGasto)}
          </span>
        </div>
        {hist.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhum atendimento registrado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {hist.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{a.servico_nome || "Procedimento"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatData(a.data)} · {FORMAS[a.forma_pagamento] || ""}
                      {a.agendamento_id && agsById[a.agendamento_id]?.origem === "online" && (
                        <span className="ml-2 rounded-full bg-gold/15 text-gold px-2 py-0.5 text-xs font-medium">
                          ONLINE
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold shrink-0">{formatBRL(a.valor)}</p>
                </div>
                {a.observacao && (
                  <p className="text-sm text-muted-foreground mt-2">{a.observacao}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <ClienteForm open={editar} onClose={() => setEditar(false)} onSaved={carregar} cliente={cliente} />

      <AlertDialog open={excluir} onOpenChange={setExcluir}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              {cliente.nome} será removida da lista de clientes. O histórico de atendimentos
              permanece no financeiro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmarExclusao}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AgendamentoDialog
        open={novoAg}
        onClose={() => setNovoAg(false)}
        onSaved={carregar}
        defaults={{ cliente_id: id }}
      />
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