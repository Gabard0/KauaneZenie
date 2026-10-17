import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  diasAteAniversario,
  idade,
  formatData,
  waLink,
  Carregando,
} from "@/lib/helpers";
import { Cake, MessageCircle } from "lucide-react";

const OPCOES = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Próximos 7 dias" },
  { id: "mes", label: "Este mês" },
];

export default function Aniversarios() {
  const [clientes, setClientes] = useState(null);
  const [opcao, setOpcao] = useState("semana");

  useEffect(() => {
    base44.entities.Cliente.list().then(setClientes);
  }, []);

  if (clientes === null) return <Carregando />;

  const mesAtual = new Date().getMonth() + 1;
  const base = clientes
    .filter((c) => c.data_nascimento)
    .map((c) => ({ c, dias: diasAteAniversario(c.data_nascimento) }));

  let lista;
  if (opcao === "hoje") lista = base.filter((x) => x.dias === 0);
  else if (opcao === "semana")
    lista = base.filter((x) => x.dias !== null && x.dias <= 7).sort((a, b) => a.dias - b.dias);
  else
    lista = base
      .filter((x) => Number(x.c.data_nascimento.slice(5, 7)) === mesAtual)
      .sort((a, b) => Number(a.c.data_nascimento.slice(8)) - Number(b.c.data_nascimento.slice(8)));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-heading font-semibold">Aniversários</h1>

      <div className="flex flex-wrap gap-2">
        {OPCOES.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setOpcao(o.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
              opcao === o.id
                ? "bg-primary text-gold border-gold"
                : "bg-card hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum aniversário neste período.
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(({ c, dias }) => {
            const anos = idade(c.data_nascimento);
            const virando = dias === 0 ? anos : anos + 1;
            const msg = `Feliz aniversário, ${c.nome}! 🎉🌻 Desejo um dia maravilhoso!`;
            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3.5 ${
                  dias === 0 ? "border-gold/60 bg-gold/10" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <Cake className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/clientes/${c.id}`} className="font-medium truncate block hover:underline">
                    {c.nome}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatData(c.data_nascimento)} · faz {virando} anos
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                  {dias !== null && (
                    <p className={`text-xs font-semibold ${dias === 0 ? "text-gold" : "text-muted-foreground"}`}>
                      {dias === 0 ? "Hoje! 🎂" : `em ${dias} ${dias === 1 ? "dia" : "dias"}`}
                    </p>
                  )}
                  {c.telefone && (
                    <a href={waLink(c.telefone, msg)} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-9">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Parabenizar
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}