import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Instagram, MapPin, Menu, MessageCircle, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO } from "@/lib/brand";
import { base44 } from "@/api/base44Client";
import { formatBRL } from "@/lib/helpers";
import useEmblaCarousel from "embla-carousel-react";
import "./Landing.css";

// Fotografias retiradas do catálogo público oficial da Kauane (Keepo).
const FOTOS = {
  hero: "/brand/real/keepo-3.jpg",
  detalhe: "/brand/real/keepo-4.jpg",
  aplicacao: "/brand/real/keepo-3.jpg",
  tecnica: "/brand/real/keepo-5.jpg",
  cuidado: "/brand/real/keepo-4.jpg",
};
const CATALOGO = [
  { nome: "Volume 4D", desc: "Para aquelas que gostam de bastante volume e de destacar o olhar.", foto: "/brand/real/keepo-3.jpg" },
  { nome: "Design e Henna", desc: "Sobrancelhas", foto: "/brand/real/keepo-4.jpg" },
  { nome: "Design Personalizado", desc: "Sobrancelhas", foto: "/brand/real/keepo-5.jpg" },
];
// Trechos literais de depoimentos compartilhados pela marca, sem identificação das clientes.
const FEEDBACKS = [
  { frase: "Muito obrigada pela sua atenção e pelo seu trabalho, uma ótima profissional.", tipo: "Atendimento" },
  { frase: "Eu amei o resultado do seu trabalho.", tipo: "Resultado" },
  { frase: "Seu trabalho é impecável, você arrasa!", tipo: "Cílios" },
  { frase: "Tá literalmente inteiro.", tipo: "Durabilidade" },
  { frase: "Amei meus cílios, ficou perfeito.", tipo: "Resultado" },
  { frase: "Você é maravilhosa no que você faz.", tipo: "Carinho das clientes" },
];
const nav = [
  { href: "#conceito", label: "Sobre" },
  { href: "#procedimentos", label: "Procedimentos" },
  { href: "#feedbacks", label: "Feedbacks" },
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
  const [carouselRef, carouselApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: true });
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

          <AnimatePresence initial={false}>
            {menuAberto && (
              <motion.nav className="kz-mobile-menu" id="kz-mobile-menu" aria-label="Navegação mobile"
                initial={reduzirMovimento ? false : { opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduzirMovimento ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
                {nav.map((item) => <a key={item.href} href={item.href} onClick={fecharMenu}>{item.label}</a>)}
                <Link to="/agendar" onClick={fecharMenu}>Agendar horário <ArrowRight size={17} /></Link>
              </motion.nav>
            )}
          </AnimatePresence>

          <div className="kz-hero__eyebrow">KAUANE ZENIE <span>·</span> CÍLIOS & SOBRANCELHAS</div>
          <motion.div className="kz-hero__content"
            initial={reduzirMovimento ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.88, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}>
            <h1 id="kz-hero-title">Seu olhar, <em>sua essência.</em></h1>
            <p>Cílios & sobrancelhas · Ipanema, Pontal do Paraná.</p>
            <BotaoAgendar className="kz-hero__button">Agendar horário</BotaoAgendar>
          </motion.div>
          <motion.span className="kz-hero__display" aria-hidden="true"
            initial={reduzirMovimento ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}>Kauane</motion.span>
          <a className="kz-hero__scroll" href="#conceito" aria-label="Conheça o estúdio"><ArrowDown size={18} /></a>
        </section>

        <main>
          <section className="kz-catalog kz-section" id="procedimentos" aria-labelledby="kz-catalog-title">
            <Reveal>
              <p className="kz-kicker">CÍLIOS & SOBRANCELHAS</p>
              <h2 id="kz-catalog-title">Catálogo</h2>
            </Reveal>
            <div className="kz-catalog__grid">
              {CATALOGO.map((item, i) => (
                <Reveal className="kz-catalog__card" delay={i * .08} key={item.nome}>
                  <div className="kz-catalog__image"><Foto src={item.foto} alt={item.nome + " — foto do catálogo da Kauane Zenie"} /></div>
                  <div className="kz-catalog__details">
                    <h3>{item.nome}</h3>
                    <p>{item.desc}</p>
                    <Link to="/agendar">Agendar <ArrowRight size={16}/></Link>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="kz-catalog__book"><BotaoAgendar>Ver horários e valores</BotaoAgendar></div>
          </section>
          <section className="kz-services kz-section" aria-labelledby="kz-services-title">
            <Reveal className="kz-services__intro">
              <p className="kz-kicker">AGENDE SEU HORÁRIO</p>
              <h2 id="kz-services-title">Procedimentos disponíveis</h2>
              <p>Escolha o procedimento e confira os horários disponíveis.</p>
            </Reveal>
            <Reveal className="kz-services__list">
              {servicosCarregando ? (
                <p className="kz-services__feedback" role="status">Carregando procedimentos…</p>
              ) : servicos.length ? servicos.slice(0,6).map((servico,i) => (
                <Link to="/agendar" className="kz-service" key={servico.id}>
                  <span className="kz-service__number">{String(i+1).padStart(2,"0")}</span>
                  <span className="kz-service__name">{servico.nome}</span>
                  <span className="kz-service__meta">{servico.preco > 0 ? formatBRL(servico.preco) : "Consultar"}</span>
                  <ArrowRight size={19}/>
                </Link>
              )) : <p className="kz-services__feedback">Confira os procedimentos e valores na agenda.</p>}
              <BotaoAgendar className="kz-services__action">Agendar horário</BotaoAgendar>
            </Reveal>
          </section>
          <section className="kz-testimonials kz-section" id="feedbacks" aria-labelledby="kz-testimonials-title">
            <Reveal className="kz-testimonials__header">
              <div>
                <p className="kz-kicker">MENSAGENS DAS CLIENTES</p>
                <h2 id="kz-testimonials-title">Feedbacks <em>reais.</em></h2>
              </div>
              <div className="kz-testimonials__arrows">
                <button type="button" aria-label="Avaliação anterior" onClick={() => carouselApi?.scrollPrev()}><ChevronLeft size={20}/></button>
                <button type="button" aria-label="Próxima avaliação" onClick={() => carouselApi?.scrollNext()}><ChevronRight size={20}/></button>
              </div>
            </Reveal>
            <div className="kz-testimonials__viewport" ref={carouselRef}>
              <div className="kz-testimonials__track">
                {FEEDBACKS.map((item,i) => (
                  <article className="kz-testimonial" key={i}>
                    <span className="kz-testimonial__quote" aria-hidden="true">“</span>
                    <p>“{item.frase}”</p>
                    <div className="kz-testimonial__foot"><span>{item.tipo}</span><span>Depoimento recebido</span></div>
                  </article>
                ))}
              </div>
            </div>
            <p className="kz-testimonials__note">Trechos de mensagens enviadas pelas clientes, sem identificação pessoal.</p>
          </section>
          <section className="kz-contact kz-section" id="contato" aria-labelledby="kz-contact-title">
            <Reveal>
              <p className="kz-kicker">IPANEMA · PONTAL DO PARANÁ</p>
              <h2 id="kz-contact-title">Seu olhar, <em>sua essência.</em></h2>
              <p>Agende seu horário no Studio de Beleza Kauane Zenie.</p>
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
          <small>© {new Date().getFullYear()} Kauane Zenie · Studio de Beleza · Fotografias do catálogo da Kauane</small>
        </footer>
      </div>
    </div>
  );
}
