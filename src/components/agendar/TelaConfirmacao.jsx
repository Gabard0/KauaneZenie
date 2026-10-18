import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Heart, Clock } from "lucide-react";
import { dataLonga, POLITICA_RESERVA, formatBRL } from "@/lib/helpers";

export default function TelaConfirmacao({ politica = POLITICA_RESERVA, resultado, whatsappUrl, onNovo, onReenviar, reenviando }) {
  const ag = resultado?.agendamento || resultado;
  const manut = resultado?.manutencao;
  return (
    <div className="text-center space-y-6 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-gold" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl">Solicitação de agendamento recebida! ✨</h2>
        <p className="text-sm text-muted-foreground">
          {ag?.taxa_reserva > 0 ? <>Sua taxa de {formatBRL(ag.taxa_reserva)} aguarda conferência do comprovante.</> : "Seu horário foi reservado sem taxa."}
        </p>
        <p className="text-sm text-muted-foreground">
          {ag?.taxa_reserva > 0 ? "Envie o comprovante pelo WhatsApp para a Kauane. Abrir a conversa não confirma o pagamento." : "Fale com a Kauane pelo WhatsApp para combinar os detalhes."}
        </p>
      </div>

      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm space-y-1 text-left">
        <p className="flex justify-between gap-3">
          <span className="text-muted-foreground">Data</span>
          <span className="font-medium capitalize text-right">{dataLonga(ag?.data)}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-muted-foreground">Horário</span>
          <span className="font-medium">{ag?.horario}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-muted-foreground">Procedimento</span>
          <span className="font-medium text-right">{ag?.servico_nome}</span>
        </p>
      </div>

      {manut && (
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 space-y-2 text-left">
          <div className="flex items-center gap-2 text-gold font-semibold text-sm">
            <Heart className="w-4 h-4" /> Manutenção pré-reservada
          </div>
          {manut.status === "agendada" ? (
            <>
              <p className="text-sm">
                <span className="text-muted-foreground">📅 </span>
                <span className="font-medium capitalize">{dataLonga(manut.data)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">⏰ </span>
                <span className="font-medium">{manut.horario}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground flex items-start gap-1.5">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Sua manutenção ficou para <strong className="capitalize">{dataLonga(manut.data)}</strong>, mas o
                horário exato ainda será confirmado. A Kauane vai falar com você pelo WhatsApp.
              </span>
            </p>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            💕 A manutenção será confirmada junto com o seu atendimento após a conferência do comprovante.
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {ag?.taxa_reserva > 0 ? "Seu horário será confirmado após a conferência. Reservas pendentes podem expirar conforme o prazo do estúdio." : "Seu agendamento está confirmado."}
        {ag?.taxa_reserva > 0 && <span className="block mt-2 text-xs whitespace-pre-wrap">{politica}</span>}
      </p>

      {whatsappUrl && (
        <a href={whatsappUrl} target="_blank" rel="noreferrer">
          <Button className="h-12 w-full font-semibold" onClick={onReenviar} disabled={reenviando}>
            <MessageCircle className="w-4 h-4" /> {ag?.taxa_reserva > 0 ? "Enviar comprovante pelo WhatsApp" : "Falar pelo WhatsApp"}
          </Button>
        </a>
      )}
      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onNovo}>
        Agendar outro horário
      </Button>
    </div>
  );
}

