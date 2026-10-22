import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import "./CookieNotice.css";

const KEY = "kz_aviso_armazenamento_v1";
function jaVisto() {
  try { return localStorage.getItem(KEY) === "lido"; } catch { return false; }
}
export default function CookieNotice() {
  const loc = useLocation();
  const [aberto, setAberto] = useState(() => !jaVisto());
  const publico = ["/","/agendar","/privacidade","/termos","/reembolso","/cookies"].includes(loc.pathname);
  const fechar = () => { try { localStorage.setItem(KEY,"lido"); } catch {} setAberto(false); };
  React.useEffect(() => {
    const reabrir = () => setAberto(true);
    window.addEventListener("kz:aviso-cookies", reabrir);
    return () => window.removeEventListener("kz:aviso-cookies", reabrir);
  }, []);
  if (!publico || !aberto) return null;
  return <aside role="region" aria-label="Aviso de armazenamento e cookies" className="kz-cookie">
    <div className="kz-cookie__symbol"><Cookie size={22} aria-hidden="true" /></div>
    <div className="kz-cookie__content">
      <strong>Privacidade e armazenamento</strong>
      <p>Usamos armazenamento essencial para funcionamento, preferências e sessão. Não incluímos pixels próprios de publicidade ou rastreamento opcional nesta versão. <Link to="/cookies">Leia o aviso de cookies</Link>.</p>
    </div>
    <button type="button" onClick={fechar} className="kz-cookie__ok">Entendi</button>
    <button type="button" onClick={fechar} className="kz-cookie__close" aria-label="Fechar aviso"><X size={18} /></button>
  </aside>;
}
