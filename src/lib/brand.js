// Identidade e contatos públicos: referências enviadas e Linktree da Kauane.
export const STUDIO = {
  name: "Kauane Zenie",
  subtitle: "Studio de Beleza",
  specialty: "Extensão de cílios e sobrancelhas",
  instagram: "https://www.instagram.com/kauanezeniestudio/",
  linktree: "https://linktr.ee/kauanezeniestudio",
  whatsapp: "41998047493",
  whatsappLink: "https://wa.me/message/MCUVKVF73VPLE1",
  address: "Rodovia Engenheiro Darci Gomes de Morais, 5699 - Sl 20 - Ipanema",
  city: "Pontal do Paraná - PR, 83255-000",
};

// Corrige apenas os contatos herdados do clone, preservando números personalizados.
export function studioPhone(value) {
  const phone = String(value || "").replace(/\D/g, "");
  const national = phone.startsWith("55") ? phone.slice(2) : phone;
  return !phone || ["4185250785", "41985250785"].includes(national) ? STUDIO.whatsapp : phone;
}

export function studioMessage(value) {
  return String(value || "")
    .replace(/Let[ií]cia Barboza\s*·\s*Nail Designer/gi, "Kauane Zenie · Studio de Beleza")
    .replace(/Let[ií]cia/gi, "Kauane");
}
