import React, { useEffect, useState } from "react";
import { aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { adminLogin, adminAlterarSenha, setToken } from "@/lib/adminAuth";

const ERROS = {
  credenciais_invalidas: "Usuário ou senha incorretos",
  senha_incorreta: "Senha atual incorreta",
  senha_atual_incorreta: "Senha atual incorreta",
  senha_invalida: "A nova senha deve ter entre 8 e 40 caracteres",
  senha_padrao: "Escolha uma senha diferente de admin",
  usuario_invalido: "O usuário deve ter entre 3 e 30 caracteres",
  campos_invalidos: "Preencha todos os campos",
  sessao_invalida: "Sua sessão expirou. Entre novamente."
};

// Mostra o motivo real da falha em vez de um genérico "erro de conexão"
const mensagemErro = (err) => {
  console.error("Falha na autenticação", err);
  const status = err?.response?.status || err?.status;
  const code = err?.response?.data?.error;
  if (ERROS[code]) return ERROS[code];
  if (status === 401) return ERROS.sessao_invalida;
  if (status >= 500 || code === "erro_interno") return "O servidor não conseguiu concluir a operação. Tente novamente em instantes.";
  if (err?.message && !/network|failed to fetch/i.test(err.message)) return ERROS[err.message] || err.message;
  return "Sem resposta do servidor. Confira sua internet e tente novamente.";
};

const inputCls =
  "pl-10 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:border-gold/60";

export default function Login() {
  const [etapa, setEtapa] = useState("login"); // login | trocar
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [tokenSessao, setTokenSessao] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    aplicarTema(temaSalvo(), modoSalvo());
  }, []);

  const entrar = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await adminLogin(usuario.trim(), senha);
      if (!r.ok) {
        setError(ERROS[r.error] || "Não foi possível entrar");
        return;
      }
      setToken(r.token);
      if (r.deve_trocar) {
        setTokenSessao(r.token);
        setSenha("");
        setEtapa("trocar");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const trocarSenha = async (e) => {
    e.preventDefault();
    setError("");
    if (novaSenha.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const r = await adminAlterarSenha(tokenSessao, senha, novaSenha);
      if (!r.ok) {
        setError(ERROS[r.error] || "Não foi possível alterar a senha");
        return;
      }
      setToken(r.token);
      window.location.href = "/";
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
      <div className="w-full max-w-sm space-y-8 relative">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo variant="vertical" className="w-40 sm:w-48 max-w-full" />
          {etapa === "login" ? (
            <h1 className="font-display text-2xl text-gold text-center leading-snug">
              Bem-vinda ao
              <br />
              Letícia Barboza · Nail Designer
            </h1>
          ) : (
            <div className="text-center space-y-1">
              <h1 className="font-display text-xl text-gold">Primeiro acesso</h1>
              <p className="text-sm text-muted-foreground">
                Por segurança, defina uma nova senha para continuar
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-7 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-sm">
              {error}
            </div>
          )}

          {etapa === "login" ? (
            <form onSubmit={entrar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-foreground/80">
                  Usuário
                </Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="usuario"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    placeholder="Seu usuário"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">
                  Senha
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 font-semibold uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={trocarSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-atual" className="text-foreground/80">
                  Senha atual (padrão)
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="senha-atual"
                    type="password"
                    autoFocus
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha" className="text-foreground/80">
                  Nova senha
                </Label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="nova-senha"
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar" className="text-foreground/80">
                  Confirmar nova senha
                </Label>
                <div className="relative">
                  <ShieldCheck
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="confirmar"
                    type="password"
                    placeholder="••••••••"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 font-semibold uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Definir senha e entrar"
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Esqueceu sua senha? Entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}