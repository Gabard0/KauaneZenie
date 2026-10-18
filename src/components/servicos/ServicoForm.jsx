import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

const chipBase = "rounded-full px-4 py-2 text-sm font-medium border transition-colors";
const chipOn = "bg-primary text-primary-foreground border-gold";
const chipOff = "bg-card text-foreground hover:bg-muted";

export default function ServicoForm({ open, onClose, onSaved, servico = null }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("60");
  const [geraManut, setGeraManut] = useState(false);
  const [manutServId, setManutServId] = useState("");
  const [intervalo, setIntervalo] = useState("20");
  const [todosServicos, setTodosServicos] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome(servico?.nome || "");
    setPreco(servico?.preco != null ? String(servico.preco) : "");
    setDuracao(servico?.duracao != null ? String(servico.duracao) : "60");
    setGeraManut(servico?.gera_manutencao === true);
    setManutServId(servico?.manutencao_servico_id || "");
    setIntervalo(servico?.intervalo_manutencao != null ? String(servico.intervalo_manutencao) : "20");
    setErro("");
    base44.entities.Servico.list().then(setTodosServicos).catch(() => setTodosServicos([]));
  }, [open]);

  const salvar = async (e) => {
    e.preventDefault();
    if (!Number.isInteger(Number(duracao)) || Number(duracao) <= 0) return setErro("Informe uma duração maior que zero.");
    if (!nome.trim()) return setErro("Informe o nome do procedimento.");
    if (geraManut && !manutServId) return setErro("Selecione o procedimento de manutenção correspondente.");
    setSalvando(true);
    try {
      const dados = {
        demo: false,
        nome: nome.trim(),
        preco: Number(preco) || 0,
        duracao: Number(duracao) || 0,
        gera_manutencao: geraManut,
        manutencao_servico_id: geraManut ? manutServId : "",
        intervalo_manutencao: geraManut ? Number(intervalo) || 20 : 0,
      };
      if (servico) await base44.entities.Servico.update(servico.id, dados);
      else await base44.entities.Servico.create({ ...dados, ativo: true });
      onSaved && onSaved();
      onClose();
    } catch {
      setErro("Não foi possível salvar o procedimento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{servico ? "Editar procedimento" : "Novo procedimento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-12" placeholder="Ex.: Volume Brasileiro" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Preço padrão (R$)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1">
              <Label>Duração</Label>
              <div className="grid grid-cols-2 gap-2">
                <div><Input aria-label="Horas de duração" type="number" inputMode="numeric" min="0" step="1" value={Math.floor(Number(duracao) / 60)} onChange={(e) => setDuracao(String(Number(e.target.value) * 60 + Number(duracao) % 60))} className="h-12" /><span className="text-xs text-muted-foreground">Horas</span></div>
                <div><Input aria-label="Minutos adicionais" type="number" inputMode="numeric" min="0" max="59" step="1" value={Number(duracao) % 60} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v < 60) setDuracao(String(Math.floor(Number(duracao) / 60) * 60 + v)); }} className="h-12" /><span className="text-xs text-muted-foreground">Minutos</span></div>
              </div>
            </div>
          </div>

          <details className="rounded-2xl border border-gold/30 bg-gold/5 p-4 space-y-3" open={geraManut || undefined}>
            <summary className="cursor-pointer text-sm font-medium">Configuração de manutenção</summary>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Agendar manutenção automaticamente?</p>
                <p className="text-xs text-muted-foreground">Reserva a manutenção X dias após a aplicação.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGeraManut(false)}
                className={`${chipBase} ${!geraManut ? chipOn : chipOff}`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setGeraManut(true)}
                className={`${chipBase} ${geraManut ? chipOn : chipOff}`}
              >
                Sim
              </button>
            </div>
            {geraManut && (
              <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <Label>Manutenção correspondente</Label>
                  <select
                    value={manutServId}
                    onChange={(e) => setManutServId(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Selecione o procedimento de manutenção…</option>
                    {todosServicos
                      .filter((s) => s.id !== servico?.id && s.ativo !== false)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} · {s.duracao || 60} min
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Intervalo (dias)</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={intervalo}
                    onChange={(e) => setIntervalo(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}
          </details>

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
      </DialogContent>
    </Dialog>
  );
}