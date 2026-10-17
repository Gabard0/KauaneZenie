import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { comTravaAgenda } from "../../shared/auth.ts";
import { expirarReservasAguardando } from "../../shared/agenda.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const expirados = await comTravaAgenda(svc, () => expirarReservasAguardando(svc));
    return Response.json({ ok: true, expirados });
  } catch (error) {
    return Response.json({ ok: false, error: "erro_interno" }, { status: 500 });
  }
}
