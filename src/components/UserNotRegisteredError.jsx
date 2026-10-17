import React from 'react';
import BrandLogo from '@/components/BrandLogo';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full rounded-3xl bg-card border border-border/60 p-8 text-center space-y-5">
        <BrandLogo variant="icon" className="w-24 h-24" />
        <h1 className="text-2xl font-heading font-semibold text-gold">Acesso restrito</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Você não tem permissão para usar este aplicativo. Entre em contato com a administradora para
          solicitar acesso.
        </p>
        <div className="p-4 rounded-xl bg-foreground/5 border border-border/60 text-sm text-muted-foreground text-left">
          <p>Se você acredita que isso é um erro:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verifique se entrou com a conta correta</li>
            <li>Saia e entre novamente</li>
            <li>Fale com a administradora do aplicativo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
