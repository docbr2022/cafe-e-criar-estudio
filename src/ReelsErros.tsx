import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faBookmark, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Graos, Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels "3 erros", 20 s a 30 fps, cortes no mapa de scripts/trilha_rock.py (120 BPM, 1 compasso = 60 quadros):
// 0–2 s gancho (riff) | 2–6 erro 1 | 6–10 erro 2 (refrão) | 10–14 erro 3 | 14–16 paradas | 16–20 chamada.
// O gancho já aparece inteiro no quadro 0: o Reels anterior perdia o público antes dos 3 s.
export const ERROS_FPS = 30;
export const ERROS_DURACAO = 600;
const BATIDA = 15;
const IMPACTOS = [0, 60, 120, 180, 240, 300, 360, 420, 435, 450, 480, 540, 570];

export type Erro = { errado: string; certo: string };

export type ReelsErrosProps = {
  gancho: [string, string, string]; // a última linha fica em amarelo
  kicker: string;
  erros: [Erro, Erro, Erro];
  pergunta: [string, string];
  convite: string;
  cta: string;
  salve: string;
  arroba: string;
  trilha: string | null; // null = sem som (a trilha sintetizada soou artificial)
};

export const reelsErrosPadrao: ReelsErrosProps = {
  gancho: ["3 erros que", "afastam clientes", "do seu Instagram"],
  kicker: "PARE DE PERDER CLIENTE",
  erros: [
    { errado: "Postar só quando sobra tempo", certo: "Calendário fixo: 3 posts por semana" },
    { errado: "Legenda gigante, sem chamada", certo: "Uma ideia, uma ação no final" },
    { errado: "Mandar o cliente para 5 lugares", certo: "Um caminho só: o seu WhatsApp" },
  ],
  pergunta: ["Reconheceu", "algum?"],
  convite: "A gente arruma isso com um café.",
  cta: "Chame no WhatsApp",
  salve: "Salve para revisar seu perfil",
  arroba: "@cafeecriar",
  trilha: null,
};

const decai = (f: number, t: number, tau = 5) => (f < t ? 0 : Math.exp(-(f - t) / tau));
const ultimo = (f: number) => IMPACTOS.filter((t) => t <= f).pop() ?? -100;

// Faixas diagonais que correm sem parar ao fundo.
const Listras: React.FC<{ cor: string; opacidade: number; velocidade?: number }> = ({ cor, opacidade, velocidade = 6 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: opacidade }}>
      <div
        style={{
          position: "absolute",
          inset: -800,
          transform: `rotate(-24deg) translateX(${(f * velocidade) % 240}px)`,
          backgroundImage: `repeating-linear-gradient(90deg, ${cor} 0 60px, transparent 60px 240px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Letreiro: React.FC<{ texto: string; top: number; rot: number; sentido: 1 | -1; fundo: string; cor: string }> = ({ texto, top, rot, sentido, fundo, cor }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: -300, right: -300, top, transform: `rotate(${rot}deg)`, backgroundColor: fundo, padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ transform: `translateX(${sentido * (f * 10) - 1400}px)`, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 60, color: cor }}>{texto.repeat(10)}</div>
    </div>
  );
};

// Barra de progresso "1/3, 2/3, 3/3" no topo, para segurar quem quer ver o fim da lista.
const Progresso: React.FC<{ atual: number }> = ({ atual }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 120, left: 90, right: 90, display: "flex", gap: 18 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, height: 14, borderRadius: 99, backgroundColor: "rgba(255,255,255,.18)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              backgroundColor: cores.amareloVivo,
              width: `${i < atual ? 100 : i === atual ? prog(f, 0, 110) * 100 : 0}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// 1. Gancho (0–60): texto inteiro no quadro 0, número 3 gigante batendo no tempo.
const Gancho: React.FC<ReelsErrosProps> = ({ gancho, kicker }) => {
  const f = useCurrentFrame();
  const bate = Math.max(decai(f, 0), decai(f, 30), decai(f, 45));
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 112, lineHeight: 0.98, color: cores.branco };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Listras cor={cores.ouro} opacidade={0.18} />
      <div
        style={{
          position: "absolute",
          right: -60,
          top: 160,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 900,
          lineHeight: 1,
          color: cores.amareloVivo,
          transform: `scale(${1 + bate * 0.08}) rotate(${-6 + Math.sin(f / 8) * 2}deg)`,
        }}
      >
        3
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 80px 300px", gap: 6 }}>
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: cores.amareloVivo,
            color: cores.preto,
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
        <div style={{ ...titulo, color: cores.amareloVivo }}>{gancho[2]}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2–4. Cada erro (120 quadros): número bate, frase errada é riscada, a correção sobe num card amarelo.
const CenaErro: React.FC<{ n: number; erro: Erro; fundoClaro: boolean }> = ({ n, erro, fundoClaro }) => {
  const f = useCurrentFrame();
  const fundo = fundoClaro ? cores.offWhite : cores.preto;
  const texto = fundoClaro ? cores.tinta : cores.branco;
  const acento = fundoClaro ? cores.amarelo : cores.amareloVivo;
  const entra = prog(f, 0, 10);
  const numero = prog(f, 0, 8);
  const risco = prog(f, 34, 10);
  const xis = f >= 40 ? decai(f, 40, 8) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: fundo, clipPath: `inset(0 0 ${(1 - entra) * 100}% 0)` }}>
      <Listras cor={fundoClaro ? cores.borda : cores.ouro} opacidade={fundoClaro ? 0.6 : 0.14} velocidade={n % 2 ? 6 : -6} />
      <Graos cor={fundoClaro ? cores.amarelo : cores.ouro} seed={n + 2} />
      <Progresso atual={n - 1} />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 220,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 420,
          lineHeight: 1,
          color: acento,
          transform: `scale(${2.4 - 1.4 * numero}) rotate(${(1 - numero) * -14}deg)`,
          opacity: numero,
        }}
      >
        {`0${n}`}
      </div>
      <div style={{ position: "absolute", left: 90, top: 690, fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em", color: fundoClaro ? cores.ouro : cores.amareloVivo }}>
        {`ERRO ${n}`}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 760 }}>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 118, lineHeight: 1, color: texto }}>
          <span
            style={{
              backgroundImage: `linear-gradient(${acento}, ${acento})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 58%",
              backgroundSize: `${risco * 100}% 16px`,
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
            }}
          >
            {erro.errado}
          </span>
        </Revela>
      </div>
      {f >= 40 && (
        <div style={{ position: "absolute", right: 80, top: 330, transform: `scale(${1 + xis * 0.5}) rotate(${xis * 20}deg)` }}>
          <div style={{ width: 210, height: 210, borderRadius: 999, backgroundColor: fundoClaro ? cores.preto : cores.branco, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icone icone={faXmark} tamanho={130} cor={fundoClaro ? cores.amareloVivo : cores.preto} />
          </div>
        </div>
      )}
      <Pop
        em={62}
        de={0.4}
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 260,
          backgroundColor: fundoClaro ? cores.preto : cores.amareloVivo,
          borderRadius: 32,
          padding: "40px 46px",
          display: "flex",
          alignItems: "center",
          gap: 34,
          boxShadow: "0 24px 60px rgba(0,0,0,.25)",
          transform: `rotate(${-1.5 + Math.sin(f / 10) * 0.8}deg)`,
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            flexShrink: 0,
            borderRadius: 999,
            backgroundColor: fundoClaro ? cores.amareloVivo : cores.preto,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icone icone={faCheck} tamanho={58} cor={fundoClaro ? cores.preto : cores.amareloVivo} />
        </div>
        <div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: fundoClaro ? cores.amareloVivo : cores.preto, opacity: 0.8 }}>
            FAÇA ASSIM
          </div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 62, lineHeight: 1.02, color: fundoClaro ? cores.branco : cores.preto }}>{erro.certo}</div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// 5. Paradas da trilha (420–480): a pergunta bate em três golpes.
const Pergunta: React.FC<ReelsErrosProps> = ({ pergunta }) => {
  const f = useCurrentFrame();
  const golpe = (t: number) => prog(f, t, 6);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, alignItems: "center", justifyContent: "center" }}>
      <Letreiro texto="CALENDÁRIO  •  LEGENDA CURTA  •  UM CAMINHO SÓ  •  " top={260} rot={-7} sentido={1} fundo={cores.preto} cor={cores.amareloVivo} />
      <Letreiro texto="CALENDÁRIO  •  LEGENDA CURTA  •  UM CAMINHO SÓ  •  " top={1500} rot={6} sentido={-1} fundo={cores.preto} cor={cores.branco} />
      <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 170, lineHeight: 0.95, color: cores.preto, textAlign: "center" }}>
        <div style={{ transform: `scale(${2 - golpe(0)})`, opacity: golpe(0) }}>{pergunta[0]}</div>
        <div style={{ transform: `scale(${2 - golpe(15)})`, opacity: golpe(15) }}>{pergunta[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

// 6. Chamada (480–600): logo, convite, botão de WhatsApp e lembrete de salvar.
const Chamada: React.FC<ReelsErrosProps> = ({ convite, cta, salve, arroba }) => {
  const f = useCurrentFrame();
  const brilho = Math.exp(-(f % BATIDA) / 4);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 54, padding: "0 80px 160px" }}>
      <Listras cor={cores.ouro} opacidade={0.12} velocidade={3} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const p = prog(f, k * BATIDA, 30);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              width: 300 + p * 1300,
              height: 300 + p * 1300,
              borderRadius: 9999,
              border: `4px solid ${cores.ouro}`,
              opacity: f < k * BATIDA ? 0 : (1 - p) * 0.45,
            }}
          />
        );
      })}
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

export const ReelsErros: React.FC<ReelsErrosProps> = (props) => {
  const f = useCurrentFrame();
  const t = ultimo(f);
  const tremor = decai(f, t, 4);
  const flash = f < 2 ? 0 : decai(f, t, 2.5); // quadro 0 limpo: vira a capa
  const dx = (random(`x${f}`) - 0.5) * 34 * tremor;
  const dy = (random(`y${f}`) - 0.5) * 34 * tremor;
  const volume = (q: number) => interpolate(q, [0, 540, 600], [1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      {props.trilha && <Audio src={staticFile(props.trilha)} volume={volume} />}
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1.03 + tremor * 0.02})` }}>
        <Sequence durationInFrames={60}>
          <Gancho {...props} />
        </Sequence>
        {props.erros.map((erro, i) => (
          <Sequence key={i} from={60 + i * 120} durationInFrames={120}>
            <CenaErro n={i + 1} erro={erro} fundoClaro={i === 1} />
          </Sequence>
        ))}
        <Sequence from={420} durationInFrames={60}>
          <Pergunta {...props} />
        </Sequence>
        <Sequence from={480}>
          <Chamada {...props} />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: flash * 0.35, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
