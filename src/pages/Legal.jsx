import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Scale, ShieldCheck, FileText, Cookie, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO } from "@/lib/brand";
import "./Legal.css";

const ATUALIZACAO = "Outubro de 2026";
const CONTATO = "https://wa.me/55" + STUDIO.whatsapp + "?text=" + encodeURIComponent("Olá, Kauane! Quero tratar sobre meus dados pessoais ou sobre os termos de atendimento.");
const LINKS = [
  { id:"privacidade", nome:"Privacidade e LGPD", icon:ShieldCheck },
  { id:"termos", nome:"Termos de serviço", icon:FileText },
  { id:"reembolso", nome:"Cancelamentos e reembolsos", icon:Scale },
  { id:"cookies", nome:"Cookies e tecnologias", icon:Cookie }
];

function Bloco({ titulo, children }) {
  return <section className="kz-legal__section"><h2>{titulo}</h2><div className="kz-legal__copy">{children}</div></section>;
}

function Privacidade() {
  return <>
    <Bloco titulo="1. Quem é responsável pelo tratamento">
      <p>O tratamento de dados do site e do sistema de agendamento é realizado por <strong>Kauane Zenie · Studio de Beleza</strong>, localizada em {STUDIO.address}, {STUDIO.city}. Para dúvidas, solicitações sobre seus dados ou reclamações, fale pelo <a href={CONTATO} target="_blank" rel="noopener noreferrer">WhatsApp do estúdio</a>.</p>
      <p>A identificação cadastral/fiscal da responsável deve ser confirmada antes da publicação definitiva dos documentos. Nenhum CPF ou CNPJ foi presumido neste aviso.</p>
    </Bloco>
    <Bloco titulo="2. Quais dados são utilizados">
      <p>Para solicitar ou administrar um atendimento, são coletados nome, telefone/WhatsApp, procedimento, data e horário escolhidos. Quando necessários, o histórico de atendimento e os valores também são registrados no sistema privado.</p>
      <p>A data de nascimento é opcional e só deve ser utilizada para ações de aniversário mediante escolha separada da cliente. Mensagens e comprovantes eventualmente enviados pelo WhatsApp seguem as condições da plataforma de mensagens e da instituição de pagamento.</p>
    </Bloco>
    <Bloco titulo="3. Finalidades e fundamentos">
      <p>Os dados necessários à reserva são tratados para executar procedimentos anteriores à contratação e prestar o serviço solicitado, organizar a agenda, confirmar horários, prestar atendimento, prevenir duplicidades e atender obrigações legais. Ações opcionais de aniversário dependem de autorização específica e revogável.</p>
      <p>Não condicionamos a realização do atendimento ao recebimento de marketing, ao fornecimento da data de nascimento ou à aceitação de publicidade comportamental.</p>
    </Bloco>
    <Bloco titulo="4. Compartilhamento, armazenamento e retenção">
      <p>O funcionamento do agendamento depende da plataforma de hospedagem e banco de dados (Base44). Contato por WhatsApp, mapas, links de redes sociais e pagamentos usam serviços de terceiros apenas quando acionados. As políticas desses serviços também se aplicam ao uso feito neles.</p>
      <p>Os registros são mantidos pelo período necessário para agendamentos, suporte, obrigações legais e defesa de direitos, observadas as regras aplicáveis. Não existe promessa de exclusão imediata de dados que precisem ser conservados legalmente.</p>
    </Bloco>
    <Bloco titulo="5. Seus direitos">
      <p>Você pode solicitar confirmação de tratamento, acesso, correção, informação sobre compartilhamento, portabilidade quando aplicável, anonimização, bloqueio ou eliminação nos casos previstos em lei e revogação de consentimentos opcionais. Faça o pedido no canal de contato acima. Poderemos solicitar informações estritamente necessárias para confirmar sua identidade antes de entregar dados.</p>
    </Bloco>
    <Bloco titulo="6. Segurança e atualizações">
      <p>O painel administrativo utiliza autenticação e controles de acesso, com comunicações protegidas pelo serviço de hospedagem quando disponíveis. Nenhum sistema elimina completamente todos os riscos. Este aviso pode ser atualizado quando houver mudança real de finalidades, ferramentas ou parceiros.</p>
    </Bloco>
  </>;
}
function Termos() {
  return <>
    <Bloco titulo="1. Serviços anunciados">
      <p>O site apresenta serviços de extensão de cílios e design de sobrancelhas da Kauane Zenie. Imagens são referências de trabalhos e não constituem garantia de resultado idêntico, pois o resultado depende das características de cada pessoa e da avaliação profissional.</p>
      <p>O conteúdo sobre cursos é informativo: valores, carga horária, materiais, vagas e condições de contratação devem ser confirmados diretamente com o estúdio antes de qualquer pagamento.</p>
    </Bloco>
    <Bloco titulo="2. Solicitação e confirmação do horário">
      <p>A cliente seleciona o procedimento e informa nome e WhatsApp para solicitar uma vaga. O sistema apresenta a disponibilidade naquele momento, mas a reserva está sujeita à confirmação e a possíveis conflitos de agenda. Quando houver taxa de reserva, o valor deve ser exibido de forma clara antes do pagamento.</p>
      <p>Procedimentos com preço ainda não publicado devem ter seus valores confirmados diretamente com o estúdio antes da contratação. Não se deve presumir gratuidade em razão de preço não informado.</p>
    </Bloco>
    <Bloco titulo="3. Atendimento, pontualidade e reagendamento">
      <p>Compareça na data combinada e informe ao estúdio com antecedência quando não puder comparecer. Situações de atraso, remarcação, cuidados e eventual impedimento ao procedimento devem ser avaliadas individualmente e comunicadas antes da execução.</p>
      <p>As regras de cancelamento e eventual restituição estão na <Link to="/reembolso">Política de cancelamento e reembolso</Link>, sem prejuízo dos direitos previstos na legislação de defesa do consumidor.</p>
    </Bloco>
    <Bloco titulo="4. Uso do site e comunicação">
      <p>Não utilize formulários para dados de terceiros sem autorização, informações incorretas ou mensagens abusivas. O uso do site não autoriza copiar suas marcas, fotografias e textos sem as permissões dos titulares de direitos.</p>
      <p>Para informações sobre dados pessoais consulte a <Link to="/privacidade">Política de Privacidade</Link>. Dúvidas sobre a contratação podem ser encaminhadas pelo WhatsApp do estúdio.</p>
    </Bloco>
  </>;
}
function Reembolso() {
  return <>
    <Bloco titulo="1. Cancelamento e reagendamento">
      <p>Se precisar cancelar ou reagendar, entre em contato pelo WhatsApp do estúdio informando nome e data do agendamento. A equipe analisará a situação e apresentará as alternativas disponíveis. Uma vaga de lista de espera não é uma reserva confirmada e não gera cobrança por inscrição.</p>
    </Bloco>
    <Bloco titulo="2. Taxa de reserva e eventual devolução">
      <p>Quando houver taxa de reserva, seu valor, finalidade e prazo de pagamento devem ser apresentados antes da contratação. Pedidos de devolução serão analisados conforme as condições efetivamente informadas e aceitas, os fatos do caso e a legislação aplicável.</p>
      <p><strong>A taxa não é declarada irreembolsável em qualquer hipótese.</strong> Condições comerciais não podem afastar direitos obrigatórios do consumidor, inclusive situações de falha na prestação ou cancelamento imputável ao fornecedor.</p>
    </Bloco>
    <Bloco titulo="3. Direito de arrependimento em contratações à distância">
      <p>O artigo 49 do Código de Defesa do Consumidor prevê, quando aplicável à contratação fora do estabelecimento comercial, o prazo de 7 dias para o exercício do direito de arrependimento, com restituição dos valores nos termos da lei. O enquadramento e as consequências em serviços já executados exigem análise das circunstâncias concretas.</p>
    </Bloco>
    <Bloco titulo="4. Como pedir a análise">
      <p>Envie a solicitação ao WhatsApp do estúdio, com identificação do agendamento, data e comprovante quando houver. A responsável esclarecerá por esse canal os próximos passos e o meio adequado de restituição, se cabível.</p>
    </Bloco>
  </>;
}
function Cookies() {
  return <>
    <Bloco titulo="1. Informações armazenadas no navegador">
      <p>Este site mantém preferências de visualização, o registro de leitura deste aviso e, na área privada, informações técnicas para autenticação e sessão. Parte disso pode utilizar armazenamento local do navegador, que é diferente de cookies tradicionais.</p>
      <p>Até a presente versão do código, não foram incluídos pelo estúdio pixels próprios de publicidade ou scripts opcionais de análise comportamental. A infraestrutura Base44 e serviços externos acessados por links podem empregar cookies técnicos sob suas próprias regras.</p>
    </Bloco>
    <Bloco titulo="2. Finalidades e escolhas">
      <p>Identificadores necessários ao funcionamento e segurança do serviço não são usados como permissão genérica de publicidade. Se no futuro forem incluídas tecnologias não essenciais que exijam consentimento, o site deverá solicitar uma escolha livre e específica antes de ativá-las.</p>
      <p>Você pode limpar as informações armazenadas pelo site nas configurações do navegador. Na parte inferior do site é possível reabrir este aviso.</p>
    </Bloco>
    <Bloco titulo="3. Sites externos">
      <p>Ao abrir Instagram, Google Maps ou WhatsApp, você sai deste domínio e passa a interagir com políticas e cookies próprios da plataforma escolhida.</p>
    </Bloco>
  </>;
}
const CONTENT = { privacidade:Privacidade, termos:Termos, reembolso:Reembolso, cookies:Cookies };

export default function Legal() {
  const tipo = useLocation().pathname.slice(1) || "privacidade";
  const current = LINKS.find(l => l.id === tipo) || LINKS[0];
  const Conteudo = CONTENT[current.id];
  return <div className="kz-legal">
    <a className="kz-skip" href="#conteudo-legal">Pular para o conteúdo</a>
    <header className="kz-legal__header">
      <Link to="/" aria-label="Voltar ao site"><BrandLogo variant="horizontal" className="w-40" /></Link>
      <Link to="/" className="kz-legal__back"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao site</Link>
    </header>
    <main className="kz-legal__main" id="conteudo-legal">
      <p className="kz-legal__eyebrow">Kauane Zenie · Informações importantes</p>
      <h1>{current.nome}</h1>
      <p className="kz-legal__date">Última atualização: {ATUALIZACAO}</p>
      <nav className="kz-legal__nav" aria-label="Documentos e políticas">
        {LINKS.map(l => <Link key={l.id} to={"/" + l.id} aria-current={l.id === current.id ? "page" : undefined}>{l.nome}</Link>)}
      </nav>
      <Conteudo />
      <aside className="kz-legal__contact">
        <MessageCircle size={22} aria-hidden="true" />
        <div><strong>Precisa falar com o estúdio?</strong><p>Solicite esclarecimentos ou exerça seus direitos de privacidade.</p></div>
        <a href={CONTATO} target="_blank" rel="noopener noreferrer">Abrir WhatsApp <ArrowUpRight size={15} aria-hidden="true" /></a>
      </aside>
    </main>
    <footer className="kz-legal__footer">
      <span>© {new Date().getFullYear()} {STUDIO.name} · {STUDIO.subtitle}</span>
      <Link to="/">Página inicial</Link>
    </footer>
  </div>;
}
