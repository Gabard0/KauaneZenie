import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Instagram, MapPin, Menu, MessageCircle, Navigation, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO } from "@/lib/brand";
import useEmblaCarousel from "embla-carousel-react";
import "./Landing.css";

// Catálogo conferido na página oficial: https://kauanezenie.keepo.bio/
const CATALOGO = [
  { nome: "Volume Brasileiro", desc: "Mais escolhido. Proporciona mais curvatura e volume ao olhar.", foto: "/brand/real/keepo-1.jpg" },
  { nome: "Volume Egípcio", desc: "Deixa o olhar preenchido, delicado e apaixonante.", foto: "/brand/real/keepo-2.jpg" },
  { nome: "Volume 4D", desc: "Para aquelas que gostam de bastante volume e de destacar o olhar.", foto: "/brand/real/keepo-3.jpg" },
  { nome: "Design e Henna", desc: "Sobrancelhas", foto: "/brand/real/keepo-4.jpg" },
  { nome: "Design Personalizado", desc: "Sobrancelhas", foto: "/brand/real/keepo-5.jpg" },
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
  { frase: "Chocada com a duração.", tipo: "Durabilidade", foto: "/brand/real/feedback-05.webp" },
];
const nav = [
{ href: "#sobre", label: "Sobre" },
{ href: "#procedimentos", label: "Procedimentos" },
{ href: "#feedbacks", label: "Feedbacks" },
{ href: "#contato", label: "Contato" }];


function Foto({ src, alt, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  return falhou
    ? <div className={"kz-photo-fallback " + className} role="img" aria-label={alt}><span>kz.</span></div>
    : <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFalhou(true)} />;
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
      <p className="kz-course__scroll-hint">Role a página para fechar a caixa</p>
    </div>
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
  const [menuAberto, setMenuAberto] = useState(false);
  const [carouselRef, carouselApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: true });
  const [carouselPausado, setCarouselPausado] = useState(false);

  useEffect(() => {
    if (!carouselApi || carouselPausado || reduzirMovimento) return undefined;
    const interval = window.setInterval(() => carouselApi.scrollNext(), 5500);
    return () => window.clearInterval(interval);
  }, [carouselApi, carouselPausado, reduzirMovimento]);

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="kz-site" id="topo">
      <div className="kz-shell">
        <section className="kz-hero" aria-labelledby="kz-hero-title"
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
            <span className="kz-hero__halo kz-hero__halo--one" />
            <span className="kz-hero__halo kz-hero__halo--two" />
            <span className="kz-hero__glass kz-hero__glass--rear" />
            <span className="kz-hero__glass kz-hero__glass--left" />

          </div>
          <motion.div className="kz-hero__portrait" aria-hidden="true"
          initial={reduzirMovimento ? false : { opacity: 0, x: 35, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <img src="/brand/real/kauane-retrato-atualizado.webp" alt="" loading="eager" decoding="async" fetchPriority="high"
              onError={(event) => {event.currentTarget.onerror = null; event.currentTarget.src = "/brand/real/kauane-recorte.png";}} />
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

        <main>
          <section className="kz-brand-note kz-section" id="sobre">
            <Reveal className="kz-brand-note__inner">
              <span>KAUANE ZENIE · STUDIO DE BELEZA</span>
              <h2>Cuidar de você é <em>investimento.</em></h2>
              <p>Realçando a beleza do seu olhar!</p>
            </Reveal>
          </section>
          <section className="kz-catalog kz-section" id="procedimentos" aria-labelledby="kz-catalog-title">
            <Reveal>
              <p className="kz-kicker">CÍLIOS & SOBRANCELHAS</p>
              <h2 id="kz-catalog-title">Catálogo</h2>
            </Reveal>
            <div className="kz-catalog__grid">
              {CATALOGO.map((item, i) =>
              <Reveal className="kz-catalog__card" delay={i * .08} key={item.nome}>
                  <div className="kz-catalog__image"><Foto src={item.foto} alt={item.nome + " — foto do catálogo da Kauane Zenie"} /></div>
                  <div className="kz-catalog__details">
                    <h3>{item.nome}</h3>
                    <p>{item.desc}</p>
                    <Link to="/agendar">Ver horários <ArrowRight size={16} /></Link>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
          <section className="kz-course kz-section" id="curso" aria-labelledby="kz-course-title">
            <Reveal className="kz-course__copy">
              <p className="kz-kicker">Kauane Zenie · Lash Designer</p>
              <h2 id="kz-course-title">Curso de <em>extensão de cílios.</em></h2>
              <p>Aprenda com material completo, apostila exclusiva e certificado.</p>
              <a href={CURSO_WHATSAPP} target="_blank" rel="noopener noreferrer" className="kz-course__cta">
                Quero saber mais sobre o curso <MessageCircle size={18} aria-hidden="true" />
              </a>
            </Reveal>
            <CursoCaixa />
            <div className="kz-course__material">
              <figure>
                <img src="/brand/real/curso-material-01.webp" alt="Material de curso da Kauane: caixa com laço, apostila e certificado" loading="lazy" />
                <figcaption>Material completo</figcaption>
              </figure>
              <figure>
                <img src="/brand/real/curso-material-02.webp" alt="Embalagem e apostila do curso da Kauane Zenie" loading="lazy" />
                <figcaption>Apostila exclusiva</figcaption>
              </figure>
            </div>
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
                    <div className="kz-testimonial__foot"><span>{item.tipo}</span><span>Ver destaque <ExternalLink size={13}/></span></div>
                  </a>
                )}
              </div>
            </div>
            <a className="kz-testimonials__source" href={HIGHLIGHTS} target="_blank" rel="noopener noreferrer">
              <Instagram size={18}/> São feedbacks reais. Confira o destaque no Instagram <ExternalLink size={14}/>
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
              <a className="kz-directions-button" href={DIRECOES} target="_blank" rel="noopener noreferrer"><Navigation size={19}/> Como chegar <ArrowRight size={18}/></a>
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
              <a href={DIRECOES} target="_blank" rel="noopener noreferrer">Ver rota no Google Maps <ArrowRight size={14}/></a>
            </div>
          </div>
          <nav aria-label="Links do rodapé">
            <a href="#topo">Voltar ao topo</a>
            <Link to="/agendar">Agendamento</Link>
            <Link to="/login">Área administrativa</Link>
          </nav>
          <small className="kz-footer__bottom"><span>© {new Date().getFullYear()} Kauane Zenie · Studio de Beleza</span>
            <a href="https://gabardolabs.com" target="_blank" rel="noopener noreferrer">Desenvolvido por GabardoLabs.com <ExternalLink size={12}/></a>
          </small>
        </footer>
      </div>
    </div>);

}