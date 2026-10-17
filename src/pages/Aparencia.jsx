import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import { TEMAS, MODOS, aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";
import { adminSalvarConfig } from "@/lib/adminAuth";

export default function Aparencia() {
  const { toast } = useToast();
  const [tema, setTema] = useState(temaSalvo());
  const [modo, setModo] = useState(modoSalvo());
  const [salvando, setSalvando] = useState(false);

  const escolher = async (novoTema, novoModo) => {
    setTema(novoTema);
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
          title: `Tema ${TEMAS[novoTema].nome} · ${MODOS[novoModo].nome} ativado`,
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
          Escolha o tema e o modo — a mudança é imediata e fica salva para o próximo login.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Tema</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(TEMAS).map(([chave, t]) => {
            const ativo = tema === chave;
            return (
              <button
                key={chave}
                type="button"
                onClick={() => escolher(chave, modo)}
                className={`text-left rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                  ativo ? "border-gold ring-2 ring-gold/40 bg-gold/5" : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {t.emoji} {t.nome}
                  </p>
                  {ativo && (
                    <span className="w-6 h-6 rounded-full bg-gold text-primary flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                <div className="flex gap-2 mt-4">
                  {t.cores.map((c) => (
                    <span
                      key={c}
                      className="w-8 h-8 rounded-full border border-border shadow-inner"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Modo</p>
        <div className="rounded-2xl bg-card border p-1.5 grid grid-cols-2 gap-1.5 max-w-sm">
          {Object.entries(MODOS).map(([chave, m]) => (
            <button
              key={chave}
              type="button"
              onClick={() => escolher(tema, chave)}
              className={`h-12 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                modo === chave
                  ? "bg-gold text-primary font-semibold shadow"
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