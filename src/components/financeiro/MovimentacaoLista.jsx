import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import MovimentacaoDialog from "./MovimentacaoDialog";
import { formatBRL, formatData, FORMAS } from "@/lib/helpers";
import { Pencil, Trash2 } from "lucide-react";
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

export default function MovimentacaoLista({ registros, onChanged }) {
  const [editando, setEditando] = useState(null);
  const [excluir, setExcluir] = useState(null);

  const confirmarExclusao = async () => {
    await base44.entities.Atendimento.delete(excluir.id);
    setExcluir(null);
    onChanged();
  };

  return (
    <div className="space-y-2">
      {registros.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="font-medium truncate flex items-center gap-2">
              {r.tipo_receita === "taxa" && (
                <span className="text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded shrink-0">
                  TAXA
                </span>
              )}
              {r.tipo_receita === "taxa" ? "Taxa de reserva" : r.servico_nome || "Entrada"}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatData(r.data)}
              {r.cliente_nome ? ` · ${r.cliente_nome}` : ""}
              {r.tipo_receita === "taxa" && r.servico_nome ? ` · ${r.servico_nome}` : ""}
              {" · "}{FORMAS[r.forma_pagamento] || "—"}
            </p>
            {r.observacao && (
              <p className="text-sm text-muted-foreground mt-1">{r.observacao}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <p className="font-semibold mr-1">{formatBRL(r.valor)}</p>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={r.tipo_receita === "taxa"}
              onClick={() => setEditando(r)}
              aria-label="Editar movimentação"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              onClick={() => setExcluir(r)}
              aria-label="Excluir movimentação"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <MovimentacaoDialog
        open={!!editando}
        registro={editando}
        onClose={() => setEditando(null)}
        onSaved={onChanged}
      />

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              {excluir &&
                `A entrada de ${formatBRL(excluir.valor)} de ${formatData(excluir.data)} será removida do financeiro.`}
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
    </div>
  );
}
