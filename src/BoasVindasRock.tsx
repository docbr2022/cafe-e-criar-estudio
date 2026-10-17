import { createContext, useContext } from "react";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores, fontes } from "./marca";

// Reels de boas-vindas "rock", 20 s a 30 fps, no tempo de scripts/trilha_rock.py
// (120 BPM: 1 batida = 15 quadros, 1 compasso = 60). Tema: café + eletricidade + rock clássico.
export const ROCK_FPS = 30;
export const ROCK_DURACAO = 600;
const BATIDA = 15;

export type BoasVindasRockProps = {
  cliente: string;
  logo: string | null; // arquivo em public/ ou URL; null usa as iniciais
  logoRedondo: boolean; // true quando o logo já é um selo redondo
  segmento: string;
  arrobaCliente: string | null;
  saudacao: string;
  abertura: [string, string];
  chegada: string;
  energia: [string, string];
  conexao: [string, string];
  promessas: [string, string, string];
  volume: string;
  convite: string;
  arroba: string;
  trilha: string;
};

export const boasVindasRockPadrao: BoasVindasRockProps = {
  cliente: "Nome do Cliente",
  logo: null,
  logoRedondo: false,
  segmento: "SEGMENTO DO CLIENTE",
  arrobaCliente: "@cliente",
  saudacao: "Seja bem-vindo,",
  abertura: ["Aumenta", "o som."],
  chegada: "TEM GENTE NOVA NA CASA",
  energia: ["Chegou com", "energia."],
  conexao: ["Conectados.", "A partir de hoje, o café é a dois."],
  promessas: ["Estratégia.", "Conteúdo.", "Resultado."],
  volume: "em alto volume.",
  convite: "Que essa parceria renda muitos cafés.",
  arroba: "@cafeecriar",
  trilha: "audio/trilha-rock.wav",
};

// Pancadas da trilha (quadros absolutos) que sacodem a câmera e acendem o flash.
const IMPACTOS = [0, 30, 60, 120, 180, 210, 240, 270, 300, 360, 420, 435, 450, 480, 510, 570];

// ---------- utilidades ----------
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const prog = (f: number, inicio: number, dur: number, easing = suave) =>
  interpolate(f, [inicio, inicio + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const decai = (f: number, t: number, tau = 5) => (f < t ? 0 : Math.exp(-(f - t) / tau));
const ultimoImpacto = (f: number) => IMPACTOS.filter((t) => t <= f).pop() ?? -100;
const QuadroAbsoluto = createContext(0);

const fonteLogo = (logo: string) => (/^https?:\/\//.test(logo) ? logo : staticFile(logo));
const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
const tamanhoNome = (nome: string) => (nome.length <= 10 ? 190 : nome.length <= 14 ? 160 : nome.length <= 20 ? 120 : 92);

// Energia do áudio no quadro atual (0–1): graves e espectro para o equalizador.
const useEspectro = (trilha: string, amostras = 32) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dados = useAudioData(staticFile(trilha));
  if (!dados) return { graves: 0, bandas: new Array(amostras).fill(0) as number[] };
  const bandas = visualizeAudio({ fps, frame: f, audioData: dados, numberOfSamples: amostras, optimizeFor: "speed" });
  const graves = Math.min(1, (bandas[0] + bandas[1] + bandas[2]) / 1.2);
  return { graves, bandas };
};

// ---------- elementos ----------
const Selo: React.FC<{ cliente: string; logo: string | null; redondo: boolean; tamanho: number; brilho?: number; anel?: string }> = ({
  cliente,
  logo,
  redondo,
  tamanho,
  brilho = 0,
  anel = cores.amareloVivo,
}) => (
  <div
    style={{
      width: tamanho,
      height: tamanho,
      borderRadius: 9999,
      backgroundColor: cores.branco,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxShadow: `0 0 0 ${tamanho * 0.03}px ${anel}, 0 0 ${50 + brilho * 120}px rgba(255,228,0,${0.35 + brilho * 0.5})`,
    }}
  >
    {logo ? (
      <Img
        src={fonteLogo(logo)}
        style={redondo ? { width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.04)" } : { width: "70%", height: "70%", objectFit: "contain" }}
      />
    ) : (
      <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: tamanho * 0.4, color: cores.preto, lineHeight: 1 }}>{iniciais(cliente)}</div>
    )}
  </div>
);

// Raio com deslocamento de ponto médio; o desenho muda a cada 2 quadros para "estalar".
const caminhoRaio = (x1: number, y1: number, x2: number, y2: number, seed: string) => {
  let pts: [number, number][] = [
    [x1, y1],
    [x2, y2],
  ];
  let desloc = Math.hypot(x2 - x1, y2 - y1) / 4;
  for (let nivel = 0; nivel < 6; nivel++) {
    const novos: [number, number][] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const o = (random(`${seed}-${nivel}-${i}`) - 0.5) * desloc;
      novos.push([(ax + bx) / 2 + (-(by - ay) / len) * o, (ay + by) / 2 + ((bx - ax) / len) * o], pts[i + 1]);
    }
    pts = novos;
    desloc /= 2;
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
};

const Raios: React.FC<{ descargas: { em: number; de: [number, number]; para: [number, number]; dur?: number }[] }> = ({ descargas }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {descargas.map((d, i) => {
        const dur = d.dur ?? 9;
        const t = f - d.em;
        if (t < 0 || t > dur) return null;
        const pisca = t === 2 || t === 5 ? 0.25 : 1;
        const op = (1 - t / dur) * pisca;
        const p = caminhoRaio(d.de[0], d.de[1], d.para[0], d.para[1], `r${i}-${Math.floor(f / 2)}`);
        return (
          <g key={i} opacity={op}>
            <path d={p} stroke={cores.amareloVivo} strokeWidth={22} fill="none" opacity={0.35} strokeLinejoin="round" style={{ filter: "blur(8px)" }} />
            <path d={p} stroke={cores.amareloVivo} strokeWidth={9} fill="none" strokeLinejoin="round" />
            <path d={p} stroke={cores.branco} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

// Faíscas que saem de um ponto, com rastro e gravidade.
const Faiscas: React.FC<{ x: number; y: number; em: number; qtd?: number; forca?: number; seed: string }> = ({ x, y, em, qtd = 26, forca = 34, seed }) => {
  const f = useCurrentFrame();
  const t = f - em;
  if (t < 0 || t > 40) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {Array.from({ length: qtd }).map((_, i) => {
        const ang = random(`${seed}a${i}`) * Math.PI * 2;
        const v = forca * (0.35 + random(`${seed}v${i}`) * 0.65);
        const pos = (tt: number) => [x + Math.cos(ang) * v * tt * Math.exp(-tt / 30), y + Math.sin(ang) * v * tt * Math.exp(-tt / 30) + 0.6 * tt * tt];
        const [ax, ay] = pos(Math.max(0, t - 2.5));
        const [bx, by] = pos(t);
        return (
          <line
            key={i}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke={i % 3 ? cores.amareloVivo : cores.branco}
            strokeWidth={i % 4 ? 5 : 8}
            strokeLinecap="round"
            opacity={1 - t / 40}
          />
        );
      })}
    </svg>
  );
};

const Halftone: React.FC<{ cor: string; tamanho?: number; deriva?: number; mascara?: string; opacidade?: number }> = ({
  cor,
  tamanho = 30,
  deriva = 0.6,
  mascara = "linear-gradient(to top, black, transparent 65%)",
  opacidade = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle, ${cor} 32%, transparent 34%)`,
        backgroundSize: `${tamanho}px ${tamanho}px`,
        backgroundPosition: `${f * deriva}px ${-f * deriva}px`,
        WebkitMaskImage: mascara,
        opacity: opacidade,
      }}
    />
  );
};

const Feixes: React.FC<{ cor: string; x?: number; y?: number; velocidade?: number; opacidade?: number }> = ({ cor, x = 540, y = 960, velocidade = 0.6, opacidade = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x - 1600,
        top: y - 1600,
        width: 3200,
        height: 3200,
        background: `repeating-conic-gradient(from ${f * velocidade}deg, ${cor} 0deg 8deg, transparent 8deg 18deg)`,
        WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 50%)",
        opacity: opacidade,
      }}
    />
  );
};

const Listras: React.FC<{ cor: string; velocidade?: number; angulo?: number; opacidade?: number }> = ({ cor, velocidade = 4, angulo = -30, opacidade = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(${angulo}deg, ${cor} 0 40px, transparent 40px 110px)`,
        backgroundPosition: `${f * velocidade}px 0`,
        opacity: opacidade,
      }}
    />
  );
};

const Letreiro: React.FC<{ texto: string; top: number; rot: number; sentido: 1 | -1; fundo: string; cor: string; velocidade?: number; tamanho?: number; entra?: number }> = ({
  texto,
  top,
  rot,
  sentido,
  fundo,
  cor,
  velocidade = 10,
  tamanho = 90,
  entra = 0,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, entra, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: -400,
        right: -400,
        top,
        transform: `rotate(${rot}deg) translateX(${(1 - p) * sentido * -1800}px)`,
        backgroundColor: fundo,
        padding: "10px 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ transform: `translateX(${sentido * f * velocidade - 2000}px)`, fontFamily: fontes.titulo, fontWeight: 800, fontSize: tamanho, lineHeight: 1.1, color: cor }}>
        {`${texto}  ★  `.repeat(10)}
      </div>
    </div>
  );
};

// Título com letras caindo uma a uma e eco colorido (separação RGB) nas pancadas.
const Choque: React.FC<{ texto: string; em: number; tamanho: number; cor: string; eco?: string; atraso?: number; style?: React.CSSProperties }> = ({
  texto,
  em,
  tamanho,
  cor,
  eco = cores.amareloVivo,
  atraso = 1.5,
  style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Eco só nas pancadas da trilha que caem depois que o texto entrou (quadro absoluto vem do contexto).
  const absoluto = useContext(QuadroAbsoluto);
  const imp = ultimoImpacto(absoluto);
  const sep = imp >= absoluto - f + em ? decai(absoluto, imp, 4) * 14 : 0;
  const letras = Array.from(texto);
  const camada = (corCamada: string, dx: number, op: number) => (
    <div style={{ position: dx === 0 ? "relative" : "absolute", inset: 0, transform: `translateX(${dx}px)`, opacity: op, whiteSpace: "pre", textAlign: "center" }}>
      {letras.map((l, i) => {
        const s = spring({ frame: f - em - i * atraso, fps, config: { damping: 12, stiffness: 220 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: corCamada,
              transform: `translateY(${(1 - s) * -tamanho * 0.9}px) scale(${0.4 + 0.6 * s})`,
              opacity: f < em + i * atraso ? 0 : 1,
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
  return (
    <div style={{ position: "relative", fontFamily: fontes.titulo, fontWeight: 800, fontSize: tamanho, lineHeight: 1, ...style }}>
      {sep > 0.5 && camada(eco, -sep, 0.85)}
      {sep > 0.5 && camada(cores.branco === cor ? cores.ouro : cores.branco, sep, 0.6)}
      {camada(cor, 0, 1)}
    </div>
  );
};
const Equalizador: React.FC<{ bandas: number[]; altura: number; cor: string; base?: number; espelho?: boolean }> = ({ bandas, altura, cor, base = 1920, espelho }) => {
  const n = bandas.length;
  const largura = 1080 / n;
  return (
    <>
      {bandas.map((v, i) => {
        const h = 16 + Math.min(1, v * 2.4) * altura;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * largura + 4,
              width: largura - 8,
              height: h,
              top: espelho ? 0 : base - h,
              backgroundColor: cor,
              borderRadius: 8,
            }}
          />
        );
      })}
    </>
  );
};

const Kicker: React.FC<{ texto: string; em: number; cor: string; style?: React.CSSProperties }> = ({ texto, em, cor, style }) => {
  const f = useCurrentFrame();
  // Acende como letreiro de neon: pisca antes de firmar.
  const t = f - em;
  const op = t < 0 ? 0 : t < 12 ? (random(`k${texto}${t}`) > 0.45 ? 1 : 0.15) : 1;
  return <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.22em", color: cor, opacity: op, textShadow: `0 0 18px ${cor}`, ...style }}>{texto}</div>;
};

// ---------- cenas ----------
type Cena = BoasVindasRockProps & { espectro: { graves: number; bandas: number[] } };

// 1. Riff sozinho (0–60)
const Intro: React.FC<Cena> = ({ abertura, espectro }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Halftone cor={cores.ouro} tamanho={26} opacidade={0.5 + espectro.graves * 0.4} />
      <Equalizador bandas={espectro.bandas} altura={260} cor={cores.amareloVivo} />
      <Raios
        descargas={[
          { em: 0, de: [880, -40], para: [620, 760], dur: 10 },
          { em: 30, de: [120, -40], para: [420, 900], dur: 10 },
          { em: 45, de: [1120, 500], para: [700, 1100], dur: 8 },
        ]}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
        <Kicker texto="CAFÉ E CRIAR APRESENTA" em={2} cor={cores.amareloVivo} style={{ marginBottom: 30 }} />
        <Choque texto={abertura[0]} em={4} tamanho={220} cor={cores.branco} />
        <Choque texto={abertura[1]} em={30} tamanho={220} cor={cores.amareloVivo} eco={cores.branco} />
      </AbsoluteFill>
      <Faiscas x={620} y={760} em={1} seed="i1" />
      <Faiscas x={420} y={900} em={31} seed="i2" />
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: decai(f, 0, 2) * 0.7 + decai(f, 30, 2) * 0.4 }} />
    </AbsoluteFill>
  );
};

// 2. Banda entra (60–120): fundo amarelo, letreiros cruzando.
const Chegada: React.FC<Cena> = ({ chegada, espectro }) => {
  const f = useCurrentFrame();
  const zoom = 1 + espectro.graves * 0.04;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, overflow: "hidden" }}>
      <Listras cor="rgba(0,0,0,0.08)" velocidade={6} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Letreiro texto={chegada} top={180} rot={-10} sentido={1} fundo={cores.preto} cor={cores.amareloVivo} entra={0} />
        <Letreiro texto={chegada} top={520} rot={-10} sentido={-1} fundo={cores.preto} cor={cores.branco} entra={4} velocidade={13} />
        <Letreiro texto={chegada} top={1240} rot={-10} sentido={1} fundo={cores.preto} cor={cores.branco} entra={8} velocidade={12} />
        <Letreiro texto={chegada} top={1580} rot={-10} sentido={-1} fundo={cores.preto} cor={cores.amareloVivo} entra={12} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            backgroundColor: cores.preto,
            padding: "40px 70px",
            borderRadius: 28,
            transform: `rotate(${-4 + Math.sin(f / 4) * 1.5}deg) scale(${spring({ frame: f - 2, fps: 30, config: { damping: 10, stiffness: 200 } })})`,
            boxShadow: "0 30px 60px rgba(0,0,0,.35)",
          }}
        >
          <Choque texto="Tem gente" em={4} tamanho={150} cor={cores.branco} />
          <Choque texto="nova!" em={15} tamanho={190} cor={cores.amareloVivo} eco={cores.branco} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: decai(f, 0, 2) * 0.8 }} />
    </AbsoluteFill>
  );
};

// 3. Subida (120–180): contagem regressiva e zoom crescente até o flash.
const Subida: React.FC<Cena> = ({ energia, espectro }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 60], [1, 1.35], { easing: Easing.in(Easing.quad) });
  const numeros = [
    { n: "3", em: 15 },
    { n: "2", em: 30 },
    { n: "1", em: 45 },
  ];
  const tremor = interpolate(f, [30, 60], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descargas = Array.from({ length: 8 }).map((_, i) => ({
    em: 28 + i * 4,
    de: [random(`sd${i}`) * 1080, -40] as [number, number],
    para: [200 + random(`sp${i}`) * 680, 700 + random(`sq${i}`) * 600] as [number, number],
    dur: 5,
  }));
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${f * 0.15}deg)` }}>
        <Listras cor="rgba(255,228,0,0.10)" velocidade={4 + f * 0.6} angulo={-60} />
        <Feixes cor="rgba(255,228,0,0.10)" velocidade={1 + f * 0.08} />
      </AbsoluteFill>
      {numeros.map(({ n, em }) => {
        const p = prog(f, em, 14);
        return f >= em && f < em + 15 ? (
          <div
            key={n}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fontes.titulo,
              fontWeight: 800,
              fontSize: 1100,
              color: "transparent",
              WebkitTextStroke: `8px ${cores.amareloVivo}`,
              opacity: 0.5 * (1 - p),
              transform: `scale(${0.6 + p * 0.8})`,
            }}
          >
            {n}
          </div>
        ) : null;
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translate(${Math.sin(f * 2.1) * tremor}px, ${Math.cos(f * 2.7) * tremor}px) scale(${zoom})` }}>
        <Choque texto={energia[0]} em={2} tamanho={140} cor={cores.branco} />
        <Choque texto={energia[1]} em={10} tamanho={200} cor={cores.amareloVivo} eco={cores.branco} />
      </AbsoluteFill>
      <Raios descargas={descargas} />
      <Equalizador bandas={espectro.bandas} altura={200} cor="rgba(255,228,0,0.5)" />
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: interpolate(f, [52, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// 4. Revelação (180–300): prato, raios no selo, nome letra a letra.
const Revelacao: React.FC<Cena> = ({ cliente, logo, logoRedondo, segmento, saudacao, espectro }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 120 } });
  const sobe = prog(f, 60, 14);
  const cy = interpolate(sobe, [0, 1], [760, 560]);
  const tam = interpolate(sobe, [0, 1], [620, 480]);
  const nome = tamanhoNome(cliente);
  const golpes = [0, 30, 60, 90];
  const descargas = golpes.flatMap((g, k) =>
    [0, 1, 2].map((j) => {
      const ang = random(`ang${k}${j}`) * Math.PI * 2;
      return { em: g + j, de: [540 + Math.cos(ang) * 900, cy + Math.sin(ang) * 900] as [number, number], para: [540 + Math.cos(ang) * tam * 0.5, cy + Math.sin(ang) * tam * 0.5] as [number, number], dur: 8 };
    }),
  );
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, overflow: "hidden" }}>
      <Feixes cor={`rgba(255,228,0,${0.16 + espectro.graves * 0.12})`} y={cy} velocidade={0.9} />
      <Halftone cor={cores.ouro} tamanho={24} opacidade={0.45} />
      {golpes.map((g) =>
        [0, 6].map((a) => {
          const p = prog(f, g + a, 24);
          const r = tam * 0.5 + p * 700;
          return (
            <div
              key={`${g}-${a}`}
              style={{
                position: "absolute",
                left: 540 - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: 9999,
                border: `${12 * (1 - p)}px solid ${cores.amareloVivo}`,
                opacity: f < g + a ? 0 : 1 - p,
              }}
            />
          );
        }),
      )}
      <Raios descargas={descargas} />
      <div style={{ position: "absolute", left: 540 - tam / 2, top: cy - tam / 2, transform: `scale(${(3 - 2 * s) * (1 + espectro.graves * 0.05)}) rotate(${(1 - s) * 40}deg)`, opacity: Math.min(1, f / 2) }}>
        <Selo cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={tam} brilho={espectro.graves} />
      </div>
      {golpes.map((g, i) => (
        <Faiscas key={g} x={540} y={cy} em={g} qtd={34} forca={40} seed={`rv${i}`} />
      ))}
      <div style={{ position: "absolute", top: interpolate(sobe, [0, 1], [1130, 860]), left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {segmento && <Kicker texto={segmento} em={14} cor={cores.amareloVivo} style={{ marginBottom: 18, textAlign: "center" }} />}
        <Choque texto={cliente} em={6} tamanho={nome} cor={cores.branco} atraso={1.2} />
      </div>
      <Letreiro texto={`${saudacao.replace(/^seja\s+/i, "").replace(/[,!.]+$/, "")} ${cliente}`.toUpperCase()} top={1330} rot={-8} sentido={1} fundo={cores.amareloVivo} cor={cores.preto} entra={62} tamanho={80} />
      <Letreiro texto={`${cliente.toUpperCase()} NO CAFÉ`} top={1560} rot={6} sentido={-1} fundo={cores.branco} cor={cores.preto} entra={68} tamanho={80} velocidade={12} />
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: decai(f, 0, 3) }} />
    </AbsoluteFill>
  );
};

// Ponto de uma curva de Bézier cúbica.
const bezier = (p: [number, number][], t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
  ];
};

// 5. Conexão (300–420): o cabo sai da Café e Criar e pluga no cliente no tempo forte (360).
const Conexao: React.FC<Cena> = ({ cliente, logo, logoRedondo, conexao, espectro }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LIGA = 60;
  const A: [number, number] = [260, 640];
  const B: [number, number] = [820, 1300];
  const curva: [number, number][] = [A, [760, 520], [260, 1460], B];
  const pts = Array.from({ length: 61 }).map((_, i) => bezier(curva, i / 60));
  const comp = pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const avanco = interpolate(f, [8, LIGA], [0.12, 0.86], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const d = `M${A[0]} ${A[1]} C${curva[1][0]} ${curva[1][1]} ${curva[2][0]} ${curva[2][1]} ${B[0]} ${B[1]}`;
  const ponta = bezier(curva, avanco);
  const antes = bezier(curva, Math.max(0, avanco - 0.01));
  const ang = (Math.atan2(ponta[1] - antes[1], ponta[0] - antes[0]) * 180) / Math.PI;
  const ligado = f >= LIGA;
  const entra = (em: number) => spring({ frame: f - em, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, overflow: "hidden" }}>
      <Halftone cor="rgba(0,0,0,0.16)" tamanho={28} mascara="linear-gradient(to bottom, black, transparent 70%)" />
      <Listras cor="rgba(0,0,0,0.05)" velocidade={3} angulo={30} />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
        <Choque texto={conexao[0]} em={2} tamanho={150} cor={cores.preto} eco={cores.branco} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={d} stroke={cores.preto} strokeWidth={34} fill="none" strokeLinecap="round" strokeDasharray={comp} strokeDashoffset={comp * (1 - avanco)} />
        <path d={d} stroke={cores.ouro} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={comp} strokeDashoffset={comp * (1 - avanco)} opacity={0.8} />
        {ligado &&
          Array.from({ length: 6 }).map((_, k) => {
            const t0 = LIGA + k * (BATIDA / 2);
            const t = ((f - t0) / 22) % 1;
            if (f < t0) return null;
            const [x, y] = bezier(curva, t * 0.86);
            return <circle key={k} cx={x} cy={y} r={20} fill={cores.branco} style={{ filter: "drop-shadow(0 0 12px #FFE400)" }} />;
          })}
        {/* Plugue na ponta do cabo */}
        <g transform={`translate(${ponta[0]} ${ponta[1]}) rotate(${ang})`}>
          <rect x={-70} y={-34} width={80} height={68} rx={14} fill={cores.preto} />
          <rect x={10} y={-24} width={34} height={12} rx={4} fill={cores.branco} />
          <rect x={10} y={12} width={34} height={12} rx={4} fill={cores.branco} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: A[0] - 150, top: A[1] - 150, transform: `scale(${entra(0)})` }}>
        <div style={{ width: 300, height: 300, borderRadius: 9999, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
          <Img src={staticFile("logo-mark.png")} style={{ width: 220 }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: B[0] - 170, top: B[1] - 170, transform: `scale(${entra(6) * (1 + (ligado ? decai(f, LIGA, 6) * 0.15 + espectro.graves * 0.04 : 0))})` }}>
        <Selo cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={340} anel={cores.preto} brilho={ligado ? 0.6 : 0} />
      </div>
      <Raios
        descargas={[0, 15, 30].flatMap((g, k) =>
          [0, 1].map((j) => ({ em: LIGA + g + j * 2, de: [B[0] + (j ? 300 : -320), B[1] + (j ? -380 : 300)] as [number, number], para: [B[0], B[1]] as [number, number], dur: 7 + k })),
        )}
      />
      <Faiscas x={ponta[0]} y={ponta[1]} em={LIGA} qtd={40} forca={44} seed="liga" />
      <div style={{ position: "absolute", top: 1560, left: 80, right: 80, textAlign: "center" }}>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, lineHeight: 1.1, color: cores.preto, opacity: prog(f, LIGA + 4, 10), transform: `translateY(${(1 - prog(f, LIGA + 4, 10)) * 60}px)` }}>
          {conexao[1]}
        </div>
        <div style={{ marginTop: 24, fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.12em", color: cores.preto, opacity: prog(f, LIGA + 14, 10) }}>
          CAFÉ E CRIAR + {cliente.toUpperCase()}
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: decai(f, LIGA, 3) * 0.85 }} />
    </AbsoluteFill>
  );
};

// 6. Paradas (420–480): uma palavra por pancada, fundos alternando; depois a virada.
const Paradas: React.FC<Cena> = ({ promessas, volume }) => {
  const f = useCurrentFrame();
  const cartoes = [
    { em: 0, fundo: cores.preto, cor: cores.branco },
    { em: 15, fundo: cores.amareloVivo, cor: cores.preto },
    { em: 30, fundo: cores.branco, cor: cores.preto },
  ];
  const atual = f < 15 ? 0 : f < 30 ? 1 : 2;
  const c = cartoes[atual];
  const virada = f >= 38;
  const palavras = volume.split(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: virada ? cores.preto : c.fundo, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      {!virada && (
        <>
          <Halftone cor={c.cor === cores.preto ? "rgba(0,0,0,0.12)" : "rgba(255,228,0,0.25)"} tamanho={34} mascara="radial-gradient(circle, transparent 30%, black 75%)" />
          <div style={{ transform: `scale(${1 + decai(f, c.em, 6) * 0.35}) rotate(${(atual - 1) * 4}deg)` }}>
            <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: promessas[atual].length > 10 ? 150 : 175, color: c.cor, position: "relative" }}>
              {atual === 2 && <div style={{ position: "absolute", left: -24, right: -24, top: "18%", bottom: "8%", backgroundColor: cores.amareloVivo, transform: `scaleX(${prog(f, 31, 6)})`, transformOrigin: "left" }} />}
              <span style={{ position: "relative" }}>{promessas[atual]}</span>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 260, fontFamily: fontes.texto, fontWeight: 600, fontSize: 44, letterSpacing: "0.2em", color: c.cor }}>
            {`0${atual + 1} / 03`}
          </div>
        </>
      )}
      {virada && (
        <>
          <Feixes cor="rgba(255,228,0,0.14)" velocidade={3} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 44px", padding: "0 60px" }}>
            {palavras.map((p, i) => {
              const em = 38 + i * 7;
              const s = f >= em ? spring({ frame: f - em, fps: 30, config: { damping: 9, stiffness: 240 } }) : 0;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: fontes.titulo,
                    fontWeight: 800,
                    fontSize: 170,
                    lineHeight: 1,
                    color: i === palavras.length - 1 ? cores.amareloVivo : cores.branco,
                    transform: `scale(${s}) rotate(${(1 - s) * (i % 2 ? 20 : -20)}deg)`,
                    display: "inline-block",
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>
        </>
      )}
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: (decai(f, 0, 2) + decai(f, 15, 2) + decai(f, 30, 2)) * 0.5 }} />
    </AbsoluteFill>
  );
};

// 7. Final (480–600): saudação, logos e assinatura; rufo e pancada final em 570.
const Final: React.FC<Cena> = ({ cliente, logo, logoRedondo, saudacao, convite, arroba, arrobaCliente, espectro }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FIM = 90;
  const rufo = interpolate(f, [60, FIM], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (f < FIM ? 1 : 0);
  const nome = Math.min(tamanhoNome(cliente), 150);
  const s = (em: number) => spring({ frame: f - em, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, overflow: "hidden" }}>
      <Feixes cor={`rgba(255,228,0,${0.12 + espectro.graves * 0.1})`} y={420} velocidade={0.7} />
      <Halftone cor={cores.ouro} tamanho={24} opacidade={0.5} />
      <Equalizador bandas={espectro.bandas} altura={240} cor="rgba(255,228,0,0.85)" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220, gap: 34, transform: `translate(${Math.sin(f * 2.3) * rufo}px, ${Math.cos(f * 3.1) * rufo}px) scale(${1 + decai(f, FIM, 6) * 0.06})` }}>
        <div style={{ transform: `scale(${s(0) * (1 + espectro.graves * 0.05)})` }}>
          <Selo cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={340} brilho={espectro.graves} />
        </div>
        <div style={{ textAlign: "center" }}>
          <Choque texto={saudacao} em={6} tamanho={92} cor={cores.branco} atraso={0.8} />
          <Choque texto={cliente} em={14} tamanho={nome} cor={cores.amareloVivo} eco={cores.branco} atraso={1} style={{ textShadow: "0 0 40px rgba(255,228,0,.45)" }} />
        </div>
        <div style={{ fontFamily: fontes.texto, fontSize: 46, lineHeight: 1.35, color: cores.branco, textAlign: "center", padding: "0 90px", opacity: prog(f, 26, 10), transform: `translateY(${(1 - prog(f, 26, 10)) * 40}px)` }}>
          {convite}
        </div>
        <div style={{ transform: `scale(${s(36)})` }}>
          <Img src={staticFile("logo-full.png")} style={{ width: 560 }} />
        </div>
        <div
          style={{
            transform: `scale(${s(44)})`,
            backgroundColor: cores.amareloVivo,
            color: cores.preto,
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: 48,
            padding: "24px 56px",
            borderRadius: 999,
            boxShadow: `0 0 ${30 + espectro.graves * 60}px rgba(255,228,0,${0.35 + espectro.graves * 0.4})`,
          }}
        >
          {arrobaCliente ? `${arroba}  +  ${arrobaCliente}` : arroba}
        </div>
      </AbsoluteFill>
      <Raios
        descargas={[
          { em: FIM, de: [100, -40], para: [400, 380], dur: 12 },
          { em: FIM, de: [980, -40], para: [680, 400], dur: 12 },
          { em: FIM + 2, de: [-40, 900], para: [380, 520], dur: 10 },
          { em: FIM + 2, de: [1120, 900], para: [700, 520], dur: 10 },
        ]}
      />
      <Faiscas x={540} y={390} em={FIM} qtd={44} forca={46} seed="fim" />
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: decai(f, 0, 3) * 0.6 + decai(f, FIM, 4) * 0.9 }} />
    </AbsoluteFill>
  );
};

// Granulação de filme que muda a cada quadro.
const Grao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <filter id="grao-filme">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 50} />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao-filme)" />
    </svg>
  );
};

export const BoasVindasRock: React.FC<BoasVindasRockProps> = (props) => {
  const f = useCurrentFrame();
  const espectro = useEspectro(props.trilha);
  const imp = ultimoImpacto(f);
  const sacode = decai(f, imp, 4) * 22;
  const cena = { ...props, espectro };
  return (
    <QuadroAbsoluto.Provider value={f}>
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Audio src={staticFile(props.trilha)} />
      <AbsoluteFill
        style={{
          transform: `translate(${(random(`sx${f}`) - 0.5) * sacode}px, ${(random(`sy${f}`) - 0.5) * sacode}px) scale(${1 + decai(f, imp, 5) * 0.03})`,
        }}
      >
        <Sequence durationInFrames={60}>
          <Intro {...cena} />
        </Sequence>
        <Sequence from={60} durationInFrames={60}>
          <Chegada {...cena} />
        </Sequence>
        <Sequence from={120} durationInFrames={60}>
          <Subida {...cena} />
        </Sequence>
        <Sequence from={180} durationInFrames={120}>
          <Revelacao {...cena} />
        </Sequence>
        <Sequence from={300} durationInFrames={120}>
          <Conexao {...cena} />
        </Sequence>
        <Sequence from={420} durationInFrames={60}>
          <Paradas {...cena} />
        </Sequence>
        <Sequence from={480}>
          <Final {...cena} />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      <Grao />
    </AbsoluteFill>
    </QuadroAbsoluto.Provider>
  );
};
