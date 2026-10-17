import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CalendarOff, Plus, Save } from "lucide-react";
import DiaFuncionamento from "@/components/configagenda/DiaFuncionamento";
import ExcecaoItem from "@/components/configagenda/ExcecaoItem";
import { Carregando } from "@/lib/helpers";

const ORDEM = [1, 2, 3, 4, 5, 6, 0];
const LABELS = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};
const vazio = () => ORDEM.map((d) => ({ dia: d, ativo: false, periodos: [] }));

export default function ConfigAgenda() {
  const { toast } = useToast();
  const [registro, setRegistro] = useState(null);
  const [horarios, setHorarios] = useState(null);
  const [excecoes, setExcecoes] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novoMotivo, setNovoMotivo] = useState("");

  const carregar = async () => {
    const [funcs, excs] = await Promise.all([
      base44.entities.ConfigAgenda.filter({ tipo: "funcionamento" }),
      base44.entities.ConfigAgenda.filter({ tipo: "excecao" }),
    ]);
    setRegistro(funcs[0] || null);
    setHorarios(funcs[0]?.horarios?.length ? funcs[0].horarios : vazio());
    setExcecoes(
      (excs || []).sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    );
  };

  useEffect(() => {
    carregar();
  }, []);

  const mudarDia = (dia, valor) =>
    setHorarios((h) => h.map((d) => (d.dia === dia.dia ? valor : d)));

  const salvar = async () => {
    setSalvando(true);
    try {
      const payload = { tipo: "funcionamento", horarios };
      if (registro) {
        await base44.entities.ConfigAgenda.update(registro.id, payload);
      } else {
        const r = await base44.entities.ConfigAgenda.create(payload);
        setRegistro(r);
      }
      toast({ title: "Horários de funcionamento salvos" });
    } finally {
      setSalvando(false);
    }
  };

  const addExcecao = async () => {
    if (!novaData) return;
    await base44.entities.ConfigAgenda.create({
      tipo: "excecao",
      data: novaData,
      motivo: novoMotivo.trim() || "Estúdio fechado",
    });
    setNovaData("");
    setNovoMotivo("");
    carregar();
  };

  const removerExcecao = async (id) => {
    await base44.entities.ConfigAgenda.delete(id);
    carregar();
  };

  if (!horarios || !excecoes) return <Carregando />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Horários da Agenda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure os dias e horários de funcionamento — o link de agendamento online segue
          exatamente estas regras, em tempo real.
        </p>
      </div>

      <div className="space-y-3">
        {horarios.map((d) => (
          <DiaFuncionamento key={d.dia} label={LABELS[d.dia]} dia={d} onChange={(v) => mudarDia(d, v)} />
        ))}
      </div>

      <Button className="h-12 w-full sm:w-auto" onClick={salvar} disabled={salvando}>
        <Save /> {salvando ? "Salvando..." : "Salvar horários"}
      </Button>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold">Exceções de agenda</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Marque datas específicas como fechadas (feriados, viagens). Elas têm prioridade sobre o
          horário semanal e bloqueiam agendamentos online naquele dia.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <Label className="sr-only">Data</Label>
            <Input
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="h-12 sm:w-44"
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="sr-only">Motivo</Label>
            <Input
              value={novoMotivo}
              onChange={(e) => setNovoMotivo(e.target.value)}
              placeholder="Motivo (ex.: feriado, viagem)"
              className="h-12"
            />
          </div>
          <Button className="h-12" onClick={addExcecao} disabled={!novaData}>
            <Plus /> Bloquear data
          </Button>
        </div>

        {excecoes.length > 0 && (
          <div className="space-y-2">
            {excecoes.map((e) => (
              <ExcecaoItem key={e.id} excecao={e} onRemover={removerExcecao} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}