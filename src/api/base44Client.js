import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const client = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  appBaseUrl
});


const tokenAdmin = () => localStorage.getItem("barbozza_token") || "";

// Traduz erros de regra (que chegam como HTTP 409) para mensagens amigáveis
const MENSAGENS_ERRO = {
  sessao_invalida: "Sessão expirada. Faça login novamente.",
  credenciais_invalidas: "Usuário ou senha incorretos.",
  horario_ocupado: "Esse horário já está ocupado. Escolha outro.",
  data_passada: "Não é possível agendar em uma data passada.",
  agenda_ocupada: "A agenda está sendo atualizada. Tente novamente em instantes.",
  agendamento_invalido: "Agendamento não encontrado.",
  reserva_expirada: "Esta reserva já expirou.",
  dados_invalidos: "Dados inválidos. Verifique e tente novamente.",
  valor_invalido: "Informe um valor válido.",
  forma_pagamento_invalida: "Forma de pagamento inválida.",
  servico_inativo: "Este serviço está inativo.",
  horarios_invalidos: "Horários de funcionamento inválidos.",
  usuario_invalido: "Usuário inválido.",
  senha_invalida: "A senha deve ter entre 8 e 40 caracteres.",
  senha_padrao: "A nova senha não pode ser \"admin\".",
  senha_atual_incorreta: "Senha atual incorreta.",
  configuracao_ausente: "Configuração não encontrada.",
  operacao_invalida: "Operação não suportada. Atualize a página e tente novamente.",
};

const invoke = async (name, payload = {}) => {
  const privateFunctions = ["adminConfig", "adminData", "criarManutencao"];
  try {
    return await client.functions.invoke(name, privateFunctions.includes(name) ? {...payload, token:tokenAdmin()} : payload);
  } catch (e) {
    const code = e?.response?.data?.error;
    if (code) throw new Error(MENSAGENS_ERRO[code] || code);
    throw e;
  }
};
// "Tempo real" via verificação periódica: busca registros alterados desde a última checagem
const criarSubscribe = (entidade, callback, intervaloMs = 15000) => {
  let parado = false;
  let marca = new Date().toISOString();
  const ciclo = async () => {
    if (parado) return;
    try {
      const response = await invoke("adminData", {entidade, metodo: "filter", args: [{ updated_date: { $gte: marca } }]});
      if (parado || !response.data?.ok) return;
      const alterados = Array.isArray(response.data.result) ? response.data.result : [];
      if (alterados.length) {
        for (const rec of alterados) callback({ type: "update", data: rec });
        marca = alterados.reduce((m, r) => (r.updated_date > m ? r.updated_date : m), marca);
      }
    } catch { /* falha pontual de rede: tenta no próximo ciclo */ }
  };
  const timer = setInterval(ciclo, intervaloMs);
  return () => { parado = true; clearInterval(timer); };
};

export const base44 = Object.assign(Object.create(client), {
  functions: { ...client.functions, invoke },
  entities: new Proxy({}, { get: (_, entidade) => new Proxy({}, {get: (_, metodo) => {
    if (metodo === "subscribe") return (callback) => criarSubscribe(entidade, callback);
    return async (...args) => {
      const response = await invoke("adminData", {entidade, metodo, args});
      if (!response.data?.ok) throw new Error(response.data?.error || "Não foi possível concluir a operação");
      return response.data.result;
    };
  }}) }),
});