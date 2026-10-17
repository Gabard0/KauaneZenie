import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { formatData, waLink, STATUS, STATUS_PAGAMENTO, formatBRL } from "@/lib/helpers";
import AgendamentoDialog from "./AgendamentoDialog";
import FinalizarDialog from "./FinalizarDialog";
import { MessageCircle, Lock, Trash2, Heart, Sparkles, Link2 } from "lucide-react";

export default function AgendamentoDetalhe({ agendamentoId, onClose, onChanged }) {
  const [ag, setAg] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [manutVinculada, setManutVinculada] = useState(null);
  const [principalVinculado, setPrincipalVinculado] = useState(null);
  const [modo, setModo] = useState(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [acaoManut, setAcaoManut] = useState(null); // { tipo: "cancelar" | "excluir" }
  const [resolvendoManut, setResolvendoManut] = useState(false);

  const recarregar = async () => {
    try {
      const a = await base44.entities.Agendamento.get(agendamentoId);
      setAg(a);
      return a;
    } catch {
      onClose();
      return null;
    }
  };

  const carregarVinculos = async (a) => {
    setManutVinculada(null);
    setPrincipalVinculado(null);
    if (a?.manutencao_vinculada_id) {
      try {
        setManutVinculada(await base44.entities.Agendamento.get(a.manutencao_vinculada_id));
      } catch {
        setManutVinculada(null);
      }
    }
    if (a?.tipo === "manutencao" && a?.agendamento_principal_id) {
      try {
        setPrincipalVinculado(await base44.entities.Agendamento.get(a.agendamento_principal_id));
      } catch {
        setPrincipalVinculado(null);
      }
    }
  };

  useEffect(() => {
    const carregar = async () => {
      const a = await recarregar();
      if (a?.cliente_id) {
        try {
          setCliente(await base44.entities.Cliente.get(a.cliente_id));
        } catch {
          setCliente(null);
        }
      }
      carregarVinculos(a);
    };
    carregar();
  }, [agendamentoId]);

  if (!ag) return null;

  const st = STATUS[ag.status] || STATUS.agendado;
  const bloqueio = !ag.cliente_id && ag.titulo;
  const ehManut = ag.tipo === "manutencao";
  const manutAguardando = ehManut && ag.manutencao_status === "aguardando_horario";
  const temManutVinculada = !!ag.manutencao_vinculada_id && manutVinculada;
  const aguardandoPagamento = ag.status_pagamento === "aguardando_comprovante";
  const msgConfirmar = `Olá, ${ag.cliente_nome}! Confirmando seu horário no dia ${formatData(ag.data)} às ${ag.horario}. Nos vemos! 💅`;
  const msgLembrar = `Oi, ${ag.cliente_nome}! Passando para lembrar do seu horário no dia ${formatData(ag.data)} às ${ag.horario}. 💅`;

  const mudarStatus = async (status) => {
    await base44.entities.Agendamento.update(agendamentoId, { status });
    await recarregar();
    onChanged && onChanged();
  };

  const confirmarPagamento = async () => {
    await base44.entities.Agendamento.update(agendamentoId, {
      status: "confirmado",
      status_pagamento: "pago",
    });
    if (ag.manutencao_vinculada_id) {
      try {
        await base44.entities.Agendamento.update(ag.manutencao_vinculada_id, {
          status: "confirmado",
          status_pagamento: "pago",
        });
      } catch (e) {}
    }
    await recarregar();
    onChanged && onChanged();
  };

  const rejeitarPagamento = async () => {
    await base44.entities.Agendamento.update(agendamentoId, {
      status: "cancelado",
      status_pagamento: "cancelado",
    });
    if (ag.manutencao_vinculada_id) {
      try {
        await base44.entities.Agendamento.update(ag.manutencao_vinculada_id, {
          status: "cancelado",
          status_pagamento: "cancelado",
        });
      } catch (e) {}
    }
    await recarregar();
    onChanged && onChanged();
  };

  // Cancelar ou excluir o principal — pergunta sobre a manutenção vinculada
  const iniciarAcao = (tipo) => {
    if (temManutVinculada && manutVinculada.status !== "cancelado" && manutVinculada.status !== "concluido") {
      setAcaoManut({ tipo });
    } else if (tipo === "cancelar") {
      mudarStatus("cancelado");
    } else {
      setConfirmandoExclusao(true);
    }
  };

  const resolverManut = async (decisao) => {
    // decisao: "ambos" | "manter" | "voltar"
    if (decisao === "voltar") {
      setAcaoManut(null);
      return;
    }
    setResolvendoManut(true);
    try {
      if (acaoManut.tipo === "cancelar") {
        await base44.entities.Agendamento.update(agendamentoId, { status: "cancelado" });
        if (decisao === "ambos") {
          await base44.entities.Agendamento.update(manutVinculada.id, { status: "cancelado" });
        }
        await recarregar();
        onChanged && onChanged();
      } else {
        // excluir
        await base44.entities.Agendamento.delete(agendamentoId);
        if (decisao === "ambos") {
          await base44.entities.Agendamento.delete(manutVinculada.id);
        } else {
          // manter manutenção: limpa a referência do principal removido
          await base44.entities.Agendamento.update(manutVinculada.id, { agendamento_principal_id: "" });
        }
        onChanged && onChanged();
      }
      setAcaoManut(null);
      if (acaoManut.tipo === "excluir") onClose();
    } finally {
      setResolvendoManut(false);
    }
  };

  const excluirSimples = async () => {
    setExcluindo(true);
    try {
      // Se for manutenção, limpa a referência no atendimento principal
      if (ehManut && ag.agendamento_principal_id) {
        try {
          await base44.entities.Agendamento.update(ag.agendamento_principal_id, { manutencao_vinculada_id: "" });
        } catch (e) {}
      }
      await base44.entities.Agendamento.delete(agendamentoId);
      setConfirmandoExclusao(false);
      onClose();
      onChanged && onChanged();
    } catch (e) {
      setExcluindo(false);
      throw e;
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bloqueio ? "Horário bloqueado" : ehManut ? `💕 Manutenção · ${ag.cliente_nome || ""}` : ag.cliente_nome || "Agendamento"}
            </DialogTitle>
          </DialogHeader>
          {bloqueio ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>{ag.titulo}</span>
              </div>
              <p className="text-sm">
                {formatData(ag.data)} às {ag.horario}
              </p>
              <Button variant="ghost" className="w-full text-destructive" onClick={() => setConfirmandoExclusao(true)}>
                <Trash2 className="w-4 h-4 mr-1" /> Excluir bloqueio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
                <div>
                  <div className="text-sm text-muted-foreground">{ag.servico_nome || "Procedimento"}</div>
                  <div className="font-semibold">
                    {formatData(ag.data)} {manutAguardando ? "" : `às ${ag.horario}`}
                    {manutAguardando && <span className="text-muted-foreground font-normal"> · aguardando horário</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
              </div>

              {/* Pagamento da taxa (agendamentos online com taxa) */}
              {ag.status_pagamento && ag.status_pagamento !== "pendente" && (
                <div className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor do procedimento</span>
                    <span className="font-medium">{formatBRL(ag.valor || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de reserva</span>
                    <span className="font-semibold text-gold">{formatBRL(ag.taxa_reserva || 30)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pagamento da taxa</span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        (STATUS_PAGAMENTO[ag.status_pagamento] || {}).cls || ""
                      }`}
                    >
                      {(STATUS_PAGAMENTO[ag.status_pagamento] || {}).label || ag.status_pagamento}
                    </span>
                  </div>
                  {aguardandoPagamento && (
                    <p className="text-xs text-muted-foreground pt-1">
                      ⚠️ Aguardando a cliente enviar o comprovante do Pix pelo WhatsApp. Confirme o
                      pagamento aqui após conferir o comprovante.
                    </p>
                  )}
                </div>
              )}

              {/* Vínculo: este é uma manutenção vinculada a um atendimento principal */}
              {ehManut && principalVinculado && (
                <div className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 flex items-start gap-2.5">
                  <Link2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Vinculada ao atendimento de </span>
                    <span className="font-medium">{formatData(principalVinculado.data)}</span>
                    {principalVinculado.horario ? (
                      <span className="text-muted-foreground"> às {principalVinculado.horario}</span>
                    ) : null}
                  </p>
                </div>
              )}

              {/* Vínculo: este atendimento possui uma manutenção agendada */}
              {temManutVinculada && (
                <div className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-gold flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Manutenção vinculada
                    </p>
                    {manutVinculada.status === "cancelado" ? (
                      <p className="text-muted-foreground">Manutenção cancelada.</p>
                    ) : manutVinculada.manutencao_status === "aguardando_horario" ? (
                      <p className="text-muted-foreground">
                        Para {formatData(manutVinculada.data)} · <strong>aguardando horário</strong> — ajuste manualmente.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Para {formatData(manutVinculada.data)} às {manutVinculada.horario}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {cliente?.telefone && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Telefone: </span>
                  {cliente.telefone}
                </div>
              )}
              {ag.observacao && (
                <div className="text-sm rounded-xl bg-muted/50 px-4 py-3">
                  <span className="text-muted-foreground">Obs.: </span>
                  {ag.observacao}
                </div>
              )}
              {cliente?.telefone && !manutAguardando && (
                <div className="grid grid-cols-2 gap-2">
                  <a href={waLink(cliente.telefone, msgConfirmar)} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full h-11">
                      <MessageCircle className="w-4 h-4 mr-1" /> Confirmar
                    </Button>
                  </a>
                  <a href={waLink(cliente.telefone, msgLembrar)} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full h-11">
                      <MessageCircle className="w-4 h-4 mr-1" /> Lembrar
                    </Button>
                  </a>
                </div>
              )}
              {aguardandoPagamento && (
                <div className="space-y-2">
                  <Button
                    className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                    onClick={confirmarPagamento}
                  >
                    ✅ Confirmar pagamento
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={rejeitarPagamento}
                  >
                    ❌ Pagamento não confirmado
                  </Button>
                </div>
              )}
              {["agendado", "confirmado"].includes(ag.status) && !aguardandoPagamento && (
                <Button className="w-full h-12 text-base" onClick={() => setModo("finalizar")}>
                  Finalizar atendimento
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {ag.status === "agendado" && !aguardandoPagamento && (
                  <Button variant="outline" className="h-11" onClick={() => mudarStatus("confirmado")}>
                    Confirmar horário
                  </Button>
                )}
                {ag.status !== "concluido" && (
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => setModo("reagendar")}
                    style={ag.status !== "agendado" || aguardandoPagamento ? { gridColumn: "span 2" } : undefined}
                  >
                    {manutAguardando ? "Definir horário" : "Reagendar"}
                  </Button>
                )}
              </div>
              {["agendado", "confirmado"].includes(ag.status) && !aguardandoPagamento && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-11" onClick={() => iniciarAcao("cancelar")}>
                    Cancelar
                  </Button>
                  <Button variant="outline" className="h-11" onClick={() => mudarStatus("nao_compareceu")}>
                    Não compareceu
                  </Button>
                </div>
              )}
              <Button variant="ghost" className="w-full text-destructive" onClick={() => iniciarAcao("excluir")}>
                <Trash2 className="w-4 h-4 mr-1" /> Excluir agendamento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {modo === "finalizar" && ag && (
        <FinalizarDialog
          agendamento={ag}
          onClose={() => setModo(null)}
          onFinalizado={async () => {
            await recarregar();
            onChanged && onChanged();
          }}
        />
      )}
      {modo === "reagendar" && ag && (
        <AgendamentoDialog
          open
          modo="reagendar"
          agendamento={ag}
          onClose={() => setModo(null)}
          onSaved={async () => {
            const a = await recarregar();
            carregarVinculos(a);
            onChanged && onChanged();
          }}
        />
      )}

      {/* Prompt de exclusão simples (bloqueio ou agendamento sem manutenção ativa) */}
      <AlertDialog open={confirmandoExclusao} onOpenChange={(o) => !excluindo && setConfirmandoExclusao(o)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {bloqueio ? "bloqueio" : "agendamento"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {bloqueio
                ? "O horário bloqueado será liberado novamente na agenda."
                : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                excluirSimples();
              }}
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Prompt de manutenção vinculada ao cancelar/excluir o principal */}
      <AlertDialog open={!!acaoManut} onOpenChange={(o) => !resolvendoManut && !o && setAcaoManut(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {acaoManut?.tipo === "excluir" ? "Excluir atendimento e manutenção?" : "Cancelar atendimento e manutenção?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {temManutVinculada && manutVinculada.manutencao_status !== "aguardando_horario" && manutVinculada.horario
                ? `Este atendimento possui uma manutenção automática vinculada para ${formatData(manutVinculada.data)} às ${manutVinculada.horario}.`
                : `Este atendimento possui uma manutenção automática vinculada para ${manutVinculada ? formatData(manutVinculada.data) : ""} (aguardando horário).`}
              {"  "}Deseja {acaoManut?.tipo === "excluir" ? "excluir" : "cancelar"} também a manutenção?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
            <AlertDialogCancel disabled={resolvendoManut} onClick={(e) => { e.preventDefault(); resolverManut("voltar"); }}>
              Voltar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              disabled={resolvendoManut}
              onClick={() => resolverManut("manter")}
            >
              Manter manutenção
            </Button>
            <AlertDialogAction
              disabled={resolvendoManut}
              onClick={(e) => {
                e.preventDefault();
                resolverManut("ambos");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resolvendoManut ? "..." : acaoManut?.tipo === "excluir" ? "Excluir os dois" : "Cancelar os dois"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}