import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { formatData } from "@/lib/helpers";
import { Check, X } from "lucide-react";

export default function ConfirmacaoParecida({ open, candidatas = [], onEscolher, onNova, onClose }) {
  const [ultimos, setUltimos] = useState({});

  useEffect(() => {
    if (!open) return;
    let vivo = true;
    base44.entities.Atendimento.list().then((ats) => {
      if (!vivo) return;
      const m = {};
      for (const c of candidatas) {
        const doCliente = ats.filter((a) => a.cliente_id === c.id);
        m[c.id] = doCliente.length
          ? doCliente.reduce((acc, a) => ((a.data || "") > acc ? a.data || "" : acc), "")
          : "";
      }
      setUltimos(m);
    }).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [open, candidatas]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Encontramos uma cliente parecida. É esta cliente?</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {candidatas.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-3 space-y-1.5">
              <p className="font-medium">{c.nome}</p>
              <p className="text-sm text-muted-foreground">{c.telefone || "sem telefone"}</p>
              <p className="text-sm text-muted-foreground">
                Último atendimento: {ultimos[c.id] ? formatData(ultimos[c.id]) : "sem atendimentos"}
              </p>
              <Button className="w-full h-10" onClick={() => onEscolher && onEscolher(c)}>
                <Check className="w-4 h-4 mr-1" /> É esta cliente
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full h-10" onClick={() => onNova && onNova()}>
          <X className="w-4 h-4 mr-1" /> Não, criar nova cliente
        </Button>
      </DialogContent>
    </Dialog>
  );
}