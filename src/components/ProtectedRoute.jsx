import { Outlet } from 'react-router-dom';
import { useSessaoAdmin } from '@/lib/useSessaoAdmin';
import BrandLogo from '@/components/BrandLogo';

const DefaultFallback = () => (
  <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center gap-5">
    <BrandLogo variant="icon" className="w-24 h-24" />
    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { verificando, autenticado } = useSessaoAdmin();

  if (verificando) {
    return fallback;
  }

  if (!autenticado) {
    return unauthenticatedElement;
  }

  return <Outlet />;
}
