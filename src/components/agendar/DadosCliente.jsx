import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskTelefone } from "@/lib/booking";
import { todayISO } from "@/lib/helpers";

const inputCls =
  "h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-gold/60";

export default function DadosCliente({ nome, whatsapp, nascimento = "", onChange }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ag-nome">Nome</Label>
        <Input
          id="ag-nome"
          value={nome}
          onChange={(e) => onChange("nome", e.target.value)}
          placeholder="Seu nome"
          className={inputCls}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ag-whats">WhatsApp</Label>
        <Input
          id="ag-whats"
          inputMode="tel"
          value={whatsapp}
          onChange={(e) => onChange("whatsapp", maskTelefone(e.target.value))}
          placeholder="(41) 99999-9999"
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground">O WhatsApp é obrigatório para confirmarmos seu horário.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ag-nasc">🎂 Data de aniversário (opcional)</Label>
        <Input
          id="ag-nasc"
          type="date"
          value={nascimento}
          max={todayISO()}
          onChange={(e) => onChange("nascimento", e.target.value)}
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground">Assim podemos lhe dar um tratamento especial no seu dia.</p>
      </div>
    </div>
  );
}