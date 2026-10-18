import React from "react";
import { Check } from "lucide-react";
import { formatBRL } from "@/lib/helpers";

export default function ServicosLista({ servicos, selecionados, onToggle }) {
  return (
    <div className="space-y-2">
      {servicos.map((s) => {
        const on = selecionados.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
              on ? "border-gold bg-gold/10" : "bg-card hover:bg-muted/40"
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{s.nome}</p>
              <p className="text-sm text-muted-foreground">
                {formatBRL(s.preco)} · {s.duracao} min
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ml-3 ${
                on ? "bg-primary border-primary text-primary-foreground" : "border-border"
              }`}
            >
              {on && <Check className="w-4 h-4" />}
            </div>
          </button>
        );
      })}
      {servicos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum procedimento ativo cadastrado.
        </p>
      )}
    </div>
  );
}
