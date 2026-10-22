import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { POLITICA_RESERVA, formatBRL, dataLonga } from "@/lib/helpers";
import { Copy, MessageCircle, AlertTriangle, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function TelaPagamento({ politica = POLITICA_RESERVA, pagamento, resumo, onEnviado, enviando }) {
  const [copiado, setCopiado] = useState(false);
  const taxa = formatBRL(pagamento?.taxa || 30);

  const copiar = async () => {
    const code = pagamento?.pix_copia_cola || "";
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="font-heading text-xl">💳 Taxa para reservar seu horário</h2>
        <p className="text-sm text-muted-foreground">
          Para confirmar sua reserva, é necessário realizar o pagamento de uma taxa de{" "}
          <strong className="text-foreground">{taxa}</strong> via Pix.
        </p>
      </div>

      <div className="rounded-3xl border border-gold/40 bg-white p-5 flex flex-col items-center gap-3">
        <p className="font-heading text-3xl text-stone-800">{taxa}</p>
        <div className="p-3 bg-white rounded-2xl shadow-inner">
          {pagamento?.pix_qr_code_url ? (
            <img
              src={pagamento.pix_qr_code_url}
              alt="QR Code Pix"
              className="w-52 h-52 block"
            />
          ) : (
            <div className="w-52 h-52 rounded-xl bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">
              QR Code indisponível
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Escaneie o QR Code com o app do seu banco</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <p className="text-sm font-semibold">Ou use o Pix Copia e Cola:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted/60 rounded-lg px-3 py-2.5 break-all leading-relaxed">
            {pagamento?.pix_copia_cola || "—"}
          </code>
        </div>
        <Button variant="outline" className="w-full h-11" onClick={copiar}>
          {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copiado ? "Código copiado!" : "Copiar código Pix"}
        </Button>
      </div>

      <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4 space-y-1.5">
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Importante
        </p>
        <p className="text-sm text-amber-800/90 dark:text-amber-200/80">
          O pagamento do Pix é necessário para reservar seu horário. <span className="whitespace-pre-wrap">{politica}</span>
        </p>
        <p className="text-sm text-amber-800/90 dark:text-amber-200/80">
          Depois de realizar o pagamento, envie o comprovante pelo WhatsApp da Kauane.
        </p>
        <p className="text-sm text-amber-800/90 dark:text-amber-200/80">
          Seu horário só será confirmado após a conferência do comprovante.
        </p>
        <p className="text-sm"><Link className="underline font-semibold" to="/reembolso" target="_blank" rel="noopener noreferrer">Política de cancelamento e reembolso</Link></p>
      </div>

      <Button className="w-full h-14 font-semibold text-base" onClick={onEnviado} disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Abrindo WhatsApp...
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5" /> Enviar comprovante pelo WhatsApp
          </>
        )}
      </Button>

      {resumo && (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm space-y-1">
          <p className="flex justify-between gap-3">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium capitalize text-right">{dataLonga(resumo.data)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium">{resumo.horario}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-muted-foreground">Procedimento</span>
            <span className="font-medium text-right">{resumo.procedimento}</span>
          </p>
        </div>
      )}
    </div>
  );
}

