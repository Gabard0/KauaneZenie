import { base44 } from "@/api/base44Client";
import React, { useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Home,
  CalendarDays,
  Users,
  Wallet,
  MoreHorizontal,
  Cake,
  Scissors,
  BarChart3,
  CalendarPlus,
  QrCode,
  Clock,
  Palette,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";

const navPrincipal = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/mais", label: "Mais", icon: MoreHorizontal },
];

const navExtra = [
  { to: "/agendamento-online", label: "Agendamento Online", icon: QrCode },
  { to: "/config-agenda", label: "Horários da Agenda", icon: Clock },
  { to: "/aniversarios", label: "Aniversários", icon: Cake },
  { to: "/servicos", label: "Serviços", icon: Scissors },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/aparencia", label: "Aparência", icon: Palette },
];

const itemCls = (ativo) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    ativo ? "bg-gold/15 text-gold" : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
  }`;

export default function Layout() {
  const sair = () => {
    const token = localStorage.getItem("barbozza_token");
    base44.functions.invoke("adminAuth", {acao:"sair",token}).catch(()=>{});
    localStorage.removeItem("barbozza_token");
    window.location.href="/login";
  };
  useEffect(() => {
    aplicarTema(temaSalvo(), modoSalvo());
  }, []);

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col glass-chrome border-r border-gold/25 p-4 gap-1 z-30 overflow-y-auto">
        <Link to="/" className="block px-1 py-3 mb-2">
          <BrandLogo className="w-full" />
          
        </Link>
        {navPrincipal.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => itemCls(isActive)}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
        <div className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-gold/60">
          Gestão e preferências
        </div>
        {navExtra.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => itemCls(isActive)}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
        <button type="button" onClick={sair} className="mt-auto px-3 py-3 text-left text-sm text-muted-foreground">Sair da conta</button>
      </aside>

      <div className="md:pl-60 relative z-10">
        <header className="hidden md:flex sticky top-0 z-20 h-16 glass-chrome border-b border-gold/25 items-center justify-between gap-4 px-4 lg:px-8">
          <span className="min-w-0 text-sm text-muted-foreground capitalize">Letícia Barboza · Nail Designer · {dataHoje}</span>
          <Link
            to="/agenda"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-gold text-gold px-4 h-10 text-sm font-medium hover:bg-gold/10 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" /> Novo agendamento
          </Link>
        </header>

        <header className="md:hidden sticky top-0 z-20 h-16 glass-chrome border-b border-gold/25 flex items-center justify-center">
          <Link to="/" aria-label="Letícia Barboza · Nail Designer">
            <BrandLogo className="w-28" />
          </Link>
        </header>

        <main className="mobile-main md:pb-6">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-chrome border-t border-gold/30 flex mobile-bottom-nav">
        {navPrincipal.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `min-w-0 flex-1 flex flex-col items-center justify-center gap-1 min-h-14 py-2 text-[11px] font-medium ${
                isActive ? "text-gold" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
