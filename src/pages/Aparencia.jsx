import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MODOS, aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";
import { adminSalvarConfig } from "@/lib/adminAuth";

export default function Aparencia() {
  const { toast } = useToast();
  const tema = temaSalvo();
  const [modo, setModo] = useState(modoSalvo());
  const [salvando, setSalvando] = useState(false);

  const escolher = async (novoTema, novoModo) => {
    setModo(novoModo);
    aplicarTema(novoTema, novoModo);
    setSalvando(true);
    try {
      const r = await adminSalvarConfig({ tema: novoTema, modo: novoModo });
      if (!r?.ok) {
        toast({
          title: "Tema aplicado, mas não foi possível salvar a preferência",
          variant: "destructive",
        });
      } else {
        toast({
          title: `Modo ${MODOS[novoModo].nome} ativado`,
        });
      }
    } catch {
      toast({
        title: "Tema aplicado, mas não foi possível salvar a preferência",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Aparência</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A identidade Kauane Zenie nos modos claro e escuro. Escolha como prefere visualizar o sistema.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Modo</p>
        <div className="rounded-2xl bg-card border p-1.5 grid grid-cols-2 gap-1.5 max-w-sm">
          {Object.entries(MODOS).map(([chave, m]) => (
            <button
              key={chave}
              type="button"
              onClick={() => escolher(tema, chave)}
              disabled={salvando}
              aria-pressed={modo === chave}
              className={`h-12 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                modo === chave
                  ? "bg-primary text-primary-foreground font-semibold shadow"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {m.emoji} {m.nome}
            </button>
          ))}
        </div>
        {salvando && <p className="text-xs text-muted-foreground">Salvando...</p>}
      </div>

      <p className="text-sm text-muted-foreground">
        A preferência fica salva na sua conta e é aplicada automaticamente ao entrar novamente.
      </p>
    </div>
  );
}
