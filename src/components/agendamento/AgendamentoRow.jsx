import React from "react";
import { Lock, ChevronRight, Heart, Sparkles, Clock } from "lucide-react";
import { STATUS, STATUS_PAGAMENTO } from "@/lib/helpers";

export default function AgendamentoRow({ agendamento, onClick }) {
  const st = STATUS[agendamento.status] || STATUS.agendado;
  const bloqueio = !agendamento.cliente_id && agendamento.titulo;
  const ehManut = agendamento.tipo === "manutencao";
  const aguardando = ehManut && agendamento.manutencao_status === "aguardando_horario";
  const temVinculo = !!agendamento.manutencao_vinculada_id;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 rounded-xl border bg-card p-3.5 hover:shadow-sm transition-shadow active:scale-[0.99]"
    >
      <div className="font-semibold text-sm w-12 shrink-0">
        {aguardando ? (
          <span className="inline-flex items-center text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
          </span>
        ) : (
          agendamento.horario
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate flex items-center gap-1.5">
          {bloqueio ? (
            <>
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{agendamento.titulo}</span>
            </>
          ) : (
            <>
              {ehManut && <Heart className="w-3.5 h-3.5 text-gold shrink-0" />}
              {agendamento.cliente_nome || "Cliente"}
              {temVinculo && <Sparkles className="w-3 h-3 text-gold shrink-0" />}
            </>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {bloqueio ? (
            "Horário bloqueado"
          ) : ehManut ? (
            aguardando ? (
              "Manutenção — aguardando horário"
            ) : (
              "Manutenção"
            )
          ) : (
            agendamento.servico_nome || "Procedimento"
          )}
        </div>
      </div>
      {agendamento.origem === "online" && !bloqueio && (
        <span className="text-[10px] font-bold tracking-wider bg-gold text-primary px-1.5 py-1 rounded shrink-0">
          ONLINE
        </span>
      )}
      {agendamento.status_pagamento === "aguardando_comprovante" ? (
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_PAGAMENTO.aguardando_comprovante.cls}`}>
          {STATUS_PAGAMENTO.aguardando_comprovante.label}
        </span>
      ) : (
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}