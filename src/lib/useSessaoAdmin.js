import { useCallback, useEffect, useState } from "react";
import { getToken, setToken, adminVerificar, adminSair } from "@/lib/adminAuth";
import { aplicarTema, temaSalvo, modoSalvo } from "@/lib/tema";

export function useSessaoAdmin() {
  const [estado, setEstado] = useState({ verificando: true, autenticado: false, usuario: null });

  const verificar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setEstado({ verificando: false, autenticado: false, usuario: null });
      return;
    }
    try {
      const r = await adminVerificar(token);
      if (r.ok && !r.deve_trocar) {
        aplicarTema(r.tema, r.modo);
        setEstado({
          verificando: false,
          autenticado: true,
          usuario: { nome: r.usuario, tema: r.tema, modo: r.modo },
        });
      } else {
        // Token inválido ou senha ainda não trocada: exige login novamente
        setToken("");
        setEstado({ verificando: false, autenticado: false, usuario: null });
      }
    } catch {
      setToken("");
      setEstado({ verificando: false, autenticado: false, usuario: null });
    }
  }, []);

  useEffect(() => {
    aplicarTema(temaSalvo(), modoSalvo());
    verificar();
  }, [verificar]);

  const sair = useCallback(() => {
    const token = getToken();
    if (token) {
      adminSair(token).catch(() => {});
    }
    setToken("");
    window.location.href = "/login";
  }, []);

  return { ...estado, sair, recarregar: verificar };
}