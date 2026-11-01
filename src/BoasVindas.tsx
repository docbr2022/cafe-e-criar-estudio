import {
  AbsoluteFill,
  Audio,
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
import { BATIDA, Grao, Graos, Pop, prog, pulso, Revela } from "./ReelsOferta";

// Reels de boas-vindas a cliente novo, 15 s a 30 fps, no tempo de scripts/trilha_boas_vindas.py
// (120 BPM: 1 batida = 15 quadros; drop em 120, brinde em 240, encerramento em 360).
export const BOAS_VINDAS_FPS = 30;
export const BOAS_VINDAS_DURACAO = 450;

export type BoasVindasProps = {
  cliente: string; // nome como deve aparecer no vídeo
  logo: string | null; // arquivo em public/ (ex.: "clientes/padaria.png") ou URL; null usa as iniciais
  logoRedondo: boolean; // true quando o logo já é um selo redondo: ele preenche o círculo inteiro
  segmento: string; // linha pequena acima do nome (ex.: "CONFEITARIA ARTESANAL"); "" esconde
  arrobaCliente: string | null;
  gancho: [string, string, string]; // a última linha fica em amarelo
  suspense: [string, string];
  brinde: [string, string];
  promessas: [string, string, string];
  saudacao: string; // "Seja bem-vindo," / "Seja bem-vinda,"
  convite: string;
  arroba: string;
  trilha: string | null;
};

export const boasVindasPadrao: BoasVindasProps = {
  cliente: "Nome do Cliente",
  logo: null,
  logoRedondo: false,
  segmento: "SEGMENTO DO CLIENTE",
  arrobaCliente: "@cliente",
  gancho: ["Tem gente", "nova no", "café."],
  suspense: ["Adivinha", "quem chegou?"],
  brinde: ["A partir de hoje,", "o café é a dois."],
  promessas: ["Estratégia.", "Conteúdo.", "Resultado."],
  saudacao: "Seja bem-vindo,",
  convite: "Que essa parceria renda muitos cafés.",
  arroba: "@cafeecriar",
  trilha: "audio/trilha-boas-vindas.wav",
};

const fonteLogo = (logo: string) => (/^https?:\/\//.test(logo) ? logo : staticFile(logo));

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÁ-Ú]/.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

// Tamanho do nome conforme o comprimento, para caber em até duas linhas.
const tamanhoNome = (nome: string) => (nome.length <= 10 ? 170 : nome.length <= 16 ? 130 : nome.length <= 24 ? 108 : 88);

// Selo redondo com o logo do cliente (ou as iniciais enquanto não temos o logo).
const SeloCliente: React.FC<{ cliente: string; logo: string | null; redondo?: boolean; tamanho: number; brilho?: number }> = ({ cliente, logo, redondo, tamanho, brilho = 0 }) => (
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
      boxShadow: `0 0 0 ${tamanho * 0.025}px ${cores.amareloVivo}, 0 0 ${40 + brilho * 80}px rgba(255,228,0,${0.3 + brilho * 0.4})`,
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

// Xícara desenhada, com nível de café e vapor animáveis.
const Xicara: React.FC<{ tamanho: number; contorno: string; cafe: string; nivel: number; vapor: number; fundo?: string; children?: React.ReactNode }> = ({
  tamanho,
  contorno,
  cafe,
  nivel,
  vapor,
  fundo = "transparent",
  children,
}) => {
  const f = useCurrentFrame();
  const corpo = "M30 70 H160 V140 Q160 200 100 200 H90 Q30 200 30 140 Z";
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho * 1.1 }}>
      <svg viewBox="0 0 220 242" width={tamanho} height={tamanho * 1.1}>
        <defs>
          <clipPath id="corpo-xicara">
            <path d={corpo} />
          </clipPath>
        </defs>
        {[60, 95, 130].map((x, i) => (
          <path
            key={x}
            d={`M${x} 55 C ${x - 14} 40, ${x + 14} 28, ${x} 12 C ${x - 14} -2, ${x + 10} -14, ${x} -24`}
            transform="translate(0 30)"
            stroke={contorno}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            opacity={vapor * (0.55 + 0.45 * Math.sin(f / 5 + i * 2))}
            strokeDasharray="120"
            strokeDashoffset={120 * (1 - vapor) + ((f * 2 + i * 30) % 40) - 20}
          />
        ))}
        <path d={corpo} fill={fundo} />
        <rect x="20" y={200 - 130 * nivel} width="150" height="140" fill={cafe} clipPath="url(#corpo-xicara)" />
        <path d={corpo} fill="none" stroke={contorno} strokeWidth={12} strokeLinejoin="round" />
        <path d="M160 92 h14 a26 26 0 0 1 0 52 h-14" fill="none" stroke={contorno} strokeWidth={12} strokeLinecap="round" />
        <rect x="14" y="214" width="162" height="12" rx="6" fill={contorno} />
      </svg>
      {children && (
        <div style={{ position: "absolute", left: tamanho * 0.14, top: tamanho * 0.38, width: tamanho * 0.58, height: tamanho * 0.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {children}
        </div>
      )}
    </div>
  );
};

// Explosão de grãos e confete a partir de um ponto.
const Explosao: React.FC<{ x: number; y: number; qtd: number; forca: number; seed: string }> = ({ x, y, qtd, forca, seed }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: qtd }).map((_, i) => {
        const ang = random(`${seed}a${i}`) * Math.PI * 2;
        const vel = forca * (0.45 + random(`${seed}v${i}`) * 0.55);
        const dist = vel * (1 - Math.exp(-f / 9));
        const px = x + Math.cos(ang) * dist;
        const py = y + Math.sin(ang) * dist + 0.35 * f * f * 0.5;
        const tam = 22 + random(`${seed}t${i}`) * 34;
        const op = interpolate(f, [0, 2, 40, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" });
        if (i % 3 === 0) {
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
              <Grao x={px - tam / 2} y={py - tam / 2} tam={tam} rot={ang * 57 + f * 9} cor={cores.ouro} />
            </div>
          );
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - tam / 3,
              top: py - tam / 3,
              width: (tam * 2) / 3,
              height: i % 3 === 1 ? (tam * 2) / 3 : tam / 4,
              borderRadius: i % 3 === 1 ? 999 : 4,
              backgroundColor: i % 2 ? cores.amareloVivo : cores.branco,
              transform: `rotate(${ang * 57 + f * 12}deg)`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};

const kicker: React.CSSProperties = { fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em" };

const Digita: React.FC<{ texto: string; em: number; dur?: number; style?: React.CSSProperties }> = ({ texto, em, dur = 12, style }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [em, em + dur], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return <div style={{ ...style, minHeight: "1.4em" }}>{texto.slice(0, n)}</div>;
};

// 1. Gancho (0–60): intro leve da trilha.
const Gancho: React.FC<BoasVindasProps> = ({ gancho }) => {
  const f = useCurrentFrame();
  const faixa = prog(f, 0, 10);
  const recolhe = prog(f, 10, 10);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 176, lineHeight: 0.95, color: cores.branco };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Graos cor={cores.ouro} seed={2} />
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 360 + 1400 * recolhe * faixa,
          height: 24 + 1400 * (1 - recolhe) * faixa,
          backgroundColor: cores.amareloVivo,
          transform: "rotate(7deg)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px", transform: `scale(${1 + pulso(f) * 0.012})` }}>
        <Digita texto="NOVIDADE NA CASA" em={4} style={{ ...kicker, color: cores.amareloVivo, marginBottom: 20 }} />
        <Revela em={8} style={titulo}>
          {gancho[0]}
        </Revela>
        <Revela em={16} style={titulo}>
          {gancho[1]}
        </Revela>
        <Revela em={30} style={{ ...titulo, color: cores.amareloVivo }}>
          {gancho[2]}
        </Revela>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2. Suspense (60–120): a xícara enche enquanto a trilha sobe; íris preta fecha no fim.
const Suspense: React.FC<BoasVindasProps> = ({ suspense }) => {
  const f = useCurrentFrame();
  const raio = interpolate(prog(f, 0, 12), [0, 1], [0, 1500]);
  const nivel = interpolate(f, [8, 54], [0.05, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tremor = interpolate(f, [30, 56], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const iris = interpolate(f, [52, 60], [0, 1300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 140, lineHeight: 1, color: cores.preto };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, clipPath: `circle(${raio}px at 540px 960px)` }}>
        <AbsoluteFill style={{ padding: "0 80px", justifyContent: "center", gap: 60 }}>
          <div>
            <Revela em={6} style={titulo}>
              {suspense[0]}
            </Revela>
            <Revela em={14} style={titulo}>
              {suspense[1]}
            </Revela>
          </div>
          <div style={{ alignSelf: "center", transform: `translate(${Math.sin(f * 2.3) * tremor}px, ${Math.cos(f * 3.1) * tremor * 0.6}px)` }}>
            <Xicara tamanho={560} contorno={cores.preto} cafe={cores.preto} nivel={nivel} vapor={prog(f, 30, 20)} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.preto, clipPath: `circle(${iris}px at 540px 1290px)` }} />
    </AbsoluteFill>
  );
};

// 3. Revelação (120–210): drop da trilha, logo e nome do cliente.
const Revelacao: React.FC<BoasVindasProps> = ({ cliente, logo, logoRedondo, segmento }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 140 } });
  const flash = interpolate(f, [0, 7], [0.85, 0], { extrapolateRight: "clamp" });
  const tam = tamanhoNome(cliente);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 1400,
          top: 720 - 1400,
          width: 2800,
          height: 2800,
          borderRadius: 9999,
          background: `repeating-conic-gradient(from ${f * 0.8}deg, rgba(255,228,0,0.13) 0deg 9deg, transparent 9deg 18deg)`,
          WebkitMaskImage: "radial-gradient(circle, black 15%, transparent 55%)",
          opacity: prog(f, 0, 12),
        }}
      />
      {[0, 7, 14].map((atraso) => {
        const p = prog(f, atraso, 26);
        return (
          <div
            key={atraso}
            style={{
              position: "absolute",
              left: 540 - (330 + p * 500),
              top: 720 - (330 + p * 500),
              width: 2 * (330 + p * 500),
              height: 2 * (330 + p * 500),
              borderRadius: 9999,
              border: `${10 * (1 - p)}px solid ${cores.amareloVivo}`,
              opacity: f < atraso ? 0 : 1 - p,
            }}
          />
        );
      })}
      <Explosao x={540} y={720} qtd={30} forca={720} seed="revela" />
      <div
        style={{
          position: "absolute",
          top: 720 - 300,
          transform: `scale(${0.2 + 0.8 * s + pulso(f) * 0.025}) rotate(${(1 - s) * -25}deg)`,
        }}
      >
        <SeloCliente cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={600} brilho={pulso(f)} />
      </div>
      <div style={{ position: "absolute", top: 1110, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {segmento && <Digita texto={segmento} em={16} dur={14} style={{ ...kicker, color: cores.amareloVivo, marginBottom: 14 }} />}
        <Revela em={10} dur={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: tam, lineHeight: 1, color: cores.branco }}>
          {cliente}
        </Revela>
      </div>
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: flash }} />
    </AbsoluteFill>
  );
};

// 4. Brinde (210–300): duas xícaras se encontram no tempo forte (quadro 240).
const Brinde: React.FC<BoasVindasProps> = ({ cliente, logo, logoRedondo, brinde }) => {
  const f = useCurrentFrame();
  const entra = prog(f, 0, 10);
  const BATE = 30;
  const aproxima = interpolate(f, [4, BATE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const recuo = f >= BATE ? Math.exp(-(f - BATE) / 5) * Math.sin((f - BATE) / 2.2) : 0;
  const afast = 260 * (1 - aproxima) + 14 * recuo;
  const giro = 16 * aproxima - 6 * recuo;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite, transform: `translateX(${(1 - entra) * 100}%)` }}>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: cores.tinta }}>
          {brinde[0]}
        </Revela>
        <Revela em={14} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: cores.amarelo }}>
          {brinde[1]}
        </Revela>
      </div>
      {/* Xícaras com a alça para fora; inclinam até as bordas se tocarem no centro. */}
      <div style={{ position: "absolute", left: 105 - afast, top: 800, transform: `rotate(${giro}deg)`, transformOrigin: "86% 95%" }}>
        <div style={{ transform: "scaleX(-1)" }}>
          <Xicara tamanho={400} contorno={cores.preto} cafe={cores.preto} fundo={cores.preto} nivel={1} vapor={1}>
            <Img src={staticFile("logo-mark.png")} style={{ width: "92%", transform: "scaleX(-1)" }} />
          </Xicara>
        </div>
      </div>
      <div style={{ position: "absolute", left: 575 + afast, top: 800, transform: `rotate(${-giro}deg)`, transformOrigin: "14% 95%" }}>
        <Xicara tamanho={400} contorno={cores.preto} cafe={cores.amareloVivo} fundo={cores.amareloVivo} nivel={1} vapor={1}>
          <SeloCliente cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={180} />
        </Xicara>
      </div>
      {f >= BATE && (
        <>
          {Array.from({ length: 10 }).map((_, i) => {
            const p = prog(f, BATE, 14);
            const ang = (i / 10) * Math.PI * 2;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 540 + Math.cos(ang) * (40 + p * 150) - 6,
                  top: 830 + Math.sin(ang) * (40 + p * 150) - 22,
                  width: 12,
                  height: 44 * (1 - p),
                  borderRadius: 6,
                  backgroundColor: cores.amarelo,
                  transform: `rotate(${(ang * 180) / Math.PI + 90}deg)`,
                }}
              />
            );
          })}
        </>
      )}
      <div style={{ position: "absolute", top: 1380, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 36 }}>
        <Pop em={BATE + 2} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 56, color: cores.tinta }}>
          Café e Criar
        </Pop>
        <Pop em={BATE + 6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, color: cores.amarelo }}>
          +
        </Pop>
        <Pop em={BATE + 10} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: cliente.length > 18 ? 44 : 56, color: cores.tinta, maxWidth: 520, textAlign: "center", lineHeight: 1.05 }}>
          {cliente}
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

// 5. Promessas (300–360): uma palavra por batida, com faixa amarela passando.
const Promessas: React.FC<BoasVindasProps> = ({ promessas }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, justifyContent: "center", padding: "0 90px", gap: 26 }}>
      <Digita texto="O QUE VEM POR AÍ" em={0} dur={10} style={{ ...kicker, color: cores.amareloVivo, marginBottom: 16 }} />
      {promessas.map((p, i) => {
        const em = i * BATIDA;
        const bate = prog(f, em, 7);
        const faixa = prog(f, em + 2, 9);
        const ultima = i === promessas.length - 1;
        return (
          <div key={p} style={{ position: "relative", alignSelf: "flex-start", opacity: f < em ? 0 : 1, transform: `scale(${1.6 - 0.6 * bate}) translateX(${(1 - bate) * -60}px)`, transformOrigin: "left center" }}>
            <div
              style={{
                position: "absolute",
                left: -20,
                right: -20,
                bottom: ultima ? 6 : 18,
                height: ultima ? "84%" : 40,
                backgroundColor: ultima ? cores.amareloVivo : cores.ouro,
                opacity: ultima ? 1 : 0.55,
                transform: `scaleX(${faixa})`,
                transformOrigin: "left",
              }}
            />
            <div style={{ position: "relative", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: ultima ? cores.preto : cores.branco }}>
              {p}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 6. Encerramento (360–450)
const Encerramento: React.FC<BoasVindasProps> = ({ cliente, logo, logoRedondo, saudacao, convite, arroba, arrobaCliente }) => {
  const f = useCurrentFrame();
  const tam = Math.min(tamanhoNome(cliente), 130);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", padding: "0 80px 120px", gap: 40 }}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const p = prog(f, k * BATIDA, 30);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              width: 300 + p * 1200,
              height: 300 + p * 1200,
              borderRadius: 9999,
              border: `4px solid ${cores.ouro}`,
              opacity: f < k * BATIDA ? 0 : (1 - p) * 0.4,
            }}
          />
        );
      })}
      <Pop em={0} de={0.5}>
        <SeloCliente cliente={cliente} logo={logo} redondo={logoRedondo} tamanho={300} brilho={pulso(f) * 0.6} />
      </Pop>
      <div style={{ textAlign: "center" }}>
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 84, color: cores.branco }}>
          {saudacao}
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: tam, lineHeight: 1, color: cores.amareloVivo }}>
          {cliente}
        </Revela>
      </div>
      <Revela em={18} style={{ fontFamily: fontes.texto, fontSize: 48, lineHeight: 1.35, color: cores.branco, textAlign: "center" }}>
        {convite}
      </Revela>
      <Pop em={30} de={0.85}>
        <Img src={staticFile("logo-full.png")} style={{ width: 620 }} />
      </Pop>
      <Pop
        em={38}
        style={{
          backgroundColor: cores.amareloVivo,
          color: cores.preto,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 50,
          padding: "26px 60px",
          borderRadius: 999,
          boxShadow: `0 0 ${30 + pulso(f) * 40}px rgba(255,228,0,${0.3 + pulso(f) * 0.3})`,
        }}
      >
        {arrobaCliente ? `${arroba}  +  ${arrobaCliente}` : arroba}
      </Pop>
    </AbsoluteFill>
  );
};

export const BoasVindas: React.FC<BoasVindasProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    {props.trilha && <Audio src={staticFile(props.trilha)} />}
    <Sequence durationInFrames={60}>
      <Gancho {...props} />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <Suspense {...props} />
    </Sequence>
    <Sequence from={120} durationInFrames={90}>
      <Revelacao {...props} />
    </Sequence>
    <Sequence from={210} durationInFrames={90}>
      <Brinde {...props} />
    </Sequence>
    <Sequence from={300} durationInFrames={60}>
      <Promessas {...props} />
    </Sequence>
    <Sequence from={360}>
      <Encerramento {...props} />
    </Sequence>
  </AbsoluteFill>
);
