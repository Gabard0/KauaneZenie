import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduzirMovimento = useReducedMotion();
  return falhou ? (
    <div className={`kz-photo-fallback ${className}`} role="img" aria-label={alt}>
      <span>kz<span className="kz-photo-fallback__point">.</span></span>
    </div>
  ) : (
    loading === "eager" ? (
      <motion.img className={className} src={src} alt={alt} loading="eager" decoding="async" onError={() => setFalhou(true)}
        initial={reduzirMovimento ? false : { opacity: 0.65, scale: 1.075 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }} />
    ) : (
      <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFalhou(true)} />
    )
  );
}

// Reveals once and respects reduced-motion preferences.
function Reveal({ children, className = "", delay = 0 }) {
  const reduzirMovimento = useReducedMotion();
  return (
    <motion.div className={className}
      initial={reduzirMovimento ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
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
  const reduzirMovimento = useReducedMotion();
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
          <motion.div className="kz-hero__content"
            initial={reduzirMovimento ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.88, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}>
            <h1 id="kz-hero-title">Cílios que combinam com <em>você.</em></h1>
            <p>Alongamento de cílios e cuidados com o olhar em Ipanema, Pontal do Paraná.</p>
            <BotaoAgendar className="kz-hero__button">Escolher meu horário</BotaoAgendar>
          </motion.div>
          <motion.span className="kz-hero__display" aria-hidden="true"
            initial={reduzirMovimento ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}>olhar</motion.span>
          <a className="kz-hero__scroll" href="#conceito" aria-label="Conheça o estúdio"><ArrowDown size={18} /></a>
          <span className="kz-hero__index" aria-hidden="true">01 / 04</span>
        </section>

        <main>
          <section className="kz-concept kz-section" id="conceito" aria-labelledby="kz-concept-title">
            <Reveal className="kz-concept__copy">
              <p className="kz-kicker">01 — Nossa essência</p>
              <h2 id="kz-concept-title">Seu olhar, <em>do seu jeito.</em></h2>
              <p className="kz-copy-lead">Cada detalhe tem um propósito.</p>
              <p>Curvatura, volume e acabamento fazem diferença no resultado. Aqui, a proposta é valorizar seu olhar com um atendimento cuidadoso, sem fórmulas prontas.</p>
              <BotaoAgendar>Ver horários</BotaoAgendar>
            </Reveal>
            <Reveal className="kz-concept__photo" delay={0.12}>
              <Foto src={FOTOS.detalhe} alt="Aplicação cuidadosa de extensão de cílios" />
              <span className="kz-image-caption">KAUANE ZENIE · LASH STUDIO</span>
            </Reveal>
          </section>

          <section className="kz-gallery kz-section" id="experiencia" aria-labelledby="kz-experience-title">
            <Reveal className="kz-gallery__item">
              <Foto src={FOTOS.aplicacao} alt="Procedimento profissional de extensão de cílios" />
            </Reveal>
            <Reveal className="kz-gallery__item kz-gallery__item--offset" delay={0.1}>
              <Foto src={FOTOS.tecnica} alt="Detalhe do trabalho de uma profissional aplicando cílios" />
            </Reveal>
            <Reveal className="kz-gallery__copy" delay={0.08}>
              <p className="kz-kicker">02 — A experiência</p>
              <h2 id="kz-experience-title">Precisão em cada <em>fio.</em></h2>
              <p>Do primeiro atendimento à manutenção, cada etapa merece atenção. O resultado é pensado para acompanhar a sua rotina e o estilo que você gosta.</p>
              <a href="#procedimentos" className="kz-text-link">Descubra os procedimentos <ArrowRight size={17} aria-hidden="true" /></a>
              <div className="kz-gallery__small">
                <Foto src={FOTOS.cuidado} alt="Atendimento de extensão de cílios em ambiente profissional" />
              </div>
            </Reveal>
          </section>

          <section className="kz-services kz-section" id="procedimentos" aria-labelledby="kz-services-title">
            <Reveal className="kz-services__intro">
              <p className="kz-kicker">03 — Procedimentos</p>
              <h2 id="kz-services-title">Escolha seu próximo <em>olhar.</em></h2>
              <p>Veja as opções e os valores disponíveis no agendamento. Tudo o que aparecer aqui vem da agenda atual do estúdio.</p>
            </Reveal>
            <Reveal className="kz-services__list" delay={0.12}>
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
            </Reveal>
          </section>

          <section className="kz-statement kz-section" aria-labelledby="kz-statement-title">
            <div className="kz-statement__display" aria-hidden="true">beleza</div>
            <Reveal className="kz-statement__top">
              <p className="kz-kicker">Sua rotina, seu tempo</p>
              <h2 id="kz-statement-title">Um tempo reservado <em>para você.</em></h2>
            </Reveal>
            <Reveal className="kz-statement__visual" delay={0.12}>
              <Foto src={FOTOS.cuidado} alt="Momento de cuidado durante um procedimento de beleza" />
            </Reveal>
            <Reveal className="kz-statement__bottom" delay={0.06}>
              <p>Encontre um horário que encaixe na sua semana. Escolha o procedimento, consulte a disponibilidade e faça sua reserva online.</p>
              <BotaoAgendar>Reservar horário</BotaoAgendar>
            </Reveal>
          </section>

          <section className="kz-contact kz-section" id="contato" aria-labelledby="kz-contact-title">
            <Reveal>
              <p className="kz-kicker">04 — Onde estamos</p>
              <h2 id="kz-contact-title">Te espero em <em>Ipanema.</em></h2>
              <p>Conheça o espaço e venha cuidar do seu olhar.</p>
            </Reveal>
            <Reveal className="kz-contact__info" delay={0.1}>
              <div className="kz-contact__address"><MapPin size={20} aria-hidden="true" /><span>{STUDIO.address}<br />{STUDIO.city}</span></div>
              <BotaoAgendar>Agendar meu horário</BotaoAgendar>
              <div className="kz-contact__socials">
                <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Instagram</a>
                <a href={STUDIO.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a>
              </div>
            </Reveal>
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
          <small>© {new Date().getFullYear()} Kauane Zenie · Studio de Beleza · Fotografias ilustrativas</small>
        </footer>
      </div>
    </div>
  );
}
