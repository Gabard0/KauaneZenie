import React, { lazy, Suspense } from "react";
import { Carregando } from "@/lib/helpers";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from "@/components/ProtectedRoute";
const Login = lazy(() => import("@/pages/Login"));
import Layout from '@/components/Layout';
const Inicio = lazy(() => import("@/pages/Inicio"));
const Landing = lazy(() => import("@/pages/Landing"));
const Agenda = lazy(() => import("@/pages/Agenda"));
const Clientes = lazy(() => import("@/pages/Clientes"));
const ClienteDetalhe = lazy(() => import("@/pages/ClienteDetalhe"));
const Financeiro = lazy(() => import("@/pages/Financeiro"));
const Aniversarios = lazy(() => import("@/pages/Aniversarios"));
const Servicos = lazy(() => import("@/pages/Servicos"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Mais = lazy(() => import("@/pages/Mais"));
const Conta = lazy(() => import("@/pages/Conta"));
const Aparencia = lazy(() => import("@/pages/Aparencia"));
const Agendar = lazy(() => import("@/pages/Agendar"));
const AgendamentoOnline = lazy(() => import("@/pages/AgendamentoOnline"));
const ConfigAgenda = lazy(() => import("@/pages/ConfigAgenda"));
const ListaEspera = lazy(() => import("@/pages/ListaEspera"));
import BrandLogo from '@/components/BrandLogo';

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="brand-panel fixed inset-0 bg-[#560623] flex flex-col items-center justify-center gap-5">
        <BrandLogo variant="icon" className="w-24 h-24" />
        <div className="w-8 h-8 border-2 border-[#F8EFEB]/20 border-t-[#F8EFEB] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Carregando />}><Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/agendar" element={<Agendar />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route path="/" element={<Layout />}>
        <Route path="painel" element={<Inicio />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalhe />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="aniversarios" element={<Aniversarios />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="mais" element={<Mais />} />
        <Route path="conta" element={<Conta />} />
        <Route path="aparencia" element={<Aparencia />} />
        <Route path="agendamento-online" element={<AgendamentoOnline />} />
        <Route path="config-agenda" element={<ConfigAgenda />} />
        <Route path="lista-espera" element={<ListaEspera />} />
      </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes></Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
