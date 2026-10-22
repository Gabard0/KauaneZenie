import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toISO, todayISO } from "@/lib/helpers";
import { slotsDoDia, hojeLocalMin, horarioNaData } from "@/lib/booking";

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarioGlass({ config, duracao = 60, selecionado, onSelect, permitirListaEspera = false }) {
  const [mes, setMes] = useState(0);
  const hoje0 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const fim = useMemo(
    () => new Date(hoje0.getFullYear(), hoje0.getMonth(), hoje0.getDate() + (config?.limite_agendamento_dias || 60)),
    [hoje0, config?.limite_agendamento_dias]
  );
  const base = new Date(hoje0.getFullYear(), hoje0.getMonth() + mes, 1);
  const proxOk = new Date(hoje0.getFullYear(), hoje0.getMonth() + mes + 1, 1) <= fim;

  const dias = useMemo(() => {
    const cells = Array(base.getDay()).fill(null);
    const total = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= total; i++)
      cells.push(new Date(base.getFullYear(), base.getMonth(), i));
    return cells;
  }, [base]);

  const mapa = useMemo(() => {
    const agoraMin = hojeLocalMin();
    const m = {};
    for (const c of dias) {
      if (!c) continue;
      const iso = toISO(c);
      const livre =
        c >= hoje0 && c <= fim &&
        slotsDoDia({
          funcionamento: config?.funcionamento,
          periodosEspeciais: config?.periodosEspeciais,
          excecoes: config?.excecoes,
          ocupados: config?.ocupados,
          dataISO: iso,
          duracao,
          agoraMin: iso === todayISO() ? agoraMin : 0,
        }).length > 0;
      const diaCfg = horarioNaData(config?.funcionamento, config?.periodosEspeciais, iso);
      const aberto = diaCfg?.ativo !== false && (diaCfg?.periodos || []).some(p => p.inicio < p.fim);
      const bloqueado = (config?.excecoes || []).some(e => e.data === iso);
      m[iso] = { livre, lista: permitirListaEspera && !livre && !!aberto && !bloqueado && c >= hoje0 && c <= fim };
    }
    return m;
  }, [dias, config, duracao, hoje0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={mes === 0}
          onClick={() => setMes((m) => m - 1)}
          aria-label="Mês anterior"
          className="w-10 h-10 rounded-full bg-muted/50 border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-heading capitalize text-lg">
          {base.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          disabled={!proxOk}
          onClick={() => setMes((m) => m + 1)}
          aria-label="Próximo mês"
          className="w-10 h-10 rounded-full bg-muted/50 border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] text-muted-foreground">
        {SEMANA.map((s) => (
          <span key={s} className="py-0.5">{s}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dias.map((c, i) => {
          if (!c) return <span key={`vazio-${i}`} />;
          const iso = toISO(c);
          const { livre, lista } = mapa[iso] || { livre: false, lista: false };
          const on = selecionado === iso;
          const hoje = iso === todayISO();
          return (
            <button
              key={iso}
              type="button"
              disabled={!livre && !lista}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-xl sm:rounded-2xl text-sm font-medium transition-all duration-200 ${
                on
                  ? "bg-primary text-primary-foreground font-semibold border border-gold-dark/40 shadow-lg scale-105"
                  : livre
                    ? `bg-card border hover:border-gold/60 hover:bg-gold/10 ${hoje ? "text-gold" : ""}`
                    : lista ? "bg-pink-100/30 border border-pink-400/50 text-pink-700 dark:text-pink-300 hover:bg-pink-100/50" : "text-muted-foreground/35 cursor-not-allowed"
              }`}
            >
              <span>{c.getDate()}</span>{lista && <span className="block text-[8px] leading-tight">Lista</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
