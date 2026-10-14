// Tokens da marca Café e Criar (espelho de /mnt/project-files/design-system/tokens.css)
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fontes empacotadas em public/fontes (render funciona offline e igual em qualquer máquina).
const carregar = (familia: string, arquivo: string, peso: string) =>
  loadFont({ family: familia, url: staticFile(`fontes/${arquivo}.woff2`), weight: peso, format: "woff2" });

["600", "700", "800"].forEach((p) => carregar("Baloo 2", `Baloo2-${p}`, p));
["400", "500", "600"].forEach((p) => carregar("Poppins", `Poppins-${p}`, p));
carregar("Yellowtail", "Yellowtail-400", "400");

export const fontes = {
  titulo: "'Baloo 2', Poppins, sans-serif",
  texto: "Poppins, sans-serif",
  script: "Yellowtail, cursive",
};

export const cores = {
  amareloVivo: "#FFE400", // sobre preto
  amarelo: "#D9B607", // sobre claro
  ouro: "#A78C09",
  preto: "#000000",
  tinta: "#111111",
  branco: "#FFFFFF",
  offWhite: "#F3F2EC",
  cinza700: "#3A3A3A",
  cinza500: "#6B6B6B",
  borda: "#E6E3D8",
};
