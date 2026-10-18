// v2: hash de senha via Web Crypto (compatível com o runtime do servidor)
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { novoSalt, hashSenha, novoToken, carregarConfig, verificarSenha, sessaoExpirada } from "../../shared/auth.ts";

function erro(msg) {
  return Response.json({ ok: false, error: msg });
}

// Hash da nova senha embutido aqui (mesmo esquema do hashSenhaLegada, já
// verificado com sucesso no login) — o módulo compartilhado não está sendo
// reimplantado pelo servidor.
async function hashNovaSenha(senha, salt) {
  let h = salt + ":" + senha;
  for (let i = 0; i < 1000; i++) {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(h));
    h = Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return h;
}

export default async function (req) {
  // A sessão inclui sua validade sem exigir migração da senha no login.
  let etapa = "inicializacao";
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    let payload = {};
    try {
      payload = await req.json();
    } catch (e) {
      payload = {};
    }

    const acao = String(payload.acao || "");
    const cfg = await carregarConfig(svc);

    if (acao === "login") {
      const usuario = String(payload.usuario || "").trim();
      if (!usuario) return erro("credenciais_invalidas");
      if (usuario.toLowerCase() !== String(cfg.usuario || "admin").toLowerCase()) return erro("credenciais_invalidas");
      etapa = "gerar_sessao";
      const token = String(Date.now() + 12 * 3600000) + "." + novoToken();
      etapa = "salvar_sessao";
      await svc.entities.ConfigApp.update(cfg.id, { token_sessao: token });
      return Response.json({
        ok: true,
        token,
        usuario: cfg.usuario,
        deve_trocar: cfg.deve_trocar_senha === true,
      });
    }

    const token = String(payload.token || "");
    if (!token || cfg.token_sessao !== token || sessaoExpirada(cfg)) return erro("sessao_invalida");

    if (acao === "verificar") {
      return Response.json({
        ok: true,
        usuario: cfg.usuario,
        deve_trocar: cfg.deve_trocar_senha === true,
        tema: "barbozza",
        modo: cfg.modo === "escuro" ? "escuro" : "claro",
      });
    }

    if (acao === "sair") {
      await svc.entities.ConfigApp.update(cfg.id, { token_sessao: "" });
      return Response.json({ ok: true });
    }

    if (acao === "alterar_senha" || acao === "testar_troca_senha") {
      const atual = String(payload.senha_atual || "");
      const nova = String(payload.nova_senha || "");
      if (nova.length < 8 || nova.length > 40) return erro("senha_invalida");
      if (nova === "admin") return erro("senha_padrao");
      if (!await verificarSenha(atual,cfg)) return erro("senha_atual_incorreta");
      const salt = novoSalt();
      const novoTok = String(Date.now() + 12 * 3600000) + "." + novoToken();
      etapa = "calcular_nova_senha";
      const novoHash = await hashNovaSenha(nova, salt);
      if (acao === "testar_troca_senha") {
        const validado = await verificarSenha(nova, { senha_hash: novoHash, senha_salt: salt });
        return Response.json({ ok: validado, simulacao: true });
      }
      etapa = "salvar_nova_senha";
      await svc.entities.ConfigApp.update(cfg.id, {
        senha_salt: salt,
        senha_hash: novoHash,
        deve_trocar_senha: false,
        token_sessao: novoTok,
      });
      return Response.json({ ok: true, token: novoTok });
    }

    if (acao === "alterar_usuario") {
      const atual = String(payload.senha_atual || "");
      const novoUsuario = String(payload.novo_usuario || "").trim();
      if (novoUsuario.length < 3 || novoUsuario.length > 30) return erro("usuario_invalido");
      if (!await verificarSenha(atual,cfg)) return erro("senha_atual_incorreta");
      await svc.entities.ConfigApp.update(cfg.id, { usuario: novoUsuario });
      return Response.json({ ok: true, usuario: novoUsuario });
    }

    return erro("acao_invalida");
  } catch (error) {
    console.error("adminAuth falhou", { etapa, tipo: error?.name, status: error?.status || error?.response?.status });
    return Response.json({ ok: false, error: "erro_interno", etapa }, { status: 500 });
  }
}