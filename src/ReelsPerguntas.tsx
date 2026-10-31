import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels "N perguntas", 22 s a 30 fps: gancho (0–60) | 4 perguntas de 120 quadros (60–540) | chamada (540–660).
// Visual diferente do ReelsErros: ponto de interrogação gigante, pergunta em balão, resposta em faixa "POR QUE IMPORTA".
export const PERGUNTAS_FPS = 30;
export const PERGUNTAS_DURACAO = 660;
const BATIDA = 15;

export type Pergunta = { pergunta: string; porque: string };

export type ReelsPerguntasProps = {
  gancho: [string, string, string]; // a última linha fica em amarelo
  kicker: string;
  perguntas: Pergunta[]; // 4
  convite: string;
  cta: string;
  salve: string;
  arroba: string;
  trilha: string | null;
};

export const reelsPerguntasPadrao: ReelsPerguntasProps = {
  gancho: ["4 perguntas", "antes de contratar", "uma agência"],
  kicker: "ANTES DE ASSINAR",
  perguntas: [
    { pergunta: "Vocês já atenderam um negócio como o meu?", porque: "Quem conhece o seu mercado erra menos e chega antes no resultado." },
    { pergunta: "O que exatamente está incluso?", porque: "Quantos posts, quais redes, quem escreve. Combinado claro evita surpresa." },
    { pergunta: "Como vamos medir o resultado?", porque: "Alcance, mensagens, vendas. Sem número combinado, ninguém sabe se funcionou." },
    { pergunta: "Quem vai falar comigo no dia a dia?", porque: "Você precisa saber com quem conversar quando surgir uma dúvida." },
  ],
  convite: "Faça as 4 para nós também. A resposta vem com um café.",
  cta: "Chame no WhatsApp",
  salve: "Salve para a sua próxima reunião",
  arroba: "@cafeecriar",
  trilha: null,
};

// Ponto de interrogação gigante que gira devagar e pulsa no tempo.
const Interrogacao: React.FC<{ cor: string; x: number; y: number; tam: number; giro?: number }> = ({ cor, x, y, tam, giro = 1 }) => {
  const f = useCurrentFrame();
  const pulsa = Math.exp(-(f % (BATIDA * 2)) / 6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: fontes.titulo,
        fontWeight: 800,
        fontSize: tam,
        lineHeight: 1,
        color: cor,
        transform: `rotate(${giro * (12 + Math.sin(f / 14) * 6)}deg) scale(${1 + pulsa * 0.04})`,
      }}
    >
      ?
    </div>
  );
};

// 1. Gancho (0–60): texto inteiro no quadro 0, fundo off-white com "?" amarelo.
const Gancho: React.FC<ReelsPerguntasProps> = ({ gancho, kicker }) => {
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 116, lineHeight: 0.98, color: cores.tinta };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <Interrogacao cor={cores.amarelo} x={430} y={40} tam={1100} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 80px 300px", gap: 6 }}>
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: cores.preto,
            color: cores.amareloVivo,
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: 38,
            letterSpacing: "0.16em",
            padding: "12px 28px",
            borderRadius: 999,
            marginBottom: 26,
          }}
        >
          {kicker}
        </div>
        <div style={titulo}>{gancho[0]}</div>
        <div style={titulo}>{gancho[1]}</div>
        <div style={{ ...titulo, alignSelf: "flex-start", backgroundColor: cores.preto, color: cores.amareloVivo, padding: "4px 22px 10px", borderRadius: 16, marginTop: 8 }}>
          {gancho[2]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2–5. Cada pergunta (120 quadros): número desliza, pergunta num balão, faixa com o porquê.
const CenaPergunta: React.FC<{ n: number; total: number; p: Pergunta; claro: boolean }> = ({ n, total, p, claro }) => {
  const f = useCurrentFrame();
  const fundo = claro ? cores.amareloVivo : cores.preto;
  const texto = claro ? cores.preto : cores.branco;
  const entra = prog(f, 0, 12);
  const balao = prog(f, 4, 14);
  const faixa = prog(f, 48, 12);
  return (
    <AbsoluteFill style={{ backgroundColor: fundo, clipPath: `circle(${interpolate(entra, [0, 1], [0, 2100])}px at ${n % 2 ? 900 : 180}px 300px)` }}>
      <Interrogacao cor={claro ? "rgba(0,0,0,.08)" : "rgba(255,228,0,.10)"} x={n % 2 ? -80 : 420} y={760} tam={1000} giro={n % 2 ? -1 : 1} />
      <div style={{ position: "absolute", top: 120, left: 90, right: 90, display: "flex", gap: 18 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 14, borderRadius: 99, backgroundColor: claro ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.18)", overflow: "hidden" }}>
            <div style={{ height: "100%", backgroundColor: claro ? cores.preto : cores.amareloVivo, width: `${i < n - 1 ? 100 : i === n - 1 ? prog(f, 0, 110) * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 220,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: "0.18em",
          color: claro ? cores.preto : cores.amareloVivo,
          transform: `translateX(${(1 - entra) * -200}px)`,
        }}
      >
        {`PERGUNTA ${n} DE ${total}`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 320,
          backgroundColor: claro ? cores.preto : cores.branco,
          borderRadius: 48,
          padding: "60px 56px 66px",
          transform: `translateY(${(1 - balao) * 120}px) scale(${0.85 + 0.15 * balao}) rotate(${(n % 2 ? -1.5 : 1.5) + Math.sin(f / 12) * 0.6}deg)`,
          opacity: balao,
          boxShadow: "0 30px 70px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.02, color: claro ? cores.amareloVivo : cores.tinta }}>“{p.pergunta}”</div>
        <div
          style={{
            position: "absolute",
            bottom: -46,
            [n % 2 ? "left" : "right"]: 120,
            width: 0,
            height: 0,
            borderLeft: "40px solid transparent",
            borderRight: "40px solid transparent",
            borderTop: `50px solid ${claro ? cores.preto : cores.branco}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 250,
          transform: `translateX(${(1 - faixa) * 1100}px)`,
        }}
      >
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.16em", color: claro ? cores.preto : cores.amareloVivo, marginBottom: 14 }}>POR QUE IMPORTA</div>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 52, lineHeight: 1.3, color: texto }}>{p.porque}</div>
      </div>
    </AbsoluteFill>
  );
};

// 6. Chamada (540–660)
const Chamada: React.FC<ReelsPerguntasProps> = ({ convite, cta, salve, arroba }) => {
  const f = useCurrentFrame();
  const brilho = Math.exp(-(f % BATIDA) / 4);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 54, padding: "0 80px 160px" }}>
      <Interrogacao cor="rgba(255,228,0,.08)" x={300} y={300} tam={1300} />
      <Pop em={0} de={0.8}>
        <Img src={staticFile("logo-full.png")} style={{ width: 860 }} />
      </Pop>
      <Revela em={8} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: cores.branco, textAlign: "center" }}>
        {convite}
      </Revela>
      <Pop
        em={16}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          backgroundColor: cores.amareloVivo,
          color: cores.preto,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 58,
          padding: "34px 70px",
          borderRadius: 999,
          boxShadow: `0 0 ${30 + brilho * 50}px rgba(255,228,0,${0.35 + brilho * 0.35})`,
        }}
      >
        <Icone icone={faWhatsapp} tamanho={70} cor={cores.preto} />
        {cta}
      </Pop>
      <Pop em={30} style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, color: cores.branco }}>
        <Icone icone={faBookmark} tamanho={40} cor={cores.amareloVivo} />
        {salve}
      </Pop>
      <Revela em={36} style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 42, color: cores.amareloVivo }}>
        {arroba}
      </Revela>
    </AbsoluteFill>
  );
};

export const ReelsPerguntas: React.FC<ReelsPerguntasProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    {props.trilha && <Audio src={staticFile(props.trilha)} />}
    <Sequence durationInFrames={60}>
      <Gancho {...props} />
    </Sequence>
    {props.perguntas.map((p, i) => (
      <Sequence key={i} from={60 + i * 120} durationInFrames={120}>
        <CenaPergunta n={i + 1} total={props.perguntas.length} p={p} claro={i % 2 === 1} />
      </Sequence>
    ))}
    <Sequence from={60 + props.perguntas.length * 120}>
      <Chamada {...props} />
    </Sequence>
  </AbsoluteFill>
);
