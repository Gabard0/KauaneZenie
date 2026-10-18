export const MENSAGEM_PADRAO =
  "Oi, Kauane! 💕 Acabei de realizar o pagamento da taxa de agendamento.\n\n" +
  "👤 Nome: {nome}\n" +
  "📱 WhatsApp: {whatsapp}\n" +
  "✨ Procedimento: {procedimentos}\n" +
  "📅 Data: {data}\n" +
  "⏰ Horário: {horario}\n" +
  "💰 Taxa paga: {taxa}\n\n" +
  "Estou enviando o comprovante para confirmar meu horário. ✨";

export function novoSalt() {
  const buf = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashSenha(senha, salt) {
  // PBKDF2 via Web Crypto (suportado no runtime do servidor)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(senha),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210000 },
    key,
    256
  );
  return "pbkdf2:" + Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashSenhaLegada(senha, salt) {
  let h = salt + ":" + senha;
  for (let i = 0; i < 1000; i++) {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(h));
    h = Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return h;
}

export function novoToken() {
  return (crypto.randomUUID ? crypto.randomUUID() : novoSalt()) +
    (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : novoSalt());
}

export async function carregarConfig(svc) {
  const regs = await svc.entities.ConfigApp.list();
  if (regs.length > 0) return regs[0];
  const salt = novoSalt();
  return await svc.entities.ConfigApp.create({
    usuario: "admin",
    senha_salt: salt,
    senha_hash: await hashSenha("admin", salt),
    deve_trocar_senha: true,
    tema: "barbozza",
    whatsapp: "41998047493",
    mensagem_whatsapp: MENSAGEM_PADRAO,
    token_sessao: "",
  });
}

export function sessaoExpirada(cfg) {
  const prefix = String(cfg.token_sessao || "").split(".")[0];
  const expira = /^\d{13}$/.test(prefix) ? Number(prefix) : Date.parse(cfg.sessao_expira_em || "");
  return !Number.isFinite(expira) || expira <= Date.now();
}

export async function exigirAdmin(svc, token) {
  const cfg = (await svc.entities.ConfigApp.list())[0];
  if (!cfg || !token || cfg.token_sessao !== token || cfg.deve_trocar_senha ||
      sessaoExpirada(cfg)) {
    throw new Error("sessao_invalida");
  }
  return cfg;
}

export async function comTravaAgenda(svc, executar) {
  const cfg = (await svc.entities.ConfigApp.list())[0];
  if (!cfg) throw new Error("configuracao_ausente");
  const token = novoToken();
  const agora = new Date().toISOString();
  const result = await svc.entities.ConfigApp.updateMany({
    id: cfg.id,
    $or: [{ agenda_lock: null }, { agenda_lock: "" }, { agenda_lock: { $exists: false } }, { agenda_lock_expira_em: { $lt: agora } }],
  }, { $set: { agenda_lock: token, agenda_lock_expira_em: new Date(Date.now() + 300000).toISOString() } });
  if (result.updated !== 1) throw new Error("agenda_ocupada");
  try { return await executar(); }
  finally {
    await svc.entities.ConfigApp.updateMany({ id: cfg.id, agenda_lock: token }, { $set: { agenda_lock: "", agenda_lock_expira_em: "" } });
  }
}

export async function verificarSenha(senha, cfg) {
  const expected = cfg.senha_hash || "";
  const calculated = expected.startsWith("pbkdf2:") ? await hashSenha(senha, cfg.senha_salt || "") : await hashSenhaLegada(senha, cfg.senha_salt || "");
  if (calculated.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= calculated.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
