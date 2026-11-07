import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "./marca";
import { Icone } from "./ReelsOferta";

// Reels "cupom fiscal", 15 s a 30 fps. Conceito próprio: um cupom sai da impressora linha a linha,
// soma as entregas do plano, recebe um carimbo e vira a chamada. Paleta de tema (azul) e logo recolorida.
// Abertura (0–60) | impressão (60–300) | carimbo (300–360) | chamada (360–450).
export const CUPOM_FPS = 30;
export const CUPOM_DURACAO = 450;

loadFont({ family: "JetBrains Mono", url: staticFile("fontes/JetBrainsMono-Regular.ttf"), weight: "400" });
loadFont({ family: "JetBrains Mono", url: staticFile("fontes/JetBrainsMono-Bold.ttf"), weight: "700" });
const mono = "'JetBrains Mono', monospace";

export type Tema = { fundo: string; fundoEscuro: string; destaque: string; texto: string; logo: string };
export const temas: Record<string, Tema> = {
  azul: { fundo: "#1F4FE0", fundoEscuro: "#0B2A8A", destaque: "#FFE400", texto: "#FFFFFF", logo: "#FFFFFF" },
  roxo: { fundo: "#6A3BD6", fundoEscuro: "#2E1470", destaque: "#FFE400", texto: "#FFFFFF", logo: "#FFFFFF" },
  verde: { fundo: "#0F9D58", fundoEscuro: "#06502C", destaque: "#FFE400", texto: "#FFFFFF", logo: "#FFFFFF" },
  preto: { fundo: "#000000", fundoEscuro: "#111111", destaque: "#FFE400", texto: "#FFFFFF", logo: "#FFE400" },
};

export type ReelsCupomProps = {
  tema: keyof typeof temas;
  riscado: string;
  frase: [string, string];
  loja: string;
  linhaData: string;
  itens: string[];
  totalRotulo: string;
  preco: number;
  periodo: string;
  carimbo: [string, string];
  convite: string;
  cta: string;
  arroba: string;
};

export const reelsCupomPadrao: ReelsCupomProps = {
  tema: "azul",
  riscado: "Black Friday?",
  frase: ["Aqui não precisa", "esperar."],
  loja: "CAFÉ E CRIAR MARKETING DESIGN",
  linhaData: "PEDIDO SEM FILA • SEM CUPOM",
  itens: ["Diagnóstico do seu negócio", "8 artes por mês", "8 legendas por mês", "Calendário editorial", "Suporte no WhatsApp"],
  totalRotulo: "PLANO CAFÉ EXPRESSO",
  preco: 497,
  periodo: "/mês",
  carimbo: ["VALE ATÉ", "31/12"],
  convite: "Venha tomar um café conosco.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

const suave = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

// Logo recolorida: o PNG vira máscara e a cor vem do tema.
export const LogoCor: React.FC<{ arquivo: string; cor: string; largura: number; proporcao: number; style?: React.CSSProperties }> = ({ arquivo, cor, largura, proporcao, style }) => (
  <div
    style={{
      width: largura,
      height: largura / proporcao,
      backgroundColor: cor,
      WebkitMaskImage: `url(${staticFile(arquivo)})`,
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskImage: `url(${staticFile(arquivo)})`,
      maskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      ...style,
    }}
  />
);

// Linhas finas de fundo que descem devagar (papel saindo).
const Trilhos: React.FC<{ cor: string }> = ({ cor }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.12 }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ((i * 160 + f * 6) % 2240) - 160, height: 4, backgroundColor: cor }} />
      ))}
    </AbsoluteFill>
  );
};

const Abertura: React.FC<ReelsCupomProps & { t: Tema }> = ({ riscado, frase, t }) => {
  const f = useCurrentFrame();
  const risco = p(f, 10, 10);
  const sai = p(f, 48, 12);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 132, lineHeight: 1, color: t.texto };
  return (
    <AbsoluteFill style={{ transform: `translateY(${-sai * 700}px)`, opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 360 }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 120, color: t.texto, opacity: 0.6 }}>
          {riscado}
          <div style={{ position: "absolute", left: -10, top: "52%", height: 18, borderRadius: 9, width: `${risco * 104}%`, backgroundColor: t.destaque, transform: "rotate(-3deg)" }} />
        </div>
        <div style={{ ...titulo, marginTop: 40 }}>{frase[0]}</div>
        <div style={{ ...titulo, color: t.destaque }}>{frase[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

const Impressora: React.FC<{ t: Tema; y: number }> = ({ t, y }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: y, height: 90, borderRadius: 30, backgroundColor: t.fundoEscuro, boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 22, height: 12, borderRadius: 6, backgroundColor: "rgba(0,0,0,.55)" }} />
    <div style={{ position: "absolute", right: 40, top: 26, width: 18, height: 18, borderRadius: 9, backgroundColor: t.destaque }} />
  </div>
);

// Cupom: cada linha "imprime" quando o papel já saiu o bastante.
const Cupom: React.FC<ReelsCupomProps & { t: Tema; inicio: number }> = ({ loja, linhaData, itens, totalRotulo, preco, periodo, t, inicio }) => {
  const f = useCurrentFrame();
  const linhas = 4 + itens.length + 5;
  const passo = 16;
  const impressas = Math.max(0, Math.floor((f - inicio) / passo) + 1);
  const linhaAltura = 84;
  const altura = Math.max(110, Math.min(linhas, impressas) * linhaAltura + 60);
  const tremor = f - inicio >= 0 && impressas <= linhas ? Math.sin(f * 2.3) * 1.5 : 0;
  const L = (i: number) => i < impressas;
  const base: React.CSSProperties = { fontFamily: mono, fontSize: 38, color: "#1a1a1a", height: linhaAltura, display: "flex", alignItems: "center" };
  let i = 0;
  const conteudo: React.ReactNode[] = [];
  const add = (no: React.ReactNode) => {
    conteudo.push(<div key={i} style={{ ...base, opacity: L(i) ? 1 : 0 }}>{no}</div>);
    i++;
  };
  add(<div style={{ width: "100%", textAlign: "center", fontWeight: 700, fontSize: 34 }}>{loja}</div>);
  add(<div style={{ width: "100%", textAlign: "center", fontSize: 30, color: "#555" }}>{linhaData}</div>);
  add(<div style={{ width: "100%", borderTop: "4px dashed #999" }} />);
  add(<div style={{ fontWeight: 700 }}>ITEM</div>);
  itens.forEach((it) =>
    add(
      <div style={{ display: "flex", width: "100%", gap: 14, alignItems: "center" }}>
        <span>{it}</span>
        <span style={{ flex: 1, borderBottom: "4px dotted #bbb", transform: "translateY(10px)" }} />
        <span style={{ fontWeight: 700, color: t.fundo }}>OK</span>
      </div>,
    ),
  );
  add(<div style={{ width: "100%", borderTop: "4px dashed #999" }} />);
  add(<div style={{ fontWeight: 700, fontSize: 34 }}>{totalRotulo}</div>);
  add(
    <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, fontSize: 44 }}>TOTAL</span>
      <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, color: t.fundo, lineHeight: 1 }}>
        R$ {preco}
        <span style={{ fontSize: 50 }}>{periodo}</span>
      </span>
    </div>,
  );
  add(<div />);
  add(
    <div style={{ display: "flex", width: "100%", height: 70, gap: 6, justifyContent: "center" }}>
      {Array.from({ length: 46 }).map((_, k) => (
        <div key={k} style={{ width: [3, 6, 3, 9, 3, 4][k % 6], backgroundColor: "#1a1a1a" }} />
      ))}
    </div>,
  );
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top: 0, height: altura, overflow: "hidden", transform: `translateX(${tremor}px)` }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: altura,
          backgroundColor: "#FFFDF6",
          padding: "30px 50px",
          boxShadow: "0 30px 60px rgba(0,0,0,.25)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 96% 98.6%, 92% 100%, 88% 98.6%, 84% 100%, 80% 98.6%, 76% 100%, 72% 98.6%, 68% 100%, 64% 98.6%, 60% 100%, 56% 98.6%, 52% 100%, 48% 98.6%, 44% 100%, 40% 98.6%, 36% 100%, 32% 98.6%, 28% 100%, 24% 98.6%, 20% 100%, 16% 98.6%, 12% 100%, 8% 98.6%, 4% 100%, 0 98.6%)",
        }}
      >
        {conteudo}
      </div>
    </div>
  );
};

const Carimbo: React.FC<{ texto: [string, string]; t: Tema }> = ({ texto, t }) => {
  const f = useCurrentFrame();
  const bate = p(f, 0, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 800,
        transform: `translate(-50%, -50%) rotate(-14deg) scale(${interpolate(bate, [0, 1], [3, 1])})`,
        opacity: bate,
        border: `12px solid ${t.destaque}`,
        backgroundColor: t.fundoEscuro,
        borderRadius: 28,
        padding: "20px 50px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,.35)",
      }}
    >
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 48, letterSpacing: "0.12em", color: t.destaque }}>{texto[0]}</div>
      <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 150, lineHeight: 1, color: t.destaque }}>{texto[1]}</div>
    </div>
  );
};

const Chamada: React.FC<ReelsCupomProps & { t: Tema }> = ({ convite, cta, arroba, t }) => {
  const f = useCurrentFrame();
  const entra = p(f, 0, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, alignItems: "center", justifyContent: "center", gap: 56, clipPath: `circle(${entra * 1400}px at 540px 1100px)`, paddingBottom: 140 }}>
      <LogoCor arquivo="logo-full.png" cor={t.logo} largura={840} proporcao={848 / 224} style={{ transform: `scale(${0.9 + 0.1 * p(f, 4, 14)})` }} />
      <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 76, color: t.texto, textAlign: "center", padding: "0 80px", opacity: p(f, 8, 10) }}>{convite}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          backgroundColor: t.texto,
          color: t.fundo,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 58,
          padding: "34px 70px",
          borderRadius: 999,
          transform: `scale(${p(f, 14, 12)})`,
        }}
      >
        <Icone icone={faWhatsapp} tamanho={70} cor={t.fundo} />
        {cta}
      </div>
      <div style={{ fontFamily: mono, fontSize: 42, color: t.destaque, opacity: p(f, 24, 10) }}>{arroba}</div>
    </AbsoluteFill>
  );
};

export const ReelsCupom: React.FC<ReelsCupomProps> = (props) => {
  const t = temas[props.tema] ?? temas.azul;
  const f = useCurrentFrame();
  // A impressora desce do topo durante a abertura e fica em y=230; o papel sai embaixo dela.
  const yImp = interpolate(f, [44, 72], [1180, 230], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const yImpFinal = yImp + interpolate(f, [355, 375], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      <Trilhos cor={t.texto} />
      <Sequence durationInFrames={60}>
        <Abertura {...props} t={t} />
      </Sequence>
      <Sequence durationInFrames={370}>
        <div style={{ position: "absolute", left: 0, right: 0, top: yImpFinal + 60 }}>
          <Cupom {...props} t={t} inicio={72} />
        </div>
        <Impressora t={t} y={yImpFinal} />
      </Sequence>
      <Sequence from={300} durationInFrames={70}>
        <Carimbo texto={props.carimbo} t={t} />
      </Sequence>
      <Sequence from={360}>
        <Chamada {...props} t={t} />
      </Sequence>
    </AbsoluteFill>
  );
};
