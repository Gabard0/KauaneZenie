import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Instagram, MapPin, Menu, MessageCircle, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO } from "@/lib/brand";
import { base44 } from "@/api/base44Client";
import { formatBRL } from "@/lib/helpers";
import "./Landing.css";

const FOTOS = {
  hero: "https://images.pexels.com/photos/8554941/pexels-photo-8554941.jpeg?auto=compress&cs=tinysrgb&w=1800",
  detalhe: "https://images.pexels.com/photos/7446923/pexels-photo-7446923.jpeg?auto=compress&cs=tinysrgb&w=1100",
  aplicacao: "https://images.pexels.com/photos/7446922/pexels-photo-7446922.jpeg?auto=compress&cs=tinysrgb&w=1100",
  tecnica: "https://images.pexels.com/photos/5128233/pexels-photo-5128233.jpeg?auto=compress&cs=tinysrgb&w=1200",
  cuidado: "https://images.pexels.com/photos/7446924/pexels-photo-7446924.jpeg?auto=compress&cs=tinysrgb&w=1300",
};

// Fotografias editoriais ilustrativas (Pexels). Substituir por trabalhos autorizados da Kauane
// quando as imagens reais do portfólio estiverem disponíveis.
const nav = [
  { href: "#conceito", label: "Sobre" },
  { href: "#procedimentos", label: "Procedimentos" },
  { href: "#experiencia", label: "Experiência" },
  { href: "#contato", label: "Contato" },
];

function Foto({ src, alt, className = "", loading = "lazy" }) {
  const [falhou, setFalhou] = useState(false);
  return falhou ? (
    <div className={`kz-photo-fallback ${className}`} role="img" aria-label={alt}>
      <span>kz<span className="kz-photo-fallback__point">.</span></span>
    </div>
  ) : (
    <img className={className} src={src} alt={alt} loading={loading} decoding="async" onError={() => setFalhou(true)} />
  );
}

function BotaoAgendar({ className = "", children = "Agendar horário" }) {
  return (
    <Link to="/agendar" className={`kz-pill kz-pill--solid ${className}`}>
      {children} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

export default function Landing() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [servicosCarregando, setServicosCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    base44.functions.invoke("getBookingConfig", {})
      .then((r) => {
        if (ativo) setServicos(Array.isArray(r?.data?.servicos) ? r.data.servicos : []);
      })
      .catch(() => { if (ativo) setServicos([]); })
      .finally(() => { if (ativo) setServicosCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="kz-site" id="topo">
      <div className="kz-shell">
        <section className="kz-hero" aria-labelledby="kz-hero-title">
          <Foto src={FOTOS.hero} alt="Detalhe do olhar durante um atendimento de beleza" className="kz-hero__photo" loading="eager" />
          <div className="kz-hero__shade" />

          <header className="kz-header">
            <Link to="/" className="kz-header__brand" aria-label="Kauane Zenie — início" onClick={fecharMenu}>
              <BrandLogo variant="horizontal" className="w-full" />
            </Link>
            <nav className="kz-header__nav" aria-label="Navegação principal">
              {nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
            </nav>
            <Link to="/agendar" className="kz-header__cta">Agendar <ArrowRight size={15} aria-hidden="true" /></Link>
            <button type="button" className="kz-header__menu" aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="kz-mobile-menu" onClick={() => setMenuAberto((v) => !v)}>
              {menuAberto ? <X size={23} /> : <Menu size={23} />}
            </button>
          </header>

          {menuAberto && (
            <nav className="kz-mobile-menu" id="kz-mobile-menu" aria-label="Navegação mobile">
              {nav.map((item) => <a key={item.href} href={item.href} onClick={fecharMenu}>{item.label}</a>)}
              <Link to="/agendar" onClick={fecharMenu}>Agendar horário <ArrowRight size={17} /></Link>
            </nav>
          )}

          <div className="kz-hero__eyebrow">KAUANE ZENIE <span>·</span> LASH & BROW STUDIO</div>
          <div className="kz-hero__content">
            <h1 id="kz-hero-title">A beleza está nos detalhes.</h1>
            <p>Extensão de cílios & cuidados com o olhar em Ipanema, Pontal do Paraná.</p>
            <BotaoAgendar className="kz-hero__button">Reserve seu momento</BotaoAgendar>
          </div>
          <span className="kz-hero__display" aria-hidden="true">olhar</span>
          <a className="kz-hero__scroll" href="#conceito" aria-label="Conheça o estúdio"><ArrowDown size={18} /></a>
          <span className="kz-hero__index" aria-hidden="true">01 / 04</span>
        </section>

        <main>
          <section className="kz-concept kz-section" id="conceito" aria-labelledby="kz-concept-title">
            <div className="kz-concept__copy">
              <p className="kz-kicker">01 — Nossa essência</p>
              <h2 id="kz-concept-title">Seu olhar, <em>sua essência.</em></h2>
              <p className="kz-copy-lead">Beleza que respeita quem você é.</p>
              <p>Um espaço dedicado a realçar a beleza do seu olhar com delicadeza, cuidado e atenção aos detalhes. Cada atendimento é um momento só seu.</p>
              <BotaoAgendar>Conhecer o agendamento</BotaoAgendar>
            </div>
            <div className="kz-concept__photo">
              <Foto src={FOTOS.detalhe} alt="Aplicação cuidadosa de extensão de cílios" />
              <span className="kz-image-caption">CUIDADO EM CADA DETALHE — KZ STUDIO</span>
            </div>
          </section>

          <section className="kz-gallery kz-section" id="experiencia" aria-labelledby="kz-experience-title">
            <div className="kz-gallery__item">
              <Foto src={FOTOS.aplicacao} alt="Procedimento profissional de extensão de cílios" />
            </div>
            <div className="kz-gallery__item kz-gallery__item--offset">
              <Foto src={FOTOS.tecnica} alt="Detalhe do trabalho de uma profissional aplicando cílios" />
            </div>
            <div className="kz-gallery__copy">
              <p className="kz-kicker">02 — A experiência</p>
              <h2 id="kz-experience-title">O detalhe faz a <em>diferença.</em></h2>
              <p>Um olhar marcante não precisa perder sua leveza. Valorizamos o cuidado, a precisão e a harmonia de cada resultado.</p>
              <a href="#procedimentos" className="kz-text-link">Descubra os procedimentos <ArrowRight size={17} aria-hidden="true" /></a>
              <div className="kz-gallery__small">
                <Foto src={FOTOS.cuidado} alt="Atendimento de extensão de cílios em ambiente profissional" />
              </div>
            </div>
          </section>

          <section className="kz-services kz-section" id="procedimentos" aria-labelledby="kz-services-title">
            <div className="kz-services__intro">
              <p className="kz-kicker">03 — Procedimentos</p>
              <h2 id="kz-services-title">Para um olhar <em>único.</em></h2>
              <p>Escolha o cuidado ideal para você. Os procedimentos e valores disponíveis são atualizados diretamente pela agenda do estúdio.</p>
            </div>
            <div className="kz-services__list">
              {servicosCarregando ? (
                <p className="kz-services__feedback" role="status">Consultando procedimentos disponíveis…</p>
              ) : servicos.length > 0 ? (
                servicos.slice(0, 6).map((servico, i) => (
                  <Link to="/agendar" className="kz-service" key={servico.id}>
                    <span className="kz-service__number">{String(i + 1).padStart(2, "0")}</span>
                    <span className="kz-service__name">{servico.nome}</span>
                    <span className="kz-service__meta">
                      {servico.preco > 0 ? formatBRL(servico.preco) : "Consulte o valor"}
                      {servico.duracao > 0 ? ` · ${servico.duracao} min` : ""}
                    </span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </Link>
                ))
              ) : (
                <div className="kz-services__feedback">
                  <p>Extensão de cílios, manutenção e cuidados com o olhar.</p>
                  <p>Confira os procedimentos disponíveis e os horários na agenda.</p>
                </div>
              )}
              <BotaoAgendar className="kz-services__action">Ver horários disponíveis</BotaoAgendar>
            </div>
          </section>

          <section className="kz-statement kz-section" aria-labelledby="kz-statement-title">
            <div className="kz-statement__display" aria-hidden="true">beleza</div>
            <div className="kz-statement__top">
              <p className="kz-kicker">Um convite ao autocuidado</p>
              <h2 id="kz-statement-title">A beleza de se sentir <em>você.</em></h2>
            </div>
            <div className="kz-statement__visual">
              <Foto src={FOTOS.cuidado} alt="Momento de cuidado durante um procedimento de beleza" />
            </div>
            <div className="kz-statement__bottom">
              <p>Mais do que um procedimento: um tempo para se cuidar, se olhar com carinho e valorizar cada detalhe da sua beleza.</p>
              <BotaoAgendar>Quero agendar</BotaoAgendar>
            </div>
          </section>

          <section className="kz-contact kz-section" id="contato" aria-labelledby="kz-contact-title">
            <div>
              <p className="kz-kicker">04 — Onde estamos</p>
              <h2 id="kz-contact-title">Seu momento começa <em>aqui.</em></h2>
              <p>Esperamos por você em Ipanema, Pontal do Paraná.</p>
            </div>
            <div className="kz-contact__info">
              <div className="kz-contact__address"><MapPin size={20} aria-hidden="true" /><span>{STUDIO.address}<br />{STUDIO.city}</span></div>
              <BotaoAgendar>Agendar meu horário</BotaoAgendar>
              <div className="kz-contact__socials">
                <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Instagram</a>
                <a href={STUDIO.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a>
              </div>
            </div>
          </section>
        </main>

        <footer className="kz-footer">
          <div className="kz-footer__brand"><BrandLogo variant="horizontal" className="w-full" /></div>
          <p>Seu olhar, sua essência.</p>
          <nav aria-label="Links do rodapé">
            <a href="#topo">Voltar ao topo</a>
            <Link to="/agendar">Agendamento</Link>
            <Link to="/login">Área administrativa</Link>
          </nav>
          <small>© {new Date().getFullYear()} Kauane Zenie · Studio de Beleza</small>
        </footer>
      </div>
    </div>
  );
}
