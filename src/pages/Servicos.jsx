import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ServicoForm from "@/components/servicos/ServicoForm";
import { formatBRL, Carregando } from "@/lib/helpers";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Servicos() {
  const [servicos, setServicos] = useState(null);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const carregar = async () => setServicos(await base44.entities.Servico.list());
  useEffect(() => {
    carregar();
  }, []);

  if (servicos === null) return <Carregando />;

  const alternarAtivo = async (s) => {
    await base44.entities.Servico.update(s.id, { ativo: s.ativo === false });
    carregar();
  };

  const excluir = async (s) => {
    if (window.confirm(`Excluir "${s.nome}"?`)) {
      await base44.entities.Servico.delete(s.id);
      carregar();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-heading font-semibold">Serviços</h1>
        <Button
          className="h-12"
          onClick={() => {
            setEditando(null);
            setAbrirForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Novo procedimento
        </Button>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">
        O preço padrão é preenchido automaticamente ao finalizar um atendimento.
      </p>

      {servicos.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum procedimento cadastrado.
        </div>
      ) : (
        <div className="space-y-2">
          {servicos.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-card p-3.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBRL(s.preco)} · {s.duracao || 0} min
                  {s.gera_manutencao === true && <span className="text-gold"> · 💕 gera manutenção</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => alternarAtivo(s)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${
                  s.ativo === false ? "bg-foreground/10 text-muted-foreground" : "bg-gold/20 text-gold"
                }`}
              >
                {s.ativo === false ? "Inativo" : "Ativo"}
              </button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="Editar"
                onClick={() => {
                  setEditando(s);
                  setAbrirForm(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive shrink-0"
                aria-label="Excluir"
                onClick={() => excluir(s)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ServicoForm
        open={abrirForm}
        onClose={() => setAbrirForm(false)}
        onSaved={carregar}
        servico={editando}
      />
    </div>
  );
}
