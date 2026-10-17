import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

export default function DiaFuncionamento({ label, dia, onChange }) {
  const setPeriodo = (i, campo, valor) =>
    onChange({
      ...dia,
      periodos: dia.periodos.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)),
    });
  const addPeriodo = () =>
    onChange({ ...dia, periodos: [...dia.periodos, { inicio: "09:00", fim: "18:00" }] });
  const removePeriodo = (i) =>
    onChange({ ...dia, periodos: dia.periodos.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <Switch checked={!!dia.ativo} onCheckedChange={(v) => onChange({ ...dia, ativo: v })} />
      </div>
      {dia.ativo && (
        <div className="space-y-2">
          {dia.periodos.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum período definido neste dia.</p>
          )}
          {dia.periodos.map((p, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
              <Input
                type="time"
                value={p.inicio}
                onChange={(e) => setPeriodo(i, "inicio", e.target.value)}
                className="h-11 flex-1 min-w-0 w-0"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <Input
                type="time"
                value={p.fim}
                onChange={(e) => setPeriodo(i, "fim", e.target.value)}
                className="h-11 flex-1 min-w-0 w-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePeriodo(i)}
                aria-label="Remover período"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addPeriodo}>
            <Plus /> Adicionar período
          </Button>
        </div>
      )}
    </div>
  );
}
