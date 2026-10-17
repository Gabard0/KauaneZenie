import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { todayISO, FORMAS } from "@/lib/helpers";

const chipOn = "bg-primary text-primary-foreground border-gold";
const chipOff = "bg-card hover:bg-muted";

export default function MovimentacaoDialog({ open, registro, onClose, onSaved }) {
  const [data, setData] = useState(todayISO());
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("pix");
  const [clienteNome, setClienteNome] = useState("");
  const [servicoNome, setServicoNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setErro("");
      setSalvando(false);
      setData(registro?.data || todayISO());
      setValor(registro ? String(registro.valor ?? "") : "");
      setForma(registro?.forma_pagamento || "pix");
      setClienteNome(registro?.cliente_nome || "");
      setServicoNome(registro?.servico_nome || "");
      setObservacao(registro?.observacao || "");
    }
  }, [open, registro]);

  const salvar = async (e) => {
    e.preventDefault();
    const v = Number(valor);
    if (!data || !valor || isNaN(v) || v <= 0) {
      setErro("Informe a data e um valor válido.");
      return;
    }
    setSalvando(true);
    const payload = {
      data,
      valor: v,
      forma_pagamento: forma,
      cliente_nome: clienteNome.trim(),
      servico_nome: servicoNome.trim(),
      observacao: observacao.trim(),
    };
    if (registro) {
      await base44.entities.Atendimento.update(registro.id, {
        ...payload,
        cliente_id: registro.cliente_id,
        servico_id: registro.servico_id,
        agendamento_id: registro.agendamento_id,
      });
    } else {
      await base44.entities.Atendimento.create(payload);
    }
    setSalvando(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {registro ? "Editar movimentação" : "Nova entrada"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mov-data">Data</Label>
              <Input
                id="mov-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mov-valor">Valor (R$)</Label>
              <Input
                id="mov-valor"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Forma de pagamento</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(FORMAS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForma(k)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    forma === k ? chipOn : chipOff
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mov-cliente">Cliente (opcional)</Label>
              <Input
                id="mov-cliente"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mov-servico">Serviço (opcional)</Label>
              <Input
                id="mov-servico"
                value={servicoNome}
                onChange={(e) => setServicoNome(e.target.value)}
                placeholder="Serviço"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mov-obs">Observação</Label>
            <Input
              id="mov-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              className="h-11"
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" className="w-full h-12" disabled={salvando}>
            {registro ? "Salvar alterações" : "Registrar entrada"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}