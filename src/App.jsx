import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Layout from '@/components/Layout';
import Inicio from '@/pages/Inicio';
import Agenda from '@/pages/Agenda';
import Clientes from '@/pages/Clientes';
import ClienteDetalhe from '@/pages/ClienteDetalhe';
import Financeiro from '@/pages/Financeiro';
import Aniversarios from '@/pages/Aniversarios';
import Servicos from '@/pages/Servicos';
import Relatorios from '@/pages/Relatorios';
import Mais from '@/pages/Mais';
import Conta from '@/pages/Conta';
import Aparencia from '@/pages/Aparencia';
import Agendar from '@/pages/Agendar';
import AgendamentoOnline from '@/pages/AgendamentoOnline';
import ConfigAgenda from '@/pages/ConfigAgenda';
import BrandLogo from '@/components/BrandLogo';

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center gap-5">
        <BrandLogo variant="icon" className="w-24 h-24" />
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/agendar" element={<Agendar />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route path="/" element={<Layout />}>
        <Route index element={<Inicio />} />
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
      </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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