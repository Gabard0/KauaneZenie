import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { FORMAS } from "@/lib/helpers";
import AgendamentoDialog from "./AgendamentoDialog";
import { Check, CalendarPlus } from "lucide-react";

const chipBase = "rounded-full px-4 py-2.5 text-sm font-medium border transition-colors";
const chipOn = "bg-primary text-primary-foreground border-gold";
const chipOff = "bg-card text-foreground hover:bg-muted";

export default function FinalizarDialog({ agendamento, onClose, onFinalizado }) {
  const [servicos, setServicos] = useState([]);
  const [servicoId, setServicoId] = useState(agendamento.servico_id || "");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("pix");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [proximo, setProximo] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const todos = await base44.entities.Servico.list();
      const ativos = todos.filter((s) => s.ativo !== false);
      let lista = ativos;
      const usado = todos.find((s) => s.id === agendamento.servico_id);
      if (usado && !ativos.find((s) => s.id === usado.id)) lista = [usado, ...ativos];
      setServicos(lista);
      const inicial = lista.find((s) => s.id === (agendamento.servico_id || lista[0]?.id));
      setServicoId(inicial?.id || "");
      setValor(String(agendamento.valor ?? inicial?.preco ?? ""));
    };
    carregar();
  }, []);

  const escolherServico = (s) => {
    setServicoId(s.id);
    setValor(s.preco != null ? String(s.preco) : "");
  };

  const salvar = async () => {
    setErro("");
    const v = Number(valor);
    if (!v || v <= 0) return setErro("Informe o valor recebido.");
    setSalvando(true);
    try {
      const response = await base44.functions.invoke("adminData", {acao:"finalizar",id:agendamento.id,valor:v,servico_id:servicoId,forma_pagamento:forma,observacao});
      if (!response.data?.ok) throw new Error(response.data?.error || "Não foi possível finalizar");
      setSucesso(true);
      onFinalizado && onFinalizado();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {!sucesso ? (
            <>
              <DialogHeader>
                <DialogTitle>Finalizar atendimento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {agendamento.cliente_nome} · {agendamento.horario}
                </p>
                <div className="space-y-1.5">
                  <Label>Procedimento realizado</Label>
                  <div className="flex flex-wrap gap-2">
                    {servicos.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => escolherServico(s)}
                        className={`${chipBase} ${servicoId === s.id ? chipOn : chipOff}`}
                      >
                        {s.nome}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Valor recebido (R$)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="h-14 text-lg font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Forma de pagamento</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(FORMAS).map(([k, label]) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setForma(k)}
                        className={`${chipBase} ${forma === k ? chipOn : chipOff}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Observação (opcional)</Label>
                  <Textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={2}
                    placeholder="Ex.: aplicou alongamento com base no próprio esmalte"
                  />
                </div>
                {erro && <p className="text-sm text-destructive">{erro}</p>}
                <Button className="w-full h-12 text-base" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar atendimento"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Atendimento concluído!</h3>
                <p className="text-sm text-muted-foreground">
                  Salvo no histórico da cliente e no financeiro.
                </p>
              </div>
              <Button className="w-full h-12 text-base" onClick={() => setProximo(true)}>
                <CalendarPlus className="w-4 h-4 mr-1" /> Agendar próximo atendimento
              </Button>
              <Button variant="outline" className="w-full h-12" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {proximo && (
        <AgendamentoDialog
          open
          defaults={{ cliente_id: agendamento.cliente_id }}
          onClose={() => setProximo(false)}
          onSaved={() => {
            setProximo(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
