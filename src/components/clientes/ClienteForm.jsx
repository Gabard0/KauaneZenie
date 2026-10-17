import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { encontrarPorTelefone, encontrarNomesParecidos } from "@/lib/clientesMatch";
import ConfirmacaoParecida from "@/components/clientes/ConfirmacaoParecida";

export default function ClienteForm({ open, onClose, onSaved, cliente = null }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [parecidas, setParecidas] = useState(null);

  useEffect(() => {
    if (!open) return;
    setNome(cliente?.nome || "");
    setTelefone(cliente?.telefone || "");
    setNascimento(cliente?.data_nascimento || "");
    setObservacoes(cliente?.observacoes || "");
    setErro("");
  }, [open]);

  const persistir = async () => {
    const dados = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      data_nascimento: nascimento || null,
      observacoes,
    };
    const salvo = cliente
      ? await base44.entities.Cliente.update(cliente.id, dados)
      : await base44.entities.Cliente.create(dados);
    onSaved && onSaved(salvo);
    onClose();
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return setErro("Informe o nome.");
    setSalvando(true);
    try {
      if (!cliente) {
        // Nunca duplicar: telefone normalizado e nome idêntico são verificados antes
        const todos = await base44.entities.Cliente.list();
        if (telefone.trim()) {
          const peloTel = encontrarPorTelefone(todos, telefone);
          if (peloTel) {
            return setErro(
              `Este WhatsApp já pertence a ${peloTel.nome}. Abra o cadastro dela em vez de criar uma nova.`
            );
          }
        }
        const iguais = encontrarNomesParecidos(todos, nome);
        if (iguais.length) {
          setParecidas(iguais);
          return;
        }
      }
      await persistir();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Nova cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome completo</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-12" placeholder="Nome da cliente" />
          </div>
          <div className="space-y-1">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="h-12"
              inputMode="tel"
              placeholder="(11) 90000-0000"
            />
          </div>
          <div className="space-y-1">
            <Label>Data de nascimento</Label>
            <Input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} className="h-12" />
          </div>
          <div className="space-y-1">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Ex.: alérgica a ácido, prefere tons claros"
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
        <ConfirmacaoParecida
          open={!!parecidas}
          candidatas={parecidas || []}
          onEscolher={(c) => {
            setParecidas(null);
            setErro(`Cliente já cadastrada: ${c.nome}. Abra o cadastro dela na lista para editar.`);
          }}
          onNova={() => {
            setParecidas(null);
            persistir();
          }}
          onClose={() => setParecidas(null)}
        />
      </DialogContent>
    </Dialog>
  );
}