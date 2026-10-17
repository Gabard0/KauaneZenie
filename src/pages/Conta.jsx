import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, ShieldCheck, Lock } from "lucide-react";
import { adminAlterarSenha, getToken, setToken } from "@/lib/adminAuth";

const ERROS = {
  senha_incorreta: "Senha atual incorreta",
  senha_atual_incorreta: "Senha atual incorreta",
  senha_invalida: "A nova senha deve ter entre 8 e 40 caracteres",
  senha_padrao: "Escolha uma senha diferente de admin",
  sessao_invalida: "Sua sessão expirou. Saia da conta e entre novamente antes de trocar a senha.",
  erro_interno: "O servidor não conseguiu concluir a troca de senha. Sua senha não foi confirmada como alterada.",
};

const inputCls = "h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-gold/60";

export default function Conta() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    if (nova.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (nova !== confirmar) {
      setErro("As senhas não coincidem");
      return;
    }
    setSalvando(true);
    try {
      const r = await adminAlterarSenha(getToken(), atual, nova);
      if (!r.ok) {
        setErro(ERROS[r.error] || "Não foi possível alterar a senha");
        return;
      }
      setToken(r.token);
      setSucesso(true);
      setAtual("");
      setNova("");
      setConfirmar("");
    } catch (err) {
      const d = err?.response?.data || err?.data;
      const status = err?.response?.status || err?.status;
      setErro(ERROS[d?.error] || (status === 401 ? ERROS.sessao_invalida : status >= 500 ? ERROS.erro_interno : status === 404 ? "A função de troca de senha ainda não está disponível nesta versão. Publique a atualização do app." : "Não houve resposta do servidor. Confira sua conexão e tente novamente."));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Conta e segurança</p>
        <h1 className="text-2xl font-heading font-semibold">Trocar senha</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Defina uma senha própria para o acesso ao sistema.
        </p>
      </div>

      <form onSubmit={salvar} className="rounded-2xl border border-gold/20 bg-card p-5 space-y-4">
        {erro && (
          <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-sm">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="p-3 rounded-lg bg-gold/10 border border-gold/40 text-sm text-foreground">
            Senha alterada com sucesso!
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="atual" className="text-foreground/80">Senha atual</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="atual" type="password" autoFocus placeholder="••••••••"
              value={atual} onChange={(e) => setAtual(e.target.value)} className={"pl-10 " + inputCls} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nova" className="text-foreground/80">Nova senha</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="nova" type="password" placeholder="Mínimo 8 caracteres"
              value={nova} onChange={(e) => setNova(e.target.value)} className={"pl-10 " + inputCls} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmar" className="text-foreground/80">Confirmar nova senha</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirmar" type="password" placeholder="••••••••"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={"pl-10 " + inputCls} required />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-semibold uppercase tracking-widest" disabled={salvando}>
          {salvando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar nova senha"
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Após salvar, use sua nova senha para entrar. Se esquecer, entre em contato com o suporte.
        </p>
      </form>
    </div>
  );
}