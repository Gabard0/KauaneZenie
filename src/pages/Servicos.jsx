import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ServicoForm from "@/components/servicos/ServicoForm";
import { formatBRL, Carregando } from "@/lib/helpers";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Servicos() {
  const [erroCarga, setErroCarga] = useState(false);
  const [busca, setBusca] = useState("");
  const [servicos, setServicos] = useState(null);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const carregar = async () => {
    setErroCarga(false);
    try { setServicos(await base44.entities.Servico.list()); }
    catch { setErroCarga(true); }
  };
  useEffect(() => {
    carregar();
  }, []);

  if (erroCarga) return <div className="space-y-3"><p>Não foi possível carregar os dados.</p><Button onClick={carregar}>Tentar novamente</Button></div>;
  if (servicos === null) return <Carregando />;

  const normalizar = (v) => (v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const lista = servicos.filter((s) => (mostrarInativos || s.ativo !== false) && normalizar(s.nome).includes(normalizar(busca))).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

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

      <Input aria-label="Buscar procedimento" placeholder="Buscar procedimento…" value={busca} onChange={(e) => setBusca(e.target.value)} className="h-11" />
      <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} /> Mostrar serviços inativos/arquivados</label>
      {servicos.some((s) => s.ativo !== false && !(s.preco > 0)) && (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-relaxed">
          <strong>Valores pendentes:</strong> os procedimentos importados estão sem preço.
          Clique no lápis de cada serviço para definir o valor e confirmar a duração estimada antes de divulgar os preços.
        </div>
      )}
      {servicos.some((s) => s.demo && s.ativo !== false) && <p className="text-xs text-muted-foreground">Os serviços marcados como exemplo têm preços e durações provisórios.</p>}
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum procedimento encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-card p-3.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.nome}{s.demo && <span className="ml-2 text-[10px] uppercase text-muted-foreground">Exemplo</span>}</p>
                <p className="text-sm text-muted-foreground">
                  {s.preco > 0 ? formatBRL(s.preco) : "Valor a definir"} · {s.duracao || 0} min
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
