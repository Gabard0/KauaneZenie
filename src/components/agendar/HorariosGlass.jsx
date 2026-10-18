import React, { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";

export default function HorariosGlass({ horarios, selecionado, onSelect }) {
  const [shake, setShake] = useState({ hora: "", n: 0 });
  const [msg, setMsg] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const tentar = (hora) => {
    setShake((s) => ({ hora, n: s.n + 1 }));
    setMsg(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(false), 2200);
  };

  if (!horarios.length)
    return (
      <p className="text-center text-muted-foreground py-3 text-sm">
        Nenhum horário disponível neste dia — escolha outra data.
      </p>
    );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {horarios.map(({ hora, livre }) => {
          const on = selecionado === hora;
          if (!livre) {
            const shaking = shake.hora === hora;
            return (
              <button
                key={`${hora}-${shaking ? shake.n : "s"}`}
                type="button"
                onClick={() => tentar(hora)}
                className={`h-12 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground font-medium opacity-40 blur-[1.5px] cursor-not-allowed flex items-center justify-center gap-1.5 ${
                  shaking ? "animate-shake blur-0 opacity-70" : ""
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> {hora}
              </button>
            );
          }
          return (
            <button
              key={hora}
              type="button"
              onClick={() => onSelect(hora)}
              className={`h-12 rounded-xl border font-medium transition-all duration-200 ${
                on
                  ? "bg-primary text-primary-foreground border-gold-dark/40 font-semibold shadow-lg scale-[1.03]"
                  : "bg-card hover:border-gold/60 hover:bg-gold/10"
              }`}
            >
              {hora}
            </button>
          );
        })}
      </div>
      {msg && (
        <p className="text-xs text-muted-foreground text-center animate-in fade-in duration-200">
          🔒 Esse horário não está disponível.
        </p>
      )}
    </div>
  );
}
