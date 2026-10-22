import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Instagram, MapPin, Menu, MessageCircle, Navigation, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO } from "@/lib/brand";
import useEmblaCarousel from "embla-carousel-react";
import "./Landing.css";

// Catálogo conferido na página oficial: https://kauanezenie.keepo.bio/
// Procedimentos mostrados pela Kauane no WhatsApp e em seu catálogo público.
const CATALOGO = [
  { nome: "Volume Brasileiro", desc: "Extensão de cílios", foto: "/brand/real/keepo-1.jpg" },
  { nome: "Volume Egípcio", desc: "Extensão de cílios", foto: "/brand/real/catalogo/volume-egipcio.webp" },
  { nome: "Volume 4D", desc: "Extensão de cílios", foto: "/brand/real/catalogo/volume-4d.webp" },
  { nome: "Volume Infinity", desc: "Extensão de cílios", foto: "/brand/real/catalogo/volume-infinity.webp" },
  { nome: "Volume 5D", desc: "Extensão de cílios", foto: "/brand/real/catalogo/volume-5d.webp" },
  { nome: "Clássico", desc: "Extensão de cílios", foto: "/brand/real/catalogo/classico.webp" },
  { nome: "Brasileiro D", desc: "Extensão de cílios", foto: "/brand/real/catalogo/brasileiro-d.webp" },
  { nome: "Design Personalizado", desc: "Sobrancelhas", foto: "/brand/real/catalogo/design-personalizado.webp" },
  { nome: "Design com Henna", desc: "Sobrancelhas", foto: "/brand/real/catalogo/design-com-henna.webp" },
];

const HIGHLIGHTS = "https://www.instagram.com/stories/highlights/17942089640796543/";
const DIRECOES = "https://maps.app.goo.gl/QbwzzV5FzwSZW9Ym9";
const CURSO_WHATSAPP = "https://wa.me/55" + STUDIO.whatsapp + "?text=" +
encodeURIComponent("Olá, Kau! Tenho interesse no seu curso de extensão de cílios. Pode me passar mais informações?");
// Trechos literais de depoimentos compartilhados pela marca, sem identificação das clientes.
// Depoimentos reais compartilhados nos destaques da Kauane.
const FEEDBACKS = [
{ frase: "Muito obrigada pela sua atenção e pelo seu trabalho, uma ótima profissional.", tipo: "Atendimento", foto: "/brand/real/feedback-02.webp" },
{ frase: "Sucesso! Você é maravilhosa no que você faz. Eu amei o resultado do seu trabalho.", tipo: "Resultado", foto: "/brand/real/feedback-03.webp" },
{ frase: "Está de parabéns pelo trabalho, hoje tá completando 15 dias. Tá literalmente inteiro.", tipo: "Durabilidade", foto: "/brand/real/feedback-07.webp" },
{ frase: "Seu trabalho é incrível, você tem um ótimo atendimento.", tipo: "Cuidado com as clientes", foto: "/brand/real/feedback-06.webp" },
{ frase: "Seu trabalho é impecável, você arrasa!", tipo: "Cílios", foto: "/brand/real/feedback-04.webp" },
{ frase: "Só pra te elogiar, entrei umas 6x em piscina e fiquei mais de 4 horas cada uma das vezes.", tipo: "Durabilidade", foto: "/brand/real/feedback-01.webp" },
{ frase: "Chocada com a duração.", tipo: "Durabilidade", foto: "/brand/real/feedback-05.webp" }];

const nav = [
{ href: "#sobre", label: "Sobre" },
{ href: "#procedimentos", label: "Procedimentos" },
{ href: "#feedbacks", label: "Feedbacks" },
{ href: "#contato", label: "Contato" }];


function Foto({ src, alt, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  return falhou ?
  <div className={"kz-photo-fallback " + className} role="img" aria-label={alt}><span>kz.</span></div> :
  <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFalhou(true)} />;
}

function CursoCaixa() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "center 42%"]
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 75, damping: 22, mass: 0.65 });
  const lidAngle = useTransform(smooth, [0, 1], [-98, 0]);
  const lidY = useTransform(smooth, [0, 1], [-54, 0]);
  return (
    <div ref={ref} className="kz-course__stage" aria-label="Caixa do material do curso de extensão de cílios, que se fecha ao rolar a página">
      <div className="kz-course__box-scene">
        <div className="kz-course__box">
          <div className="kz-course__inside">
            <span className="kz-course__inside-mark">KAUANE ZENIE</span>
            <span className="kz-course__inside-title">Extensão<br />de cílios</span>
            <span className="kz-course__inside-subtitle">APOSTILA · CERTIFICADO</span>
          </div>
          <div className="kz-course__box-front">
            <span className="kz-course__box-ribbon" aria-hidden="true" />
          </div>
          <motion.div className="kz-course__lid" style={reduced ? {} : { rotateX: lidAngle, y: lidY }}>
            <div className="kz-course__lid-top">
              <span className="kz-course__lid-band" aria-hidden="true" />
              <img src="/brand/kauane-horizontal.png" alt="Kauane Zenie" loading="lazy" />
            </div>
            <span className="kz-course__lid-edge" aria-hidden="true" />
          </motion.div>
        </div>
        <span className="kz-course__ambient kz-course__ambient--one" aria-hidden="true" />
        <span className="kz-course__ambient kz-course__ambient--two" aria-hidden="true" />
      </div>
    </div>);

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
    </motion.div>);

}
function BotaoAgendar({ className = "", children = "Agendar horário" }) {
  return (
    <Link to="/agendar" className={`kz-pill kz-pill--solid ${className}`}>
      {children} <ArrowRight size={16} aria-hidden="true" />
    </Link>);

}

export default function Landing() {
  const reduzirMovimento = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScrollSuave = useSpring(heroScroll, { stiffness: 85, damping: 28, mass: 0.65 });
  const vidroFundoY = useTransform(heroScrollSuave, [0, 1], [0, -45]);
  const vidroLateralY = useTransform(heroScrollSuave, [0, 1], [0, 62]);
  const arcoY = useTransform(heroScrollSuave, [0, 1], [0, -24]);
  const retratoY = useTransform(heroScrollSuave, [0, 1], [0, 17]);

  useEffect(() => {
    document.documentElement.classList.add("kz-scroll-suave");
    return () => document.documentElement.classList.remove("kz-scroll-suave");
  }, []);
  const [fotosServicos, setFotosServicos] = useState({});
  const [menuAberto, setMenuAberto] = useState(false);
  const [carouselRef, carouselApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: true });
  const [carouselPausado, setCarouselPausado] = useState(false);
  const [catalogoRef, catalogoApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    duration: 33,
  });
  const [catalogoPausado, setCatalogoPausado] = useState(false);
  const [catalogoVisivel, setCatalogoVisivel] = useState(false);
  const catalogoDirecao = useRef(1);
  const catalogoPausaTimer = useRef(null);
  const catalogoSecaoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    import("@/api/base44Client").then(({ base44 }) =>
      base44.functions.invoke("getBookingConfig", {})
    ).then((res) => {
      if (!ativo) return;
      const map = {};
      for (const servico of res?.data?.servicos || []) {
        if (servico.foto_url) map[servico.nome] = servico.foto_url;
      }
      setFotosServicos(map);
    }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!carouselApi || carouselPausado || reduzirMovimento) return undefined;
    const interval = window.setInterval(() => carouselApi.scrollNext(), 5500);
    return () => window.clearInterval(interval);
  }, [carouselApi, carouselPausado, reduzirMovimento]);

  useEffect(() => {
    const node = catalogoSecaoRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setCatalogoVisivel(entry.isIntersecting),
      { threshold: 0.14 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!catalogoApi || !catalogoVisivel || catalogoPausado || reduzirMovimento) return undefined;
    const timer = window.setInterval(() => {
      if (!catalogoApi.canScrollNext()) catalogoDirecao.current = -1;
      if (!catalogoApi.canScrollPrev()) catalogoDirecao.current = 1;
      if (catalogoDirecao.current === 1) catalogoApi.scrollNext();
      else catalogoApi.scrollPrev();
    }, 3200);
    return () => window.clearInterval(timer);
  }, [catalogoApi, catalogoVisivel, catalogoPausado, reduzirMovimento]);

  useEffect(() => () => window.clearTimeout(catalogoPausaTimer.current), []);

  const pausarCatalogoTemporariamente = () => {
    window.clearTimeout(catalogoPausaTimer.current);
    setCatalogoPausado(true);
    catalogoPausaTimer.current = window.setTimeout(() => setCatalogoPausado(false), 10000);
  };
  const navegarCatalogo = (direcao) => {
    pausarCatalogoTemporariamente();
    if (direcao === "anterior") catalogoApi?.scrollPrev();
    else catalogoApi?.scrollNext();
  };

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="kz-site" id="topo">
      <a className="kz-public-skip" href="#conteudo-principal">Pular para o conteúdo principal</a>
      <div className="kz-shell">
        <section ref={heroRef} className="kz-hero" aria-labelledby="kz-hero-title"
        onPointerMove={(event) => {
          if (reduzirMovimento || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          event.currentTarget.style.setProperty("--kz-pointer-x", String(x));
          event.currentTarget.style.setProperty("--kz-pointer-y", String(y));
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--kz-pointer-x", "0");
          event.currentTarget.style.setProperty("--kz-pointer-y", "0");
        }}>
          <div className="kz-hero__art" aria-hidden="true">
            <motion.span className="kz-hero__halo kz-hero__halo--one" style={reduzirMovimento ? undefined : { y: arcoY }} />
            <motion.span className="kz-hero__halo kz-hero__halo--two" style={reduzirMovimento ? undefined : { y: vidroLateralY }} />
            <motion.span className="kz-hero__glass kz-hero__glass--rear" style={reduzirMovimento ? undefined : { y: vidroFundoY }} />
            <motion.span className="kz-hero__glass kz-hero__glass--left" style={reduzirMovimento ? undefined : { y: vidroLateralY }} />

          </div>
          <motion.div className="kz-hero__portrait" aria-hidden="true"
          style={reduzirMovimento ? undefined : { y: retratoY }}
          initial={reduzirMovimento ? false : { opacity: 0, x: 35, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <img src="/brand/real/kauane-hero-busto.webp" alt="" loading="eager" decoding="async" fetchPriority="high"
            onError={(event) => {event.currentTarget.onerror = null;event.currentTarget.src = "/brand/real/kauane-recorte.png";}} />
          </motion.div>

          <span className="kz-hero__front-shape" aria-hidden="true" />
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

          <AnimatePresence initial={false}>
            {menuAberto &&
            <motion.nav className="kz-mobile-menu" id="kz-mobile-menu" aria-label="Navegação mobile"
            initial={reduzirMovimento ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduzirMovimento ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
                {nav.map((item) => <a key={item.href} href={item.href} onClick={fecharMenu}>{item.label}</a>)}
                <Link to="/agendar" onClick={fecharMenu}>Agendar horário <ArrowRight size={17} /></Link>
              </motion.nav>
            }
          </AnimatePresence>

          <div className="kz-hero__eyebrow">KAUANE ZENIE <span>·</span> CÍLIOS & SOBRANCELHAS</div>
          <motion.div className="kz-hero__content"
          initial={reduzirMovimento ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.88, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}>
            <h1 id="kz-hero-title">Realçando a beleza <em>do seu olhar!</em></h1>
            
            <BotaoAgendar className="kz-hero__button">Agendar horário</BotaoAgendar>
          </motion.div>
          <span className="kz-hero__bottom-copy">Agende o seu horário e eleve a sua autoestima.</span>
          <a className="kz-hero__scroll" href="#sobre" aria-label="Conheça o estúdio"><ArrowDown size={18} /></a>
        </section>

        <main id="conteudo-principal">
          <section className="kz-brand-note kz-section" id="sobre">
            <Reveal className="kz-brand-note__inner">
              <span>KAUANE ZENIE · STUDIO DE BELEZA</span>
              <h2>Cuidar de você é <em>investimento.</em></h2>
              <p>Realçando a beleza do seu olhar!</p>
              <BotaoAgendar className="kz-brand-note__book">Agendar meu horário</BotaoAgendar>
            </Reveal>
          </section>
          <section className="kz-catalog kz-section" id="procedimentos" aria-labelledby="kz-catalog-title">
            <Reveal>
              <p className="kz-kicker">CÍLIOS & SOBRANCELHAS</p>
              <h2 id="kz-catalog-title">Catálogo</h2>
            </Reveal>
            <div className="kz-catalog__carousel" ref={catalogoSecaoRef}>
              <div className="kz-catalog__viewport" ref={catalogoRef}
                tabIndex={0} role="region" aria-roledescription="carrossel"
                aria-label="Catálogo de procedimentos. Use as setas esquerda e direita ou arraste para navegar."
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") { e.preventDefault(); navegarCatalogo("proximo"); }
                  if (e.key === "ArrowLeft") { e.preventDefault(); navegarCatalogo("anterior"); }
                }}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    window.clearTimeout(catalogoPausaTimer.current);
                    setCatalogoPausado(true);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    window.clearTimeout(catalogoPausaTimer.current);
                    setCatalogoPausado(false);
                  }
                }}
                onPointerDown={() => pausarCatalogoTemporariamente()}
                onFocusCapture={() => setCatalogoPausado(true)}
                onBlurCapture={() => pausarCatalogoTemporariamente()}>
                <div className="kz-catalog__track">
                  {CATALOGO.map((item) => (
                    <article className="kz-catalog__card" key={item.nome}>
                      <div className="kz-catalog__image">
                        {(fotosServicos[item.nome] || item.foto)
                          ? <Foto src={fotosServicos[item.nome] || item.foto} alt={item.nome + " — foto do catálogo da Kauane Zenie"} />
                          : <div className="kz-catalog__unillustrated" aria-label={"Procedimento " + item.nome}>
                              <span>KZ</span><span>{item.nome}</span>
                            </div>}
                      </div>
                      <div className="kz-catalog__details">
                        <h3>{item.nome}</h3>
                        <p>{item.desc}</p>
                        <Link to="/agendar">Ver horários <ArrowRight size={16} aria-hidden="true" /></Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="kz-catalog__controls">
                <span className="kz-catalog__hint">Deslize para explorar os procedimentos</span>
                <div className="kz-catalog__arrows">
                  <button type="button" aria-label="Procedimento anterior" onClick={() => navegarCatalogo("anterior")}><ChevronLeft size={20} /></button>
                  <button type="button" aria-label="Próximo procedimento" onClick={() => navegarCatalogo("proximo")}><ChevronRight size={20} /></button>
                </div>
              </div>
            </div>
          </section>
          <section className="kz-course kz-section" id="curso" aria-labelledby="kz-course-title">
            <Reveal className="kz-course__copy">
              <p className="kz-kicker">Kauane Zenie · Lash Designer</p>
              <h2 id="kz-course-title">Curso de <em>extensão de cílios.</em></h2>
              <p>A aluna recebe material completo, apostila exclusiva e certificado.</p>
              <a href={CURSO_WHATSAPP} target="_blank" rel="noopener noreferrer" className="kz-course__cta">
                Quero saber mais sobre o curso <MessageCircle size={18} aria-hidden="true" />
              </a>
            </Reveal>
            <CursoCaixa />
          </section>
          <section className="kz-testimonials kz-section" id="feedbacks" aria-labelledby="kz-testimonials-title">
            <Reveal className="kz-testimonials__header">
              <div>
                <p className="kz-kicker">MENSAGENS DAS CLIENTES</p>
                <h2 id="kz-testimonials-title">Feedbacks <em>reais.</em></h2>
              </div>
              <div className="kz-testimonials__arrows">
                <button type="button" aria-label="Avaliação anterior" onClick={() => carouselApi?.scrollPrev()}><ChevronLeft size={20} /></button>
                <button type="button" aria-label="Próxima avaliação" onClick={() => carouselApi?.scrollNext()}><ChevronRight size={20} /></button>
              </div>
            </Reveal>
            <div className="kz-testimonials__viewport" ref={carouselRef}
            tabIndex={0} role="region" aria-roledescription="carrossel"
            aria-label="Depoimentos. Use as setas direita e esquerda ou os botões para navegar."
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); carouselApi?.scrollNext(); }
              if (e.key === "ArrowLeft") { e.preventDefault(); carouselApi?.scrollPrev(); }
            }}
            onMouseEnter={() => setCarouselPausado(true)}
            onMouseLeave={() => setCarouselPausado(false)}
            onFocusCapture={() => setCarouselPausado(true)}
            onBlurCapture={() => setCarouselPausado(false)}>
              <div className="kz-testimonials__track">
                {FEEDBACKS.map((item, i) =>
                <a className="kz-testimonial" key={i} href={HIGHLIGHTS} target="_blank" rel="noopener noreferrer" aria-label={"Ver feedback real no Instagram: " + item.tipo}>
                    <div className="kz-testimonial__photo">
                      <img src={item.foto} alt={"Captura de conversa real — " + item.tipo} loading="lazy" />
                    </div>
                    <p>“{item.frase}”</p>
                    <div className="kz-testimonial__foot"><span>{item.tipo}</span><span>Ver destaque <ExternalLink size={13} /></span></div>
                  </a>
                )}
              </div>
            </div>
            <a className="kz-testimonials__source" href={HIGHLIGHTS} target="_blank" rel="noopener noreferrer">
              <Instagram size={18} /> São feedbacks reais. Confira o destaque no Instagram <ExternalLink size={14} />
            </a>
          </section>
          <section className="kz-contact kz-section" id="contato" aria-labelledby="kz-contact-title">
            <Reveal>
              <p className="kz-kicker">IPANEMA · PONTAL DO PARANÁ</p>
              <h2 id="kz-contact-title">Realçando a beleza <em>do seu olhar!</em></h2>
              <p>Agende o seu horário e eleve a sua autoestima.</p>
            </Reveal>
            <Reveal className="kz-contact__info" delay={0.1}>
              <div className="kz-contact__address"><MapPin size={20} aria-hidden="true" /><span>{STUDIO.address}<br />{STUDIO.city}</span></div>
              <a className="kz-directions-button" href={DIRECOES} target="_blank" rel="noopener noreferrer"><Navigation size={19} /> Como chegar <ArrowRight size={18} /></a>
              <div className="kz-contact__socials">
                <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> Instagram</a>
                <a href={STUDIO.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="kz-footer">
          <div className="kz-footer__brand"><BrandLogo variant="horizontal" className="w-full" /></div>
          <p>Cuidar de você é investimento.</p>
          <div className="kz-footer__location">
            <MapPin size={18} aria-hidden="true" />
            <div><span>{STUDIO.address}</span><span>{STUDIO.city}</span>
              <a href={DIRECOES} target="_blank" rel="noopener noreferrer">Ver rota no Google Maps <ArrowRight size={14} /></a>
            </div>
          </div>
          <nav aria-label="Links do rodapé">
            <a href="#topo">Voltar ao topo</a>
            <Link to="/agendar">Agendamento</Link>
            <Link to="/login">Área administrativa</Link>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/termos">Termos</Link>
            <Link to="/reembolso">Cancelamento e reembolso</Link>
            <Link to="/cookies">Cookies</Link>
            <button type="button" className="kz-footer__cookie-link" onClick={() => window.dispatchEvent(new Event("kz:aviso-cookies"))}>Aviso de cookies</button>
          </nav>
          <small className="kz-footer__bottom">
            <span className="kz-footer__rights">Fotografias e depoimentos: uso sujeito às autorizações de seus titulares. Para solicitar a remoção de uma imagem, fale com o estúdio.</span>
            <span>© {new Date().getFullYear()} Kauane Zenie · Studio de Beleza</span>
            <a href="https://gabardolabs.com" target="_blank" rel="noopener noreferrer">Desenvolvido por GabardoLabs.com <ExternalLink size={12} /></a>
          </small>
        </footer>
      </div>
    </div>);

}
