import { POLITICA_RESERVA } from "@/lib/helpers";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Copy, ExternalLink, Download, Share2, Save, Loader2, Upload } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Switch } from "@/components/ui/switch";
import { digits, maskTelefone } from "@/lib/booking";
import { base44 } from "@/api/base44Client";
import { adminLerConfig, adminSalvarConfig } from "@/lib/adminAuth";
import { VARS, VAR_LABELS, montarMensagem, DADOS_EXEMPLO } from "@/lib/mensagem";

const ERROS = {
  whatsapp_invalido: "Informe um WhatsApp válido com DDD (ex.: (41) 99999-9999)",
  mensagem_invalida: "A mensagem deve ter entre 5 e 1500 caracteres",
  sessao_invalida: "Sua sessão expirou. Entre novamente.",
  nada_para_salvar: "Nada para salvar",
};

const btnAcao = "h-12";

export default function AgendamentoOnline() {
  const { toast } = useToast();
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [exigirTaxa, setExigirTaxa] = useState(true);
  const [taxa, setTaxa] = useState("30");
  const [pixQr, setPixQr] = useState("");
  const [pixCopia, setPixCopia] = useState("");
  const [waComprovantes, setWaComprovantes] = useState("");
  const [tempoReserva, setTempoReserva] = useState("15");
  const [subindoQr, setSubindoQr] = useState(false);
  const areaRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const url = window.location.origin + "/agendar";
    setLink(url);
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then(setQr)
      .catch(() => setQr(""));
    adminLerConfig()
      .then((cfg) => {
        setWhatsapp(maskTelefone(cfg.whatsapp || "4185250785"));
        setMensagem(cfg.mensagem_whatsapp || "");
        setExigirTaxa(cfg.exigir_taxa !== false);
        setTaxa(String(cfg.taxa_agendamento || 30));
        setPixQr(cfg.pix_qr_code_url || "");
        setPixCopia(cfg.pix_copia_cola || "");
        setWaComprovantes(maskTelefone(cfg.whatsapp_comprovantes || "41985250785"));
        setTempoReserva(String(cfg.tempo_reserva_minutos || 15));
      })
      .catch(() => setWhatsapp(maskTelefone("4185250785")))
      .finally(() => setCarregado(true));
  }, []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado!" });
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast({ title: "Link copiado!" });
    }
  };

  const abrir = () => window.open(link, "_blank");

  const baixar = () => {
    const a = document.createElement("a");
    a.href = qr;
    a.download = "qrcode-agendamento-barbozza.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const compartilhar = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Agende seu horário pelo nosso link 💅 " + link)}`,
      "_blank"
    );

  const inserirVar = (rotulo) => {
    const area = areaRef.current;
    if (!area) {
      setMensagem((m) => m + rotulo);
      return;
    }
    const ini = area.selectionStart ?? mensagem.length;
    const fim = area.selectionEnd ?? mensagem.length;
    const novo = mensagem.slice(0, ini) + rotulo + mensagem.slice(fim);
    setMensagem(novo);
    requestAnimationFrame(() => {
      area.focus();
      area.selectionStart = area.selectionEnd = ini + rotulo.length;
    });
  };

  const trocarQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubindoQr(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setPixQr(file_url);
      toast({ title: "QR Code atualizado!" });
    } catch (err) {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    } finally {
      setSubindoQr(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const salvarCfg = async () => {
    setSalvando(true);
    try {
      const r = await adminSalvarConfig({
        whatsapp: digits(whatsapp),
        mensagem_whatsapp: mensagem,
        exigir_taxa: exigirTaxa,
        taxa_agendamento: Number(taxa) || 30,
        pix_qr_code_url: pixQr,
        pix_copia_cola: pixCopia,
        whatsapp_comprovantes: digits(waComprovantes),
        tempo_reserva_minutos: Number(tempoReserva) || 15,
      });
      if (!r?.ok) {
        toast({ title: ERROS[r.error] || "Não foi possível salvar", variant: "destructive" });
        return;
      }
      toast({
        title: "Configurações salvas",
        description: "Os novos agendamentos já usarão esta mensagem.",
      });
    } catch {
      toast({ title: "Erro de conexão. Tente novamente.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Agendamento Online</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe o link com suas clientes — os agendamentos entram direto na sua agenda.
        </p>
      </div>

      <div className="rounded-3xl bg-card border border-gold/40 p-6 space-y-5">
        <div className="text-center space-y-2">
          <BrandLogo className="w-56 max-w-full mx-auto" />
          <p className="text-xs tracking-[0.2em] text-gold uppercase">Seu link de agendamento</p>
          <p className="font-heading text-xl">Letícia Barboza · Nail Designer</p>
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            {qr ? (
              <img src={qr} alt="QR Code do link de agendamento" className="w-44 h-44 sm:w-48 sm:h-48 block" />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-xl bg-muted animate-pulse" />
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground break-all px-2">{link}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button variant="outline" className={btnAcao} onClick={copiar}>
            <Copy /> Copiar link
          </Button>
          <Button variant="outline" className={btnAcao} onClick={abrir}>
            <ExternalLink /> Abrir página
          </Button>
          <Button variant="outline" className={btnAcao} onClick={baixar} disabled={!qr}>
            <Download /> Baixar QR Code
          </Button>
          <Button variant="outline" className={btnAcao} onClick={compartilhar}>
            <Share2 /> Compartilhar
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-card border p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-heading font-semibold">Comunicação com a cliente</h2>
          <p className="text-sm text-muted-foreground mt-1">WhatsApp, mensagem e pré-visualização.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wa-numero">WhatsApp do estúdio</Label>
          <Input
            id="wa-numero"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(maskTelefone(e.target.value))}
            placeholder="(41) 8525-0785"
            className="h-12 max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            O botão de confirmação do agendamento online abrirá uma conversa com este número.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa-mensagem">Mensagem do comprovante (enviada após o pagamento)</Label>
          <Textarea
            id="wa-mensagem"
            ref={areaRef}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={9}
            placeholder="Escreva a mensagem que a cliente enviará ao confirmar..."
            disabled={!carregado}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {VARS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => inserirVar(VAR_LABELS[v])}
                className="text-xs font-medium rounded-full border border-gold/40 text-gold px-3 py-1.5 hover:bg-gold/10 transition-colors"
              >
                {VAR_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Pré-visualização</p>
          <div className="rounded-2xl bg-muted/40 border p-4 text-sm whitespace-pre-wrap leading-relaxed">
            {montarMensagem(mensagem, DADOS_EXEMPLO)}
          </div>
        </div>

        <Button className="w-full sm:w-auto h-12" onClick={salvarCfg} disabled={salvando || !carregado}>
          {salvando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save /> Salvar configurações
            </>
          )}
        </Button>
      </div>

      <div className="rounded-3xl bg-card border border-gold/40 p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-lg font-heading font-semibold">Pagamento da taxa de agendamento</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Exija uma taxa via Pix para reservar o horário online. O agendamento só fica confirmado
            após você conferir o comprovante.
          </p>
          <p className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm">
            <strong>Política de reserva: </strong>{POLITICA_RESERVA}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
          <div className="pr-3">
            <p className="text-sm font-medium">Exigir taxa para agendamento online</p>
            <p className="text-xs text-muted-foreground">Quando ativo, a cliente paga a taxa via Pix antes de confirmar.</p>
          </div>
          <Switch checked={exigirTaxa} onCheckedChange={setExigirTaxa} />
        </div>

        {exigirTaxa && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor da taxa (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tempo de reserva (min)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={tempoReserva}
                  onChange={(e) => setTempoReserva(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>QR Code Pix</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-2 bg-white rounded-xl shrink-0">
                  {pixQr ? (
                    <img src={pixQr} alt="QR Code Pix" className="w-24 h-24 block" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground text-center px-2">
                      Sem QR Code
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={trocarQr} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => fileRef.current?.click()}
                    disabled={subindoQr}
                  >
                    {subindoQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Alterar QR Code
                  </Button>
                  <p className="text-xs text-muted-foreground">Envie a imagem do QR Code oficial do seu Pix.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Código Pix copia e cola</Label>
              <Textarea
                value={pixCopia}
                onChange={(e) => setPixCopia(e.target.value)}
                rows={3}
                placeholder="00020126360014br.gov.bcb.pix..."
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>WhatsApp para comprovantes</Label>
              <Input
                inputMode="tel"
                value={waComprovantes}
                onChange={(e) => setWaComprovantes(maskTelefone(e.target.value))}
                placeholder="(41) 98525-0785"
                className="h-12 max-w-xs"
              />
              <p className="text-xs text-muted-foreground">A cliente envia o comprovante do Pix para este número.</p>
            </div>
          </div>
        )}

        <Button className="w-full sm:w-auto h-12" onClick={salvarCfg} disabled={salvando || !carregado}>
          {salvando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save /> Salvar configurações
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        O QR Code aponta sempre para o seu link público — ele continua funcionando mesmo se você
        alterar horários, procedimentos ou a agenda. Os agendamentos feitos pelo link entram na sua
        agenda com o selo ONLINE.
      </p>
    </div>
  );
}
