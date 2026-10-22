import React, { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Download, Share2, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BrandLogo from "@/components/BrandLogo";
import ConfiguracoesDialog from "@/components/ConfiguracoesDialog";
import { Carregando } from "@/lib/helpers";

const ConfiguracoesAgendamento = lazy(() => import("@/components/ConfiguracoesAgendamento"));

export default function AgendamentoOnline() {
  const { toast } = useToast();
  const [configOpen, setConfigOpen] = useState(false);
  const [abaConfig, setAbaConfig] = useState("comunicacao");
  const [qr, setQr] = useState("");
  const [erroQr, setErroQr] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const link = window.location.origin + "/agendar";
  useEffect(() => {
    let ativo = true;
    setErroQr(false);
    import("qrcode").then(({ default: QRCode }) => QRCode.toDataURL(link, {
      width: 480, margin: 2, errorCorrectionLevel: "M",
      color: { dark: "#560623", light: "#FFFFFF" },
    })).then((url) => { if (ativo) setQr(url); }).catch(() => { if (ativo) setErroQr(true); });
    return () => { ativo = false; };
  }, [link, tentativa]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado!" });
    } catch {
      toast({ title: "Selecione e copie o link abaixo.", variant: "destructive" });
    }
  };
  const compartilhar = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Agende com Kauane Zenie", url: link }); }
      catch (e) { if (e.name !== "AbortError") await copiar(); }
    } else window.open(`https://wa.me/?text=${encodeURIComponent("Agende seu horário ✨ " + link)}`, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-heading font-semibold">Link de agendamento</h1>
          <p className="text-sm text-muted-foreground">Compartilhe com suas clientes.</p>
        </div>
        <ConfiguracoesDialog open={configOpen} onOpenChange={(v) => { setConfigOpen(v); if (!v) setAbaConfig("comunicacao"); }} titulo="Configurações do agendamento" descricao="WhatsApp, reserva, manutenção e pagamento Pix.">
          <Suspense fallback={<Carregando />}><ConfiguracoesAgendamento abaInicial={abaConfig} /></Suspense>
        </ConfiguracoesDialog>
      </div>
      <section className="rounded-3xl border bg-card p-5 sm:p-6 space-y-4 text-center">
        <BrandLogo className="w-48 mx-auto" />
        <div className="mx-auto w-44 h-44 bg-white rounded-2xl p-2 flex items-center justify-center">
          {qr ? <img src={qr} alt="QR Code para agendar com Kauane Zenie" width="160" height="160" /> : erroQr ? <Button variant="outline" onClick={() => setTentativa((v) => v + 1)}>Tentar QR novamente</Button> : <span className="text-sm text-gray-600">Gerando QR Code…</span>}
        </div>
        <input aria-label="Link público de agendamento" readOnly value={link} onFocus={(e) => e.target.select()} className="w-full rounded-xl border bg-background px-3 h-11 text-center text-sm min-w-0" />
        <div className="grid grid-cols-2 gap-2">
          <Button className="h-12" onClick={copiar}><Copy /> Copiar link</Button>
          <Button className="h-12" variant="outline" onClick={compartilhar}><Share2 /> Compartilhar</Button>
          <Button variant="ghost" className="h-11" asChild><a href={link} target="_blank" rel="noreferrer"><ExternalLink /> Abrir página</a></Button>
          <Button variant="ghost" className="h-11" disabled={!qr} asChild={!!qr}>{qr ? <a href={qr} download="qrcode-kauane-zenie.png"><Download /> Baixar QR</a> : <span>Gerando QR…</span>}</Button>
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="outline" className="w-full h-12" onClick={() => { setAbaConfig("reserva"); setConfigOpen(true); }}>
          Limite de dias e manutenção
        </Button>
        <Button variant="outline" className="w-full h-12" onClick={() => { setAbaConfig("pix"); setConfigOpen(true); }}><QrCode /> Configurar Pix e QR Code</Button>
      </div>
    </div>
  );
}
