import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Titulo } from "./FeedPost";

export type ReelsProps = {
  kicker: string;
  titulo: string;
  destaque: string;
  itens: string[];
  kickerItens?: string;
  cta: string;
  aviso?: string; // linha de urgência opcional acima do CTA
  convite: string;
  arroba: string;
};

export const reelsPadrao: ReelsProps = {
  kicker: "QUEM SOMOS",
  titulo: "Tire seu negócio do papel",
  destaque: "do papel",
  itens: ["Logomarca e identidade visual", "Sites e loja virtual", "Artes para redes sociais"],
  cta: "Comece Aqui",
  convite: "Venha tomar um café conosco.",
  arroba: "@cafeecriar",
};

export const FPS = 30;
export const DURACAO = 9 * FPS;

// Movimento da marca: fade + slide-up suave, 300ms, sem bounce.
const ease = Easing.bezier(0.4, 0, 0.2, 1);
const useEntrada = (inicio: number, dur = 9) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [inicio, inicio + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { opacity: p, transform: `translateY(${(1 - p) * 40}px)` };
};
const Entra: React.FC<{ em: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ em, children, style }) => (
  <div style={{ ...style, ...useEntrada(em) }}>{children}</div>
);

const Cena1: React.FC<ReelsProps> = ({ kicker, titulo, destaque }) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto, padding: "0 90px", justifyContent: "center" }}>
    <Entra em={4} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em", color: cores.amareloVivo, marginBottom: 36 }}>
      {kicker}
    </Entra>
    <Entra em={10}>
      <Titulo
        titulo={titulo}
        destaque={destaque}
        cor={cores.amareloVivo}
        style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 150, lineHeight: 1, color: cores.branco }}
      />
    </Entra>
  </AbsoluteFill>
);

const Cena2: React.FC<ReelsProps> = ({ itens, kickerItens = "O QUE OFERECEMOS" }) => (
  <AbsoluteFill style={{ backgroundColor: cores.offWhite, padding: "0 80px", justifyContent: "center", gap: 40 }}>
    <Entra em={0} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em", color: cores.ouro }}>
      {kickerItens}
    </Entra>
    {itens.map((item, i) => (
      <Entra
        key={item}
        em={8 + i * 10}
        style={{
          backgroundColor: cores.branco,
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          padding: "52px 56px",
          fontFamily: fontes.titulo,
          fontWeight: 700,
          fontSize: 68,
          lineHeight: 1.1,
          color: cores.tinta,
          display: "flex",
          alignItems: "center",
          gap: 36,
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: 999, backgroundColor: cores.amarelo, flexShrink: 0 }} />
        {item}
      </Entra>
    ))}
  </AbsoluteFill>
);

const Cena3: React.FC<ReelsProps> = ({ cta, convite, aviso, arroba }) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 64, padding: "0 80px" }}>
    <Entra em={0}>
      <Img src={staticFile("logo-full.png")} style={{ width: 860 }} />
    </Entra>
    <Entra em={8} style={{ fontFamily: fontes.texto, fontSize: 52, lineHeight: 1.4, color: cores.branco, textAlign: "center" }}>
      {convite}
    </Entra>
    {aviso && (
      <Entra em={11} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.12em", color: cores.amareloVivo, textAlign: "center" }}>
        {aviso}
      </Entra>
    )}
    <Entra
      em={14}
      style={{
        backgroundColor: cores.amareloVivo,
        color: cores.preto,
        fontFamily: fontes.texto,
        fontWeight: 600,
        fontSize: 56,
        padding: "34px 84px",
        borderRadius: 999,
        boxShadow: "0 6px 18px rgba(255,228,0,.35)",
      }}
    >
      {cta}
    </Entra>
    <Entra em={18} style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, color: cores.amareloVivo }}>
      {arroba}
    </Entra>
  </AbsoluteFill>
);

// Reels 9:16 (1080×1920), 9s: abertura → serviços → CTA com logo.
export const Reels: React.FC<ReelsProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    <Sequence durationInFrames={3 * FPS}>
      <Cena1 {...props} />
    </Sequence>
    <Sequence from={3 * FPS} durationInFrames={3 * FPS}>
      <Cena2 {...props} />
    </Sequence>
    <Sequence from={6 * FPS}>
      <Cena3 {...props} />
    </Sequence>
  </AbsoluteFill>
);
