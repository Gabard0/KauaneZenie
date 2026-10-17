import { base44 } from "@/api/base44Client";

const TOKEN_KEY = "barbozza_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";

export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

const invocar = async (payload) => {
  const r = await base44.functions.invoke("adminAuth", payload);
  return r.data;
};

export const adminLogin = (usuario, senha) => invocar({ acao: "login", usuario, senha });

export const adminVerificar = (token) => invocar({ acao: "verificar", token });

export const adminSair = (token) => invocar({ acao: "sair", token });

export const adminAlterarSenha = (token, senhaAtual, novaSenha) =>
  invocar({ acao: "alterar_senha", token, senha_atual: senhaAtual, nova_senha: novaSenha });

export const adminAlterarUsuario = (token, senhaAtual, novoUsuario) =>
  invocar({ acao: "alterar_usuario", token, senha_atual: senhaAtual, novo_usuario: novoUsuario });

export const adminLerConfig = () =>
  base44.functions.invoke("adminConfig", { acao: "ler" }).then((r) => r.data);

export const adminSalvarConfig = (payload) =>
  base44.functions.invoke("adminConfig", { acao: "salvar", ...payload }).then((r) => r.data);