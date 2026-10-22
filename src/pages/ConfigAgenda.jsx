import ConfiguracoesDialog from "@/components/ConfiguracoesDialog";
import HorariosEspeciais from "@/components/configagenda/HorariosEspeciais";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [configOpen, setConfigOpen] = useState(false);
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
        setRegistro({ ...registro, ...payload });
      } else {
        const r = await base44.entities.ConfigAgenda.create(payload);
        setRegistro(r);
      }
      toast({ title: "Horários de funcionamento salvos" });
      setConfigOpen(false);
    } catch {
      toast({ title: "Não foi possível salvar os horários", variant: "destructive" });
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
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-heading font-semibold">Horários da agenda</h1>
          <p className="text-sm text-muted-foreground">Resumo do funcionamento do estúdio.</p></div>
        <ConfiguracoesDialog titulo="Configurar horários" descricao="Funcionamento semanal, folgas e feriados." open={configOpen} onOpenChange={(v) => { if (salvando) return; if (v) setHorarios(registro?.horarios || vazio()); setConfigOpen(v); }}>
          <Tabs defaultValue="semana">
            <TabsList className="grid grid-cols-3 w-full mb-4 h-12">
              <TabsTrigger value="semana" className="px-1 text-xs sm:text-sm">Semana</TabsTrigger>
              <TabsTrigger value="especiais" className="px-1 text-xs sm:text-sm">Períodos</TabsTrigger>
              <TabsTrigger value="excecoes" className="px-1 text-xs sm:text-sm">Folgas</TabsTrigger>
            </TabsList>
            <TabsContent value="especiais"><HorariosEspeciais /></TabsContent>
            <TabsContent value="semana">      <div className="space-y-3">
        {horarios.map((d) => (
          <DiaFuncionamento key={d.dia} label={LABELS[d.dia]} dia={d} onChange={(v) => mudarDia(d, v)} />
        ))}
      </div>

      <Button className="h-12 w-full sm:w-auto" onClick={salvar} disabled={salvando}>
        <Save /> {salvando ? "Salvando..." : "Salvar horários"}
      </Button>

</TabsContent>
            <TabsContent value="excecoes">      <div className="space-y-3 pt-4 border-t">
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
</TabsContent>
          </Tabs>
        </ConfiguracoesDialog>
      </div>
      <div className="rounded-2xl border bg-card divide-y">
        {(registro?.horarios || horarios).map((d) => (
          <div key={d.dia} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span className="font-medium">{LABELS[d.dia]}</span>
            <span className="text-right text-muted-foreground">{d.ativo && d.periodos?.length ? d.periodos.map((p) => `${p.inicio}–${p.fim}`).join(" / ") : "Fechado"}</span>
          </div>
        ))}
      </div>
      <Link to="/agendamento-online" className="block text-sm font-medium text-gold underline underline-offset-4">
        Configurar o limite de abertura da agenda (1 a 365 dias)
      </Link>
      {excecoes.length > 0 && <section className="space-y-2"><h2 className="font-semibold">Folgas e feriados</h2>{excecoes.map((e) => <ExcecaoItem key={e.id} excecao={e} onRemover={removerExcecao} />)}</section>}
    </div>
  );
}
