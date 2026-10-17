import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { todayISO, formatData } from "@/lib/helpers";
import { Gift, Plus } from "lucide-react";

const chipBase = "rounded-full px-4 py-2 text-sm font-medium border transition-colors";
const chipOn = "bg-primary text-primary-foreground border-gold";
const chipOff = "bg-card text-foreground hover:bg-muted";

export default function PromocoesSection({ cliente, onSaved }) {
  const lista = Array.isArray(cliente.promocoes) ? cliente.promocoes : [];
  const [abrir, setAbrir] = useState(false);
  const [tipo, setTipo] = useState("brinde");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(todayISO());
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    try {
      await base44.entities.Cliente.update(cliente.id, {
        promocoes: [...lista, { tipo, descricao: descricao.trim(), data }],
      });
      setAbrir(false);
      setTipo("brinde");
      setDescricao("");
      setData(todayISO());
      onSaved && onSaved();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-gold" /> Promoções e brindes
        </h2>
        <Button variant="outline" size="sm" className="h-9" onClick={() => setAbrir(true)}>
          <Plus className="w-4 h-4 mr-1" /> Registrar
        </Button>
      </div>
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          Nenhuma promoção ou brinde registrado ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {[...lista].reverse().map((p, i) => (
            <div key={i} className="rounded-xl border bg-card p-3">
              <p className="font-medium">
                {p.tipo === "promocao" ? "🏷️ Promoção" : "🎁 Brinde"}
                {p.descricao ? ` · ${p.descricao}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">{formatData(p.data)}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={abrir} onOpenChange={(o) => !o && setAbrir(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar promoção ou brinde</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${chipBase} ${tipo === "brinde" ? chipOn : chipOff}`}
                  onClick={() => setTipo("brinde")}
                >
                  🎁 Brinde
                </button>
                <button
                  type="button"
                  className={`${chipBase} ${tipo === "promocao" ? chipOn : chipOff}`}
                  onClick={() => setTipo("promocao")}
                >
                  🏷️ Promoção
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-1">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={2}
                placeholder="Ex.: brinde de aniversário, 10% de desconto"
              />
            </div>
            <Button className="w-full h-12" onClick={salvar} disabled={salvando || !data}>
              {salvando ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}