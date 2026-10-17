import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AgendamentoRow from "@/components/agendamento/AgendamentoRow";
import AgendamentoDetalhe from "@/components/agendamento/AgendamentoDetalhe";
import AgendamentoDialog from "@/components/agendamento/AgendamentoDialog";
import { todayISO, toISO, dataLonga, dataMedia, diaCurto, mesAno, Carregando } from "@/lib/helpers";
import { ChevronLeft, ChevronRight, CalendarPlus, Lock } from "lucide-react";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Agenda() {
  const [vista, setVista] = useState("dia");
  const [dataSel, setDataSel] = useState(todayISO());
  const [ags, setAgs] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [novo, setNovo] = useState(false);
  const [bloquear, setBloquear] = useState(false);

  const carregar = async () => setAgs(await base44.entities.Agendamento.list());
  useEffect(() => {
    // Libera horários de reservas temporárias vencidas ao abrir a agenda
    base44.functions.invoke("expirarReservas", {}).catch(() => {}).finally(() => carregar());
    // Tempo real: agendamentos feitos pelo link aparecem aqui na hora, sem recarregar
    const unsub = base44.entities.Agendamento.subscribe(() => carregar());
    return unsub;
  }, []);

  const mudarDia = (n) => {
    const d = new Date(dataSel + "T00:00:00");
    d.setDate(d.getDate() + n);
    setDataSel(toISO(d));
  };

  const mudarMes = (n) => {
    const [a, m] = dataSel.split("-").map(Number);
    const d = new Date(a, m - 1 + n, 1);
    setDataSel(toISO(d));
  };

  const ordenados = (lista) =>
    [...lista].sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

  const doDia = (d) => ordenados((ags || []).filter((a) => a.data === d));

  const diasSemana = useMemo(() => {
    const b = new Date(dataSel + "T00:00:00");
    const ini = new Date(b);
    ini.setDate(b.getDate() - b.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ini);
      d.setDate(ini.getDate() + i);
      return toISO(d);
    });
  }, [dataSel]);

  const celulasMes = useMemo(() => {
    const [ano, mes] = dataSel.split("-").map(Number);
    const total = new Date(ano, mes, 0).getDate();
    const offset = new Date(ano, mes - 1, 1).getDay();
    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: total }, (_, i) => toISO(new Date(ano, mes - 1, i + 1))),
    ];
  }, [dataSel]);

  if (ags === null) return <Carregando />;
  const hoje = todayISO();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-heading font-semibold">Agenda</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-11" onClick={() => setBloquear(true)}>
            <Lock className="w-4 h-4 mr-1" /> Bloquear horário
          </Button>
          <Button className="flex-1 sm:flex-none h-11" onClick={() => setNovo(true)}>
            <CalendarPlus className="w-4 h-4 mr-1" /> Novo agendamento
          </Button>
        </div>
      </div>

      <div className="flex rounded-xl border bg-card p-1 gap-1">
        {["dia", "semana", "mes"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
              vista === v ? "bg-primary text-gold" : "text-muted-foreground"
            }`}
          >
            {v === "dia" ? "Dia" : v === "semana" ? "Semana" : "Mês"}
          </button>
        ))}
      </div>

      {vista === "dia" && (
        <>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => mudarDia(-1)} aria-label="Dia anterior">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <p className="font-semibold capitalize">{dataLonga(dataSel)}</p>
              {dataSel !== hoje && (
                <button type="button"                   className="text-sm text-gold font-medium" onClick={() => setDataSel(hoje)}>
                  Ir para hoje
                </button>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => mudarDia(1)} aria-label="Próximo dia">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {doDia(dataSel).length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {doDia(dataSel).map((a) => (
                <AgendamentoRow key={a.id} agendamento={a} onClick={() => setSelecionado(a.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {vista === "semana" && (
        <div className="space-y-5">
          {diasSemana.map((d) => (
            <div key={d} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className={`font-semibold text-sm ${d === hoje ? "text-gold" : ""}`}>
                  {diaCurto(d)} · {dataMedia(d)}
                  {d === hoje ? " (hoje)" : ""}
                </p>
                <div className="flex-1 border-t" />
              </div>
              {doDia(d).length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">Sem agendamentos</p>
              ) : (
                doDia(d).map((a) => (
                  <AgendamentoRow key={a.id} agendamento={a} onClick={() => setSelecionado(a.id)} />
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {vista === "mes" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <p className="flex-1 text-center font-semibold">{mesAno(dataSel)}</p>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => mudarMes(1)} aria-label="Próximo mês">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celulasMes.map((d, i) => {
              if (!d) return <div key={`v${i}`} />;
              const itens = (ags || []).filter((a) => a.data === d && a.status !== "cancelado");
              const ehHoje = d === hoje;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDataSel(d);
                    setVista("dia");
                  }}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    ehHoje ? "border-gold bg-gold/10" : "bg-card hover:bg-muted"
                  }`}
                >
                  <span className={`text-sm font-medium ${ehHoje ? "text-gold" : ""}`}>
                    {Number(d.slice(-2))}
                  </span>
                  {itens.length > 0 && (
                    <div className="flex gap-0.5">
                      {itens.slice(0, 3).map((a) => (
                        <span key={a.id} className="w-1.5 h-1.5 rounded-full bg-gold" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AgendamentoDialog
        open={novo}
        onClose={() => setNovo(false)}
        onSaved={carregar}
        defaults={{ data: dataSel }}
      />
      <AgendamentoDialog
        open={bloquear}
        modo="bloqueio"
        onClose={() => setBloquear(false)}
        onSaved={carregar}
        defaults={{ data: dataSel }}
      />
      {selecionado && (
        <AgendamentoDetalhe
          agendamentoId={selecionado}
          onClose={() => setSelecionado(null)}
          onChanged={carregar}
        />
      )}
    </div>
  );
}