import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClienteForm from "@/components/clientes/ClienteForm";
import { diasAteAniversario, formatData, Carregando } from "@/lib/helpers";
import { Search, UserPlus, Cake } from "lucide-react";

export default function Clientes() {
  const [clientes, setClientes] = useState(null);
  const [busca, setBusca] = useState("");
  const [abrirForm, setAbrirForm] = useState(false);

  const carregar = async () => setClientes(await base44.entities.Cliente.list());
  useEffect(() => {
    carregar();
  }, []);

  if (clientes === null) return <Carregando />;

  const b = busca.trim().toLowerCase();
  const digitos = b.replace(/\D/g, "");
  const lista = clientes
    .filter(
      (c) =>
        !b ||
        (c.nome || "").toLowerCase().includes(b) ||
        (digitos && (c.telefone || "").replace(/\D/g, "").includes(digitos))
    )
    .sort((a, b2) => (a.nome || "").localeCompare(b2.nome || ""));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} cadastradas</p>
        </div>
        <Button className="h-12" onClick={() => setAbrirForm(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Nova cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone"
          className="h-12 pl-9"
        />
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhuma cliente encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map((c) => {
            const dias = c.data_nascimento ? diasAteAniversario(c.data_nascimento) : null;
            const anivPerto = dias !== null && dias <= 15;
            return (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-gold font-semibold flex items-center justify-center shrink-0">
                  {(c.nome || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.nome}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.telefone || "sem telefone"}</p>
                </div>
                {anivPerto && (
                  <span className="flex items-center gap-1 text-xs text-gold font-medium shrink-0">
                    <Cake className="w-3.5 h-3.5" />
                    {dias === 0 ? "hoje" : formatData(c.data_nascimento)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <ClienteForm open={abrirForm} onClose={() => setAbrirForm(false)} onSaved={carregar} />
    </div>
  );
}