import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { adminLerConfig } from "@/lib/adminAuth";
import { todayISO, formatBRL } from "@/lib/helpers";
import { horariosDoDia, hojeLocalMin, maskTelefone } from "@/lib/booking";
import { normalizarNome, encontrarPorTelefone, encontrarNomesParecidos } from "@/lib/clientesMatch";
import ConfirmacaoParecida from "@/components/clientes/ConfirmacaoParecida";
import CalendarioGlass from "@/components/agendar/CalendarioGlass";
import HorariosGlass from "@/components/agendar/HorariosGlass";
import ServicosLista from "@/components/agendar/ServicosLista";
import { Search, UserPlus, X, Loader2 } from "lucide-react";

export default function AgendamentoDialog({
  open,
  onClose,
  onSaved,
  agendamento = null,
  modo = "agendamento",
  defaults = {},
}) {
  const reagendar = modo === "reagendar";
  const bloqueio = modo === "bloqueio";
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [buscaServico, setBuscaServico] = useState("");
  const [agendaCfg, setAgendaCfg] = useState(null);
  const [ags, setAgs] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [busca, setBusca] = useState("");
  const [servicosSel, setServicosSel] = useState([]);
  const [data, setData] = useState(todayISO());
  const [horario, setHorario] = useState("");
  const [observacao, setObservacao] = useState("");
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [novaNome, setNovaNome] = useState("");
  const [novaTel, setNovaTel] = useState("");
  const [avisoNova, setAvisoNova] = useState("");
  const [parecidas, setParecidas] = useState(null);
  const [pendentes, setPendentes] = useState(null);
  const [manutencaoAutomatica, setManutencaoAutomatica] = useState(false);
  const [recalcManut, setRecalcManut] = useState(true);

  useEffect(() => {
    if (!open) return;
    setErro("");
    setBusca("");
    setData(agendamento?.data || defaults.data || todayISO());
    setHorario(agendamento?.horario || "");
    setObservacao(agendamento?.observacao || "");
    setServicosSel(agendamento?.servico_id ? [agendamento.servico_id] : []);
    setCliente(null);
    setTitulo("");
    setNovaOpen(false);
    setNovaNome("");
    setNovaTel("");
    setAvisoNova("");
    setParecidas(null);
    setPendentes(null);
    setRecalcManut(true);
    const carregar = async () => {
      const [cls, svcs, funcs, excs, lista, config] = await Promise.all([
        base44.entities.Cliente.list(),
        base44.entities.Servico.list(),
        base44.entities.ConfigAgenda.filter({ tipo: "funcionamento" }),
        base44.entities.ConfigAgenda.filter({ tipo: "excecao" }),
        base44.entities.Agendamento.list(),
        adminLerConfig(),
      ]);
      setManutencaoAutomatica(config.manutencao_automatica !== false);
      setClientes(cls);
      setServicos(svcs.filter((s) => s.ativo !== false));
      setAgendaCfg({
        funcionamento: funcs[0] || null,
        excecoes: excs.map((e) => ({ data: e.data, motivo: e.motivo || "" })),
      });
      setAgs(lista);
      const alvo = agendamento?.cliente_id || defaults.cliente_id;
      setCliente((prev) => prev || cls.find((c) => c.id === alvo) || null);
    };
    carregar();
  }, [open]);

  const b = busca.trim();
  const digitosBusca = b.replace(/\D/g, "");
  const bNome = normalizarNome(b);
  const encontrados = b
    ? clientes.filter(
        (c) =>
          (bNome && normalizarNome(c.nome).includes(bNome)) ||
          (digitosBusca.length >= 2 && (c.telefone || "").replace(/\D/g, "").includes(digitosBusca))
      )
    : clientes.slice(0, 6);

  const abrirNova = () => {
    const d = busca.replace(/\D/g, "");
    setNovaNome(d.length >= 10 ? "" : busca.trim());
    setNovaTel(d.length >= 10 ? maskTelefone(d) : "");
    setAvisoNova("");
    setNovaOpen(true);
  };

  const fecharNova = () => {
    setNovaOpen(false);
    setBusca("");
    setNovaNome("");
    setNovaTel("");
    setAvisoNova("");
    setParecidas(null);
    setPendentes(null);
  };

  const criarNova = async (nome, tel) => {
    const nova = await base44.entities.Cliente.create({
      nome,
      ...(tel ? { telefone: tel } : {}),
    });
    setClientes((prev) => [...prev, nova]);
    setCliente(nova);
    fecharNova();
  };

  const continuarNova = async () => {
    const nome = novaNome.trim();
    if (!nome) return setAvisoNova("Informe o nome da cliente.");
    const tel = novaTel.trim();
    // Telefone é o identificador principal: se já existe, seleciona e nunca duplica
    if (tel) {
      const achou = encontrarPorTelefone(clientes, tel);
      if (achou) {
        setCliente(achou);
        fecharNova();
        return;
      }
    }
    // Nome muito provável (idêntico ignorando acentos/caixa/espacos): confirma antes
    const parecidas = encontrarNomesParecidos(clientes, nome);
    if (parecidas.length) {
      setPendentes({ nome, tel });
      setParecidas(parecidas);
      return;
    }
    await criarNova(nome, tel);
  };

  const escolhidos = useMemo(
    () => servicos.filter((s) => servicosSel.includes(s.id)),
    [servicos, servicosSel]
  );
  const duracaoTotal = escolhidos.reduce((t, s) => t + (s.duracao || 60), 0);
  const valorTotal = escolhidos.reduce((t, s) => t + (s.preco || 0), 0);
  const duracaoRef = bloqueio
    ? 30
    : reagendar
      ? agendamento?.duracao || 60
      : duracaoTotal;

  const ocupados = useMemo(
    () =>
      ags
        .filter((a) => a.id !== agendamento?.id && a.status !== "cancelado" && a.horario)
        .map((a) => ({ data: a.data, horario: a.horario, duracao: a.duracao > 0 ? a.duracao : 60 })),
    [ags, agendamento]
  );

  const horarios = useMemo(() => {
    if (!agendaCfg || !data) return [];
    return horariosDoDia({
      funcionamento: agendaCfg.funcionamento,
      excecoes: agendaCfg.excecoes,
      ocupados,
      dataISO: data,
      duracao: duracaoRef,
      agoraMin: data === todayISO() ? hojeLocalMin() : 0,
    });
  }, [agendaCfg, data, duracaoRef, ocupados]);

  const toggleServico = (id) => {
    setErro("");
    const novos = servicosSel.includes(id)
      ? servicosSel.filter((s) => s !== id)
      : [...servicosSel, id];
    if (novos.length === 0) {
      setServicosSel([]);
      setHorario("");
      return;
    }
    if (horario) {
      const novaDur =
        servicos.filter((s) => novos.includes(s.id)).reduce((t, s) => t + (s.duracao || 60), 0);
      const hs = horariosDoDia({
        funcionamento: agendaCfg?.funcionamento,
        excecoes: agendaCfg?.excecoes,
        ocupados,
        dataISO: data,
        duracao: novaDur,
        agoraMin: data === todayISO() ? hojeLocalMin() : 0,
      });
      if (!hs.find((h) => h.hora === horario && h.livre)) {
        setErro("Esses procedimentos não cabem nesse horário — escolha outro horário.");
        setServicosSel(novos);
        setHorario("");
        return;
      }
    }
    setServicosSel(novos);
  };

  const salvar = async () => {
    setErro("");
    if (bloqueio && !titulo.trim()) return setErro("Descreva o motivo do bloqueio (ex.: almoço).");
    if (!reagendar && !bloqueio && !cliente) return setErro("Selecione a cliente.");
    if (!reagendar && !bloqueio && escolhidos.length === 0) return setErro("Selecione ao menos um procedimento.");
    if (!data || !horario) return setErro("Escolha data e horário.");
    setSalvando(true);
    try {
      // Revalidação no ato: mesma fonte de disponibilidade do agendamento público
      const fresh = await base44.entities.Agendamento.filter({ data });
      const ocupadosFrescos = fresh
        .filter((a) => a.id !== agendamento?.id && a.status !== "cancelado" && a.horario)
        .map((a) => ({ data: a.data, horario: a.horario, duracao: a.duracao > 0 ? a.duracao : 60 }));
      const hs = horariosDoDia({
        funcionamento: agendaCfg?.funcionamento,
        excecoes: agendaCfg?.excecoes,
        ocupados: ocupadosFrescos,
        dataISO: data,
        duracao: duracaoRef,
        agoraMin: data === todayISO() ? hojeLocalMin() : 0,
      });
      if (!hs.find((h) => h.hora === horario && h.livre)) {
        setErro("Esse horário acabou de ficar ocupado — escolha outro.");
        return;
      }

      if (reagendar) {
        const updateData = { data, horario, observacao };
        if (agendamento.tipo === "manutencao" && agendamento.manutencao_status === "aguardando_horario") {
          updateData.manutencao_status = "agendada";
        }
        await base44.entities.Agendamento.update(agendamento.id, updateData);
        // Recalcula a manutenção vinculada quando o principal é reagendado
        if (manutencaoAutomatica && recalcManut && agendamento.manutencao_vinculada_id) {
          try {
            await base44.functions.invoke("criarManutencao", { agendamento_principal_id: agendamento.id });
          } catch (e) {}
        }
      } else if (bloqueio) {
        await base44.entities.Agendamento.create({
          titulo: titulo.trim(),
          data,
          horario,
          status: "agendado",
        });
      } else {
        const servicoNome = escolhidos.map((s) => s.nome).join(" + ");
        const criado = await base44.entities.Agendamento.create({
          cliente_id: cliente.id,
          cliente_nome: cliente.nome,
          servico_id: escolhidos[0]?.id || "",
          servico_nome: servicoNome,
          data,
          horario,
          status: "confirmado",
          origem: "manual",
          duracao: duracaoTotal,
          valor: valorTotal,
          observacao,
        });
        // Cria manutenção automática quando o procedimento gera
        if (manutencaoAutomatica && escolhidos[0]?.gera_manutencao) {
          try {
            await base44.functions.invoke("criarManutencao", { agendamento_principal_id: criado.id });
          } catch (e) {}
        }
      }
      onSaved && onSaved();
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  const calCfg = agendaCfg ? { funcionamento: agendaCfg.funcionamento, excecoes: agendaCfg.excecoes, ocupados } : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>
            {reagendar ? "Reagendar atendimento" : bloqueio ? "Bloquear horário" : "Novo agendamento"}
          </DialogTitle>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          {bloqueio ? (
            <div className="space-y-1">
              <Label>Motivo</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: almoço, horário pessoal"
                className="h-12"
              />
            </div>
          ) : (
            <>
              {!reagendar && (
                <>
                  <div className="space-y-1">
                    <Label>Cliente</Label>
                    {cliente ? (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-3">
                        <span className="font-medium truncate">
                          {cliente.nome}
                          {cliente.telefone ? ` · ${cliente.telefone}` : ""}
                        </span>
                        <button type="button" onClick={() => setCliente(null)} aria-label="Trocar cliente">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por nome ou telefone"
                            className="h-12 pl-9"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1">
                          {encontrados.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setCliente(c)}
                              className="w-full text-left rounded-lg border px-3 py-2.5 hover:bg-muted"
                            >
                              <span className="font-medium">{c.nome}</span>
                              {c.telefone && (
                                <span className="text-sm text-muted-foreground"> · {c.telefone}</span>
                              )}
                            </button>
                          ))}
                          {busca && encontrados.length === 0 && !novaOpen && (
                            <button
                              type="button"
                              onClick={abrirNova}
                              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 text-gold px-3 py-2.5 font-medium"
                            >
                              <UserPlus className="w-4 h-4" /> Cadastrar nova cliente
                            </button>
                          )}
                          {novaOpen && (
                            <div className="rounded-xl border border-gold/40 bg-gold/5 p-3 space-y-2">
                              <Input
                                value={novaNome}
                                onChange={(e) => setNovaNome(e.target.value)}
                                placeholder="Nome da cliente"
                                className="h-11"
                                autoFocus
                              />
                              <Input
                                value={novaTel}
                                onChange={(e) => setNovaTel(maskTelefone(e.target.value))}
                                inputMode="tel"
                                placeholder="WhatsApp (opcional)"
                                className="h-11"
                              />
                              {avisoNova && <p className="text-sm text-destructive">{avisoNova}</p>}
                              <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1 h-11" onClick={fecharNova}>
                                  Cancelar
                                </Button>
                                <Button type="button" className="flex-1 h-11" onClick={continuarNova}>
                                  Cadastrar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="busca-procedimento">Procedimentos</Label>
                    <Input id="busca-procedimento" value={buscaServico} onChange={(e) => setBuscaServico(e.target.value)} placeholder="Buscar procedimento" className="h-11" />
                    <div className="max-h-56 sm:max-h-64 overflow-y-auto overflow-x-hidden min-w-0 pr-1">
                    <ServicosLista
                      servicos={servicos.filter((s) => normalizarNome(s.nome).includes(normalizarNome(buscaServico)))}
                      selecionados={servicosSel}
                      onToggle={toggleServico}
                    />
                    </div>
                    {escolhidos.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {duracaoTotal} min · {formatBRL(valorTotal)}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="space-y-1">
                <Label>Observação (opcional)</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={2}
                  placeholder="Ex.: usar esmalte da própria cliente"
                />
              </div>
              {manutencaoAutomatica && reagendar && agendamento?.manutencao_vinculada_id && (
                <label className="flex items-center gap-2.5 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recalcManut}
                    onChange={(e) => setRecalcManut(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm">
                    Recalcular a manutenção vinculada para o novo período (após o novo horário)
                  </span>
                </label>
              )}
            </>
          )}

          {(bloqueio || reagendar || escolhidos.length > 0) && (
            <div className="space-y-4 pt-3 border-t border-border/50">
              <CalendarioGlass
                config={calCfg}
                duracao={duracaoRef}
                selecionado={data}
                onSelect={(iso) => {
                  setErro("");
                  setData(iso);
                  setHorario("");
                }}
              />
              {data && (
                <HorariosGlass
                  horarios={horarios}
                  selecionado={horario}
                  onSelect={(h) => {
                    setErro("");
                    setHorario(h);
                  }}
                />
              )}
            </div>
          )}

          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1 h-12" onClick={salvar} disabled={salvando || !data || !horario}>
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : bloqueio ? (
                "Bloquear"
              ) : reagendar ? (
                "Reagendar"
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </div>
        <ConfirmacaoParecida
          open={!!parecidas}
          candidatas={parecidas || []}
          onEscolher={(c) => {
            setCliente(c);
            fecharNova();
          }}
          onNova={() => pendentes && criarNova(pendentes.nome, pendentes.tel)}
          onClose={() => setParecidas(null)}
        />
      </DialogContent>
    </Dialog>
  );
}