import { AbsoluteFill, Img, staticFile } from "remotion";
import { cores, fontes } from "./marca";

export type FeedPostProps = {
  kicker: string;
  titulo: string;
  destaque: string; // trecho do título pintado de amarelo
  texto: string;
  cta: string;
  arroba: string;
};

export const feedPostPadrao: FeedPostProps = {
  kicker: "O QUE OFERECEMOS",
  titulo: "Sua marca pronta para vender mais",
  destaque: "vender mais",
  texto: "Logomarca, site e artes para redes sociais feitos por quem cuida do seu negócio há mais de 10 anos.",
  cta: "Fale conosco",
  arroba: "@cafeecriar",
};

// Pinta o trecho `destaque` do título com a cor de acento.
export const Titulo: React.FC<{ titulo: string; destaque: string; cor: string; style?: React.CSSProperties }> = ({ titulo, destaque, cor, style }) => {
  const i = destaque ? titulo.indexOf(destaque) : -1;
  if (i < 0) return <h1 style={style}>{titulo}</h1>;
  return (
    <h1 style={style}>
      {titulo.slice(0, i)}
      <span style={{ color: cor }}>{destaque}</span>
      {titulo.slice(i + destaque.length)}
    </h1>
  );
};

// Arte de feed 4:5 (1080×1350): faixa preta com logo, faixa off-white com a mensagem.
export const FeedPost: React.FC<FeedPostProps> = ({ kicker, titulo, destaque, texto, cta, arroba }) => (
  <AbsoluteFill style={{ backgroundColor: cores.offWhite, fontFamily: fontes.texto }}>
    <div style={{ height: 300, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("logo-full.png")} style={{ width: 620 }} />
    </div>
    <div style={{ padding: "90px 96px 0", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: cores.ouro }}>{kicker}</div>
      <Titulo
        titulo={titulo}
        destaque={destaque}
        cor={cores.amarelo}
        style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.02, color: cores.tinta }}
      />
      <p style={{ margin: 0, fontSize: 36, lineHeight: 1.55, color: cores.cinza700, maxWidth: 860 }}>{texto}</p>
    </div>
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 90, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div
        style={{
          backgroundColor: cores.amarelo,
          color: cores.preto,
          fontWeight: 600,
          fontSize: 36,
          padding: "26px 58px",
          borderRadius: 999,
          boxShadow: "0 6px 18px rgba(217,182,7,.35)",
        }}
      >
        {cta}
      </div>
      <div style={{ fontSize: 30, fontWeight: 500, color: cores.cinza500 }}>{arroba}</div>
    </div>
  </AbsoluteFill>
);
