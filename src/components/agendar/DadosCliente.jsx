import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskTelefone } from "@/lib/booking";
import { todayISO } from "@/lib/helpers";
import { Checkbox } from "@/components/ui/checkbox";

const inputCls =
  "h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-gold/60";

export default function DadosCliente({ nome, whatsapp, nascimento = "", onChange, aceitaAniversario = false, exibirAniversario = true }) {
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
      {exibirAniversario && <div className="space-y-2 rounded-xl border p-3.5">
        <label className="flex items-start gap-3 cursor-pointer text-sm leading-relaxed" htmlFor="ag-consentimento-aniversario">
          <Checkbox id="ag-consentimento-aniversario" checked={aceitaAniversario}
            onCheckedChange={(v) => onChange("aceitaAniversario", v === true)} />
          Quero informar meu aniversário para receber felicitações ou benefícios opcionais do estúdio. Posso revogar essa escolha.
        </label>
        {aceitaAniversario && <div className="space-y-1.5 pt-2">
        <Label htmlFor="ag-nasc">🎂 Data de nascimento (opcional)</Label>
        <Input
          id="ag-nasc"
          type="date"
          value={nascimento}
          max={todayISO()}
          onChange={(e) => onChange("nascimento", e.target.value)}
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground">Informação opcional, somente para a finalidade descrita acima.</p>
        </div>}
      </div>}
    </div>
  );
}