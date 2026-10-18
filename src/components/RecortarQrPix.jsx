import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Crop } from "lucide-react";

export default function RecortarQrPix({ arquivo, onConfirmar, onCancelar, enviando }) {
  const canvasRef = useRef(null);
  const [imagem, setImagem] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [erro, setErro] = useState("");
  const [preparando, setPreparando] = useState(false);
  const ocupado = enviando || preparando;

  useEffect(() => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    let ativo = true;
    setImagem(null); setErro(""); setZoom(1); setX(50); setY(50);
    img.onload = () => { if (ativo) setImagem(img); };
    img.onerror = () => { if (ativo) setErro("Não foi possível abrir a imagem. Use PNG, JPG ou WebP."); };
    img.src = url;
    return () => { ativo = false; URL.revokeObjectURL(url); };
  }, [arquivo]);

  useEffect(() => {
    if (!imagem || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight) / zoom;
    const sx = (imagem.naturalWidth - lado) * x / 100;
    const sy = (imagem.naturalHeight - lado) * y / 100;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 600, 600);
    ctx.imageSmoothingEnabled = false;
    // Preserve a white margin around the selected QR, without changing its pixels.
    ctx.drawImage(imagem, sx, sy, lado, lado, 30, 30, 540, 540);
  }, [imagem, zoom, x, y]);

  const confirmar = async () => {
    if (!imagem || ocupado) return;
    setPreparando(true); setErro("");
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("recorte");
      await onConfirmar(new File([blob], "pix-qr-recortado.png", { type: "image/png" }));
    } catch {
      setErro("Não foi possível salvar a imagem. Tente novamente.");
    } finally { setPreparando(false); }
  };

  return (
    <div className="rounded-xl border p-3 space-y-3">
      <p className="font-medium text-sm">Recortar QR Code</p>
      <p className="text-xs text-muted-foreground">Ajuste até aparecer apenas o QR completo. Mantenha todos os quadradinhos dentro da área branca.</p>
      {!imagem && !erro && <p className="text-sm">Abrindo imagem…</p>}
      <canvas ref={canvasRef} width={600} height={600} aria-label="Prévia do QR Code recortado" className="w-full max-w-64 aspect-square mx-auto bg-white rounded-lg" />
      <fieldset disabled={ocupado || !imagem} className="space-y-3">
        <label className="block text-sm">Aproximação ({zoom.toFixed(1)}×)<input aria-label="Aproximação do recorte" type="range" min="1" max="8" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="block w-full h-8 accent-primary" /></label>
        <label className="block text-sm">Mover para os lados<input aria-label="Posição horizontal do recorte" type="range" min="0" max="100" value={x} onChange={(e) => setX(Number(e.target.value))} className="block w-full h-8 accent-primary" /></label>
        <label className="block text-sm">Mover para cima ou para baixo<input aria-label="Posição vertical do recorte" type="range" min="0" max="100" value={y} onChange={(e) => setY(Number(e.target.value))} className="block w-full h-8 accent-primary" /></label>
      </fieldset>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onCancelar} disabled={ocupado}>Cancelar</Button>
        <Button type="button" className="h-11 flex-1" onClick={confirmar} disabled={!imagem || ocupado}>{ocupado ? <Loader2 className="animate-spin w-4 h-4" /> : <Crop className="w-4 h-4" />} Usar recorte</Button>
      </div>
    </div>
  );
}
