import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatData } from "@/lib/helpers";
import { ReceiptText, ArrowRight } from "lucide-react";

export default function ComprovantesPendentes({ ags, onAbrirDetalhe }) {
  const [aberto, setAberto] = useState(false);

  const pendentes = (ags || [])
    .filter(
      (a) =>
        a.status_pagamento === "aguardando_comprovante" &&
        a.status !== "cancelado"
    )
    .sort((a, b) => (a.data + (a.horario || "")).localeCompare(b.data + (b.horario || "")));

  if (pendentes.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="w-full text-left rounded-2xl border border-amber-400/50 bg-amber-50/70 dark:bg-amber-500/10 p-4 flex items-center gap-3 transition-shadow hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
          <ReceiptText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {pendentes.length} {pendentes.length === 1 ? "comprovante aguardando confirmação" : "comprovantes aguardando confirmação"}
          </p>
          <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
            Toque para revisar e confirmar os pagamentos
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aguardando comprovante</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-1 px-1">
            <div className="space-y-2">
              {pendentes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAberto(false);
                    onAbrirDetalhe(a.id);
                  }}
                  className="w-full text-left flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.cliente_nome || "Bloqueio"}</p>
                    <p className="text-muted-foreground truncate">{a.servico_nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatData(a.data)} {a.horario ? `· ${a.horario}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    Confirmar
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}