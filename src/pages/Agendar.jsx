import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";
import { STUDIO, studioPhone, studioMessage } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { POLITICA_RESERVA, todayISO, formatData, formatBRL, dataLonga, waLink } from "@/lib/helpers";
import { digits, maskTelefone, horariosDoDia, hojeLocalMin } from "@/lib/booking";
import { montarMensagem } from "@/lib/mensagem";
import { aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";
import CalendarioGlass from "@/components/agendar/CalendarioGlass";
import HorariosGlass from "@/components/agendar/HorariosGlass";
import ServicosLista from "@/components/agendar/ServicosLista";
import DadosCliente from "@/components/agendar/DadosCliente";
import TelaPagamento from "@/components/agendar/TelaPagamento";
import TelaConfirmacao from "@/components/agendar/TelaConfirmacao";
import { MessageCircle, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const secaoCls = "rounded-3xl bg-card border border-border/60 p-5 space-y-4";
const passoTitulo = "flex items-center gap-2.5 font-heading text-lg";
const passoNum =
  "w-7 h-7 rounded-full bg-gold/15 text-gold text-sm font-semibold flex items-center justify-center shrink-0";

export default function Agendar() {
  const [config, setConfig] = useState(null);
  const [falha, setFalha] = useState(false);
  const [enviandoEspera, setEnviandoEspera] = useState(false);
  const [esperaConfirmada, setEsperaConfirmada] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState(null);
  const [waUrl, setWaUrl] = useState("");
  const [etapa, setEtapa] = useState("form");
  const [dados, setDados] = useState({ data: "", horario: "", servicos: [], nome: "", whatsapp: "", nascimento: "", aceitaAniversario: false });

  useEffect(() => {
    aplicarTema(temaSalvo(), modoSalvo());
  }, []);

  const carregar = async () => {
    const r = await base44.functions.invoke("getBookingConfig", {});
    const data = {
      ...r.data,
      whatsapp_profissional: studioPhone(r.data.whatsapp_profissional),
      mensagem_whatsapp: studioMessage(r.data.mensagem_whatsapp),
    };
    setConfig(data);
    return data;
  };
  useEffect(() => {
    carregar().catch(() => setFalha(true));
  }, []);

  const servicosSel = useMemo(
    () => (config?.servicos || []).filter((s) => dados.servicos.includes(s.id)),
    [config, dados.servicos]
  );
  const duracaoTotal = useMemo(() => servicosSel.reduce((t, s) => t + s.duracao, 0), [servicosSel]);
  const valorTotal = useMemo(() => servicosSel.reduce((t, s) => t + s.preco, 0), [servicosSel]);
  const duracaoBase = duracaoTotal;
  const temManutencao = useMemo(() => servicosSel.some((s) => s.gera_manutencao), [servicosSel]);
  const politica = config?.politica_reserva || POLITICA_RESERVA;
  const exigirTaxa = config?.pagamento?.exigir_taxa === true;

  const horarios = useMemo(() => {
    if (!config || !dados.data) return [];
    return horariosDoDia({
      funcionamento: config.funcionamento,
      periodosEspeciais: config.periodosEspeciais,
      excecoes: config.excecoes,
      ocupados: config.ocupados,
      dataISO: dados.data,
      duracao: duracaoBase,
      agoraMin: dados.data === todayISO() ? hojeLocalMin() : 0,
    });
  }, [config, dados.data, duracaoBase]);

  const nenhumLivre = !!dados.data && !horarios.some(h => h.livre);
  const entrarNaEspera = async () => {
    setErro(""); setEnviandoEspera(true);
    try {
      const r = await base44.functions.invoke("listaEspera", {
        acao: "inscrever", nome: dados.nome.trim(), whatsapp: digits(dados.whatsapp),
        data: dados.data, servico_ids: dados.servicos, aceite_termos: aceitouTermos
      });
      if (r.data?.ok) setEsperaConfirmada(true);
      else setErro(r.data?.error === "horarios_disponiveis"
        ? "Um horário ficou disponível. Atualize a agenda para escolher seu horário."
        : "Não foi possível entrar na lista de espera. Confira os dados.");
    } catch { setErro("Não foi possível enviar agora. Tente novamente."); }
    finally { setEnviandoEspera(false); }
  };
  const mudar = (campo, valor) => setDados((d) => campo === "aceitaAniversario" && !valor
    ? { ...d, aceitaAniversario: false, nascimento: "" }
    : { ...d, [campo]: valor });

  const escolherDia = (iso) => {
    setAviso("");
    setErro("");
    setEsperaConfirmada(false);
    setDados((d) => ({ ...d, data: iso, horario: "" }));
  };

  const toggleServico = (id) => {
    setAviso("");
    const servicos = dados.servicos.includes(id)
      ? dados.servicos.filter((s) => s !== id)
      : [...dados.servicos, id];
    if (servicos.length === 0) {
      setDados((d) => ({ ...d, servicos, horario: "" }));
      return;
    }
    if (dados.horario && config) {
      const novaDur =
        (config.servicos || []).filter((s) => servicos.includes(s.id)).reduce((t, s) => t + s.duracao, 0);
      const hs = horariosDoDia({
        funcionamento: config.funcionamento,
        periodosEspeciais: config.periodosEspeciais,
        excecoes: config.excecoes,
        ocupados: config.ocupados,
        dataISO: dados.data,
        duracao: novaDur,
        agoraMin: dados.data === todayISO() ? hojeLocalMin() : 0,
      });
      if (!hs.find((h) => h.hora === dados.horario && h.livre)) {
        setAviso("Os procedimentos escolhidos precisam de mais tempo nesse horário — escolha outro horário.");
        setDados((d) => ({ ...d, servicos, horario: "" }));
        return;
      }
    }
    setDados((d) => ({ ...d, servicos }));
  };

  const pronto =
    !!dados.data &&
    !!dados.horario &&
    dados.servicos.length > 0 &&
    dados.nome.trim().length >= 2 &&
    digits(dados.whatsapp).length >= 10 &&
    aceitouTermos;

  const irParaPagamento = async () => {
    setConfirmando(true);
    setErro("");
    try {
      const r = await base44.functions.invoke("createOnlineBooking", {
        nome: dados.nome.trim(),
        whatsapp: digits(dados.whatsapp),
        servico_ids: dados.servicos,
        data_nascimento: dados.aceitaAniversario ? dados.nascimento : "",
        aceita_aniversario: dados.aceitaAniversario === true,
        aceite_termos: aceitouTermos,
        data: dados.data,
        horario: dados.horario,
      });
      const d = r.data;
      if (d?.ok) {
        const ag = d.agendamento;
        const manut = d.manutencao;
        const pag = d.pagamento;
        setResultado({ agendamento: ag, manutencao: manut, pagamento: pag });
        if (pag?.exigir_taxa) {
          // Vai para a tela de pagamento (taxa via Pix)
          setEtapa("pagamento");
        } else {
          // Sem taxa: comportamento antigo — abre WhatsApp e finaliza
          const msg = montarMensagem(config.mensagem_whatsapp, {
            nome: ag.cliente_nome,
            procedimentos: ag.servico_nome,
            data: formatData(ag.data),
            horario: ag.horario,
            valor: Number(ag.valor_total) > 0 ? formatBRL(ag.valor_total) : "A definir com a Kauane",
            whatsapp: maskTelefone(digits(dados.whatsapp)),
            taxa: formatBRL(pag?.taxa || 0),
          });
          const url = waLink(config.whatsapp_profissional, msg);
          setWaUrl(url);
          window.open(url, "_blank");
          setEtapa("final");
        }
      } else if (d?.error === "pix_nao_configurado") {
        setErro("O Pix do estúdio ainda não está disponível. Fale com a profissional antes de reservar.");
      } else if (d?.error === "horario_ocupado") {
        setErro("Ops! Esse horário acabou de ser ocupado. Escolha outro.");
        await carregar();
        setDados((dd) => ({ ...dd, horario: "" }));
      } else {
        setErro("Não foi possível confirmar. Verifique os dados e tente novamente.");
      }
    } catch (e) {
      const d = e?.response?.data || e?.data;
      if (d?.error === "horario_ocupado") {
        setErro("Ops! Esse horário acabou de ser ocupado. Escolha outro.");
        await carregar();
        setDados((dd) => ({ ...dd, horario: "" }));
      } else {
        setErro("Erro de conexão. Tente novamente.");
      }
    } finally {
      setConfirmando(false);
    }
  };

  const enviarComprovante = async () => {
    const ag = resultado?.agendamento;
    const pag = resultado?.pagamento || {};
    if (!ag) return;
    setEnviando(true);
    try {
      const msg = montarMensagem(config.mensagem_whatsapp, {
        nome: ag.cliente_nome,
        whatsapp: maskTelefone(digits(dados.whatsapp)),
        procedimentos: ag.servico_nome,
        data: formatData(ag.data),
        horario: ag.horario,
        taxa: formatBRL(pag.taxa || 30),
      });
      const destino = pag.whatsapp_comprovantes || config.whatsapp_profissional;
      const url = waLink(studioPhone(destino), msg);
      setWaUrl(url);
      window.open(url, "_blank");
      setEtapa("final");
    } finally {
      setEnviando(false);
    }
  };

  const reenviarComprovante = () => {
    setReenviando(true);
    if (waUrl) window.open(waUrl, "_blank");
    setTimeout(() => setReenviando(false), 800);
  };

  const reset = () => {
    setDados({ data: "", horario: "", servicos: [], nome: "", whatsapp: "", nascimento: "", aceitaAniversario: false });
    setAceitouTermos(false);
    setResultado(null);
    setWaUrl("");
    setErro("");
    setAviso("");
    setEtapa("form");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-5">
        <header className="brand-panel rounded-[1.75rem] px-5 py-8 sm:py-10 flex flex-col items-center text-center">
          <BrandLogo className="w-72 max-w-full" />
          <div className="w-10 h-px bg-[#C16F84] my-6" />
          <p className="text-[10px] uppercase tracking-[.2em] text-[#E7B5C3]">Cílios & sobrancelhas</p>
          <h1 className="font-heading booking-heading mt-3">Realçando a beleza<br /><span className="italic text-[#E7B5C3]">do seu olhar!</span></h1>
          <p className="text-[#F8EFEB]/75 text-xs mt-5">Agende o seu horário e eleve a sua autoestima.</p>
        </header>

        {etapa === "pagamento" && resultado ? (
          <div className={secaoCls + " animate-in fade-in slide-in-from-bottom-2 duration-300"}>
            <TelaPagamento
              politica={politica}
              pagamento={resultado.pagamento}
              resumo={{ data: resultado.agendamento.data, horario: resultado.agendamento.horario, procedimento: resultado.agendamento.servico_nome }}
              onEnviado={enviarComprovante}
              enviando={enviando}
            />
          </div>
        ) : etapa === "final" && resultado ? (
          <div className={secaoCls}>
            <TelaConfirmacao
              politica={politica}
              resultado={resultado}
              whatsappUrl={waUrl}
              onNovo={reset}
              onReenviar={reenviarComprovante}
              reenviando={reenviando}
            />
          </div>
        ) : falha ? (
          <div className={secaoCls}>
            <div className="text-center space-y-4 py-6">
              <p className="text-muted-foreground">Não foi possível carregar os horários.</p>
              <Button
                className="h-12"
                onClick={() => {
                  setFalha(false);
                  carregar().catch(() => setFalha(true));
                }}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : !config ? (
          <div className="flex justify-center py-14">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <section className={secaoCls}>
              <h2 className={passoTitulo}>
                <span className={passoNum}>1</span> Procedimentos
              </h2>
              <ServicosLista
                servicos={config.servicos}
                selecionados={dados.servicos}
                onToggle={toggleServico}
              />
              {dados.servicos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {duracaoTotal} min · {servicosSel.some(s=>!s.preco) ? "Valor a definir" : formatBRL(valorTotal)}
                </p>
              )}
              {aviso && <p className="text-sm text-destructive">{aviso}</p>}
            </section>

            {dados.servicos.length > 0 && (
              <section className={secaoCls + " animate-in fade-in slide-in-from-bottom-2 duration-300"}>
                <h2 className={passoTitulo}>
                  <span className={passoNum}>2</span> Escolha o dia e horário
                </h2>
                <CalendarioGlass
                  permitirListaEspera
                  config={config}
                  duracao={duracaoBase}
                  selecionado={dados.data}
                  onSelect={escolherDia}
                />
                {dados.data && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <HorariosGlass
                      horarios={horarios}
                      selecionado={dados.horario}
                      onSelect={(h) => {
                        setAviso("");
                        mudar("horario", h);
                      }}
                    />
                  </div>
                )}
              </section>
            )}

            {nenhumLivre && dados.servicos.length > 0 && (
              <section className={secaoCls}>
                <h2 className={passoTitulo}>Lista de espera</h2>
                {esperaConfirmada ? (
                  <p role="status" className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm">
                    Você entrou na lista! Se surgir uma vaga, a Kauane poderá chamar você pelo WhatsApp. Ainda não é uma reserva.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Este dia está lotado. Deixe seu nome e WhatsApp para receber um contato se surgir uma vaga.</p>
                    <DadosCliente nome={dados.nome} whatsapp={dados.whatsapp} nascimento={dados.nascimento} onChange={mudar} />
                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                    <Button className="w-full h-12" disabled={enviandoEspera || dados.nome.trim().length < 2 || digits(dados.whatsapp).length < 10} onClick={entrarNaEspera}>
                      {enviandoEspera ? "Enviando..." : "Entrar na lista de espera"}
                    </Button>
                    <p className="text-xs text-muted-foreground">A inscrição não bloqueia o horário, nem exige Pix. A vaga será confirmada pela Kauane.</p>
                  </>
                )}
              </section>
            )}

            {dados.horario && dados.servicos.length > 0 && (
              <section className={secaoCls + " animate-in fade-in slide-in-from-bottom-2 duration-300"}>
                <h2 className={passoTitulo}>
                  <span className={passoNum}>3</span> Seus dados
                </h2>
                <DadosCliente nome={dados.nome} whatsapp={dados.whatsapp} nascimento={dados.nascimento} onChange={mudar} />
                {temManutencao && (
                  <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 text-sm space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="font-semibold text-gold flex items-center gap-1.5">
                      ✨ Seu horário de manutenção já será reservado automaticamente!
                    </p>
                    <p className="text-muted-foreground">
                      Para manter seus cílios sempre lindos, vamos deixar uma manutenção pré-agendada
                      para 20 dias após o seu atendimento, no mesmo horário sempre que houver disponibilidade.
                    </p>
                    <p className="text-muted-foreground">
                      💕 Se precisar mudar a data ou o horário depois, não tem problema! É só falar com a
                      Kauane pelo WhatsApp.
                    </p>
                  </div>
                )}
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm space-y-1">
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium capitalize text-right">{dataLonga(dados.data)}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Horário</span>
                    <span className="font-medium">{dados.horario}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-medium">{duracaoTotal} min</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Valor do procedimento</span>
                    <span className="font-medium">{servicosSel.some(s=>!s.preco) ? "Valor a definir" : formatBRL(valorTotal)}</span>
                  </p>
                  {exigirTaxa && (
                    <p className="flex justify-between gap-3 pt-1 border-t border-gold/20">
                      <span className="text-muted-foreground">Taxa de reserva</span>
                      <span className="font-semibold text-gold">{formatBRL(config.pagamento.taxa)}</span>
                    </p>
                  )}
                </div>
                {exigirTaxa && (
                  <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-800/90 dark:text-amber-200/80">
                    💳 Você pagará uma taxa de <strong>{formatBRL(config.pagamento.taxa)}</strong> via Pix para
                    reservar o horário. <span className="whitespace-pre-wrap">{politica}</span>
                  </div>
                )}
                {erro && <p className="text-sm text-destructive">{erro}</p>}
                <Button
                  className="w-full h-14 font-semibold uppercase tracking-widest text-sm"
                  onClick={irParaPagamento}
                  disabled={!pronto || confirmando}
                >
                  {confirmando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Reservando...
                    </>
                  ) : exigirTaxa ? (
                    <>
                      <CreditCard className="w-4 h-4" /> Ir para pagamento
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" /> Confirmar e falar no WhatsApp
                    </>
                  )}
                </Button>
              </section>
            )}
          </>
        )}

        <footer className="text-center text-xs text-muted-foreground space-y-3 py-5">
          <p className="font-heading text-xl text-foreground">Kauane Zenie · Studio de Beleza</p>
          <p>{STUDIO.address}<br />{STUDIO.city}</p>
          <p>Cuidar de você é investimento.</p>
          <a href="https://maps.app.goo.gl/QbwzzV5FzwSZW9Ym9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 justify-center rounded-full bg-[#560623] px-5 py-3 text-white font-semibold">Como chegar ao studio <ExternalLink size={15} /></a>
          <div className="flex items-center justify-center gap-5">
            <a className="text-gold underline underline-offset-4" href={STUDIO.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="text-gold underline underline-offset-4" href={STUDIO.whatsappLink} target="_blank" rel="noreferrer">Fale com o studio</a>
          </div>
          <p><a href="https://gabardolabs.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Desenvolvido por GabardoLabs.com</a></p>
        </footer>
      </div>
    </div>
  );
}

