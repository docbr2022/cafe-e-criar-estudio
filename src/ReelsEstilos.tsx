import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cores, fontes } from "./marca";
import { Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels de apresentação de marca de cliente de moda (case), 30 fps, 45,3 s, renderizado sem som.
// Trilha aplicada depois com ffmpeg (dark-beat.mp3 a partir de 63,667 s): a batida volta depois de uma
// pausa no quadro 90 e cada compasso dura 50 quadros (144 BPM), então todos os cortes caem em 90 + 50k
// e o pulso visual bate a cada 25 quadros (bumbo e caixa).
export const ESTILOS_FPS = 30;
export const ESTILOS_DURACAO = 1360;
const DROP = 90;
const MEIO = 25;

export type ReelsEstilosProps = {
  cliente: string;
  segmento: string;
  gancho: [string, string, string];
  anatomia: { parte: string; sentido: string; x: number; y: number }[]; // x, y: ponto no símbolo (0–1)
  importancia: [string, string, string];
  sucesso: [string, string];
  convite: [string, string];
  cta: string;
  arroba: string;
};

export const reelsEstilosPadrao: ReelsEstilosProps = {
  cliente: "Estilos & Griffe",
  segmento: "MODA",
  gancho: ["Estilo.", "Atitude.", "Personalidade."],
  anatomia: [
    { parte: "A RAPOSA", sentido: "Astúcia e atitude", x: 0.48, y: 0.7 },
    { parte: "AS LINHAS CRUZADAS", sentido: "A costura que une tudo", x: 0.49, y: 0.31 },
    { parte: "A GEOMETRIA", sentido: "Corte preciso e moderno", x: 0.1, y: 0.55 },
    { parte: "O DOURADO", sentido: "Sofisticação de griffe", x: 0.86, y: 0.1 },
  ],
  importancia: ["É a primeira impressão.", "É o que o cliente lembra.", "É o que sustenta o valor."],
  sucesso: ["Um cliente de longa data.", "Uma marca que fez sucesso."],
  convite: ["Sua loja também", "merece essa atitude."],
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

// Cores da marca do cliente (tiradas do logo).
const ouro = "#C8A562";
const ouroClaro = "#E8D3A0";
const noite = "#0B0B0C";
const grafite = "#19191B";

// Logo em camadas: todas as imagens "estilos-*" (menos o símbolo) têm o mesmo quadro de 1435 x 571,
// então é só empilhar. O símbolo ocupa 446 x 543 no canto superior esquerdo desse quadro.
const LOGO_W = 1435;
const LOGO_H = 571;
const SIMB_W = 446;
const SIMB_H = 543;
const img = (n: string) => staticFile(`clientes/estilos-${n}`);

// Pulso da batida (some em ~5 quadros). Toda cena começa em DROP + 50k.
const batida = (f: number) => Math.exp(-(f % MEIO) / 5);

// ---------- Fundo: cetim escuro com brilho correndo, holofotes de passarela, poeira dourada ----------
const Poeira: React.FC<{ qtd?: number; cor?: string; seed?: string; atrai?: number }> = ({ qtd = 40, cor = ouroClaro, seed = "p", atrai = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: qtd }).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1080;
        const vel = 0.4 + random(`${seed}v${i}`) * 1.6;
        const y0 = ((random(`${seed}y${i}`) * 2200 - f * vel) % 2200 + 2200) % 2200 - 140;
        const x = x0 + Math.sin(f / 28 + i) * 26;
        const tx = interpolate(atrai, [0, 1], [x, 540]);
        const ty = interpolate(atrai, [0, 1], [y0, 960]);
        const t = 2 + random(`${seed}t${i}`) * 7;
        const pisca = 0.3 + 0.7 * Math.abs(Math.sin(f / (7 + (i % 6)) + i));
        return (
          <div
            key={i}
            style={{ position: "absolute", left: tx, top: ty, width: t, height: t, borderRadius: 99, backgroundColor: cor, opacity: pisca, boxShadow: `0 0 ${t * 3}px ${cor}` }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Flashes de câmera espalhados (paparazzi), um a cada batida.
const Flashes: React.FC<{ seed?: string; qtd?: number; forca?: number }> = ({ seed = "fl", qtd = 3, forca = 1 }) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / MEIO);
  const local = f % MEIO;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: qtd }).map((_, i) => {
        const x = random(`${seed}x${k}-${i}`) * 1080;
        const y = random(`${seed}y${k}-${i}`) * 1920;
        const atraso = Math.floor(random(`${seed}a${k}-${i}`) * 10);
        const o = local < atraso ? 0 : Math.exp(-(local - atraso) / 3) * forca;
        const d = 160 + random(`${seed}d${k}-${i}`) * 220;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - d / 2,
              top: y - d / 2,
              width: d,
              height: d,
              borderRadius: 999,
              background: "radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,240,210,.35) 25%, transparent 65%)",
              opacity: o,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Fundo: React.FC<{ claro?: boolean; pulsa?: boolean }> = ({ claro = false, pulsa = true }) => {
  const f = useCurrentFrame();
  const b = pulsa ? batida(f) : 0;
  const base = claro ? "#F3EFE6" : noite;
  const holofote = (lado: number) => {
    const ang = Math.sin(f / 40 + lado * 2) * 18 + lado * 14;
    return (
      <div
        style={{
          position: "absolute",
          top: -200,
          left: 540 + lado * 260 - 500,
          width: 1000,
          height: 2400,
          transformOrigin: "50% 0%",
          transform: `rotate(${ang}deg)`,
          background: `linear-gradient(180deg, rgba(255,240,210,${claro ? 0.35 : 0.13 + b * 0.06}) 0%, transparent 70%)`,
          clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)",
          mixBlendMode: claro ? "multiply" : "screen",
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {/* cetim: faixas diagonais suaves com brilho correndo */}
      <AbsoluteFill
        style={{
          background: claro
            ? `linear-gradient(115deg, transparent ${(f * 1.6) % 160 - 40}%, rgba(200,165,98,.18) ${(f * 1.6) % 160 - 25}%, transparent ${(f * 1.6) % 160 - 10}%)`
            : `linear-gradient(115deg, transparent ${(f * 1.6) % 160 - 40}%, rgba(232,211,160,.10) ${(f * 1.6) % 160 - 25}%, transparent ${(f * 1.6) % 160 - 10}%), repeating-linear-gradient(115deg, rgba(255,255,255,.018) 0 40px, transparent 40px 120px)`,
        }}
      />
      {!claro && holofote(-1)}
      {!claro && holofote(1)}
      {/* passarela: linhas de luz vindo em perspectiva */}
      <div style={{ position: "absolute", left: -540, right: -540, bottom: -220, height: 860, perspective: 600, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(72deg)",
            transformOrigin: "50% 100%",
            backgroundImage: `linear-gradient(rgba(200,165,98,${claro ? 0.4 : 0.32}) 3px, transparent 3px)`,
            backgroundSize: "100% 120px",
            backgroundPosition: `0 ${(f * 5) % 120}px`,
            maskImage: "linear-gradient(transparent, black 75%)",
            WebkitMaskImage: "linear-gradient(transparent, black 75%)",
          }}
        />
        <div style={{ position: "absolute", left: "50%", bottom: 0, width: 6, marginLeft: -3, height: "100%", background: `linear-gradient(transparent, ${ouro})`, opacity: 0.6 }} />
      </div>
      <Poeira cor={claro ? ouro : ouroClaro} qtd={claro ? 20 : 40} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(232,211,160,${(claro ? 0.1 : 0.06) + b * 0.08}) 0%, transparent 60%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 55%, ${claro ? "rgba(120,100,60,.18)" : "rgba(0,0,0,.7)"} 100%)` }} />
    </AbsoluteFill>
  );
};

// Entrada de cena: clarão de flash + zoom com desfoque.
const Cena: React.FC<{ children: React.ReactNode; claro?: boolean; flashes?: boolean }> = ({ children, claro, flashes = false }) => {
  const f = useCurrentFrame();
  const e = prog(f, 0, 12);
  return (
    <AbsoluteFill>
      <Fundo claro={claro} />
      {flashes && <Flashes forca={0.55} />}
      <AbsoluteFill style={{ transform: `scale(${1.14 - e * 0.14})`, filter: `blur(${(1 - e) * 14}px)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: interpolate(f, [0, 6], [0.9, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; em?: number; cor?: string; style?: React.CSSProperties }> = ({ children, em = 0, cor = ouro, style }) => (
  <Revela em={em} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 32, letterSpacing: "0.3em", color: cor, textAlign: "center", ...style }}>
    {children}
  </Revela>
);

// Faixa que corre na diagonal (texto em loop).
const Faixa: React.FC<{ texto: string; top: number; rot: number; inverso?: boolean; fundo?: string; cor?: string }> = ({ texto, top, rot, inverso, fundo = ouro, cor = noite }) => {
  const f = useCurrentFrame();
  const desloc = ((inverso ? f : -f) * 6) % 900;
  return (
    <div style={{ position: "absolute", left: -300, right: -300, top, transform: `rotate(${rot}deg)`, backgroundColor: fundo, padding: "14px 0", overflow: "hidden" }}>
      <div style={{ whiteSpace: "nowrap", transform: `translateX(${desloc - 900}px)`, fontFamily: fontes.texto, fontWeight: 600, fontSize: 38, letterSpacing: "0.3em", color: cor }}>
        {Array.from({ length: 10 }).map(() => texto).join("   ✦   ")}
      </div>
    </div>
  );
};

// Logo montado em camadas, numa largura qualquer; cada parte pode entrar separada.
const Logo: React.FC<{ largura: number; simbolo?: number; estilos?: number; griffe?: number; ouroNoGriffe?: boolean; brilho?: number }> = ({
  largura,
  simbolo = 1,
  estilos = 1,
  griffe = 1,
  ouroNoGriffe = true,
  brilho = 0,
}) => {
  const k = largura / LOGO_W;
  const sombra = `drop-shadow(0 0 ${10 + brilho * 30}px rgba(232,211,160,${0.25 + brilho * 0.4}))`;
  return (
    <div style={{ position: "relative", width: largura, height: LOGO_H * k }}>
      <Img
        src={img("simbolo-ouro.png")}
        style={{ position: "absolute", left: 0, top: 0, width: SIMB_W * k, height: SIMB_H * k, clipPath: `inset(${(1 - simbolo) * 100}% 0 0 0)`, filter: sombra }}
      />
      <Img
        src={img("texto-branco.png")}
        style={{ position: "absolute", inset: 0, width: largura, height: LOGO_H * k, clipPath: `inset(0 ${(1 - estilos) * 100}% 0 0)`, transform: `translateX(${(1 - estilos) * -30}px)` }}
      />
      <Img
        src={img(ouroNoGriffe ? "griffe-ouro.png" : "griffe-branco.png")}
        style={{ position: "absolute", inset: 0, width: largura, height: LOGO_H * k, clipPath: `inset(0 ${(1 - griffe) * 100}% 0 0)`, filter: sombra }}
      />
    </div>
  );
};

// ---------- 1. Gancho (0–90): três palavras nos bumbos, pausa, flash no drop ----------
const Gancho: React.FC<ReelsEstilosProps> = ({ gancho }) => {
  const f = useCurrentFrame();
  const tempos = [8, 28, 52];
  const idx = f < tempos[1] ? 0 : f < tempos[2] ? 1 : 2;
  const local = f - tempos[idx];
  const entra = prog(local, 0, 7);
  const apaga = prog(f, 76, 4); // a trilha silencia antes do drop
  const atrai = prog(f, 60, 26);
  return (
    <AbsoluteFill style={{ backgroundColor: noite }}>
      <Fundo pulsa={false} />
      <Poeira qtd={60} seed="g" atrai={atrai} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - apaga }}>
        <div
          style={{
            fontFamily: fontes.titulo,
            fontWeight: 800,
            fontSize: idx === 2 ? 130 : 160,
            lineHeight: 1,
            textAlign: "center",
            color: idx === 2 ? ouroClaro : cores.branco,
            transform: `scale(${1.5 - entra * 0.5 + Math.max(0, local) * 0.004}) skewX(${(1 - entra) * -12}deg)`,
            filter: `blur(${(1 - entra) * 16}px)`,
            opacity: f < tempos[0] ? 0 : entra,
            textShadow: idx === 2 ? "0 0 60px rgba(232,211,160,.55)" : "none",
            padding: "0 50px",
          }}
        >
          {gancho[idx]}
        </div>
        <div style={{ position: "absolute", bottom: 400, display: "flex", gap: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 90, height: 6, borderRadius: 9, backgroundColor: f >= tempos[i] ? ouro : "rgba(255,255,255,.15)" }} />
          ))}
        </div>
      </AbsoluteFill>
      {/* silêncio da trilha: tela preta com uma frase curta */}
      <AbsoluteFill style={{ backgroundColor: cores.preto, opacity: apaga, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, letterSpacing: "0.3em", color: ouroClaro, opacity: prog(f, 79, 4) }}>ISSO TEM NOME</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: interpolate(f, [84, 90], [0, 1], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// ---------- 2. Revelação do logo (90–290) ----------
const Revelacao: React.FC<ReelsEstilosProps> = ({ segmento }) => {
  const f = useCurrentFrame();
  const simbolo = prog(f, 2, 26);
  const estilos = prog(f, 24, 18);
  const griffe = prog(f, 38, 30);
  const linha = prog(f, 70, 16);
  const sub = prog(f, 80, 16);
  const b = batida(f);
  const largura = 940;
  return (
    <Cena flashes>
      {/* ondas a cada batida */}
      {[0, 12].map((a) => {
        const t = f < a ? 0 : ((f - a) % 50) / 50;
        const d = 300 + t * 1400;
        return (
          <div
            key={a}
            style={{ position: "absolute", left: 540 - d / 2, top: 860 - d / 2, width: d, height: d, borderRadius: 9999, border: `${3 - t * 2}px solid ${ouro}`, opacity: f < a ? 0 : (1 - t) * 0.5 }}
          />
        );
      })}
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, opacity: prog(f, 96, 14) }}>
        <Kicker em={96}>{`CASE  •  ${segmento}`}</Kicker>
      </div>
      {/* símbolo grande primeiro, depois encolhe para o lugar no logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860 - (LOGO_H * largura) / LOGO_W / 2, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${1 + b * 0.025}) translateY(${Math.sin(f / 20) * 6}px)` }}>
          <Logo largura={largura} simbolo={simbolo} estilos={estilos} griffe={griffe} brilho={b} />
        </div>
      </div>
      {/* lâmina de luz atravessando o logo */}
      <div
        style={{
          position: "absolute",
          top: 600,
          height: 520,
          width: 160,
          left: interpolate((f - 60) % 100, [0, 36], [-300, 1300], { extrapolateRight: "clamp" }),
          transform: "rotate(18deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,250,235,.35), transparent)",
          opacity: f > 60 ? 1 : 0,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", top: 1200, left: 540 - 240 * linha, width: 480 * linha, height: 3, backgroundColor: ouro, boxShadow: `0 0 20px ${ouro}` }} />
      <div style={{ position: "absolute", top: 1240, left: 0, right: 0, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)` }}>
        <Kicker em={80} cor={cores.branco} style={{ fontSize: 30 }}>
          UMA MARCA COM ATITUDE
        </Kicker>
        <div style={{ textAlign: "center", fontFamily: fontes.texto, fontSize: 32, color: ouroClaro, marginTop: 12, letterSpacing: "0.1em" }}>
          criada pela <span style={{ fontFamily: fontes.script, fontSize: 52, color: cores.amareloVivo, letterSpacing: 0 }}>Café e Criar</span>
        </div>
      </div>
    </Cena>
  );
};

// ---------- 3. Anatomia do símbolo (290–540): cada linha tem um porquê ----------
const Anatomia: React.FC<ReelsEstilosProps> = ({ anatomia }) => {
  const f = useCurrentFrame();
  const W = 520;
  const H = W * (SIMB_H / SIMB_W);
  const ox = 540 - W / 2;
  const oy = 520;
  const INICIO = 25;
  const ativo = Math.min(anatomia.length - 1, Math.max(0, Math.floor((f - INICIO) / 50)));
  const gira = Math.sin(f / 30) * 6;
  return (
    <Cena>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0 }}>
        <Kicker em={2}>POR TRÁS DO SÍMBOLO</Kicker>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.branco, textAlign: "center", marginTop: 14 }}>
          Cada linha
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: ouroClaro, textAlign: "center" }}>
          tem um porquê.
        </Revela>
      </div>
      <div style={{ position: "absolute", left: ox, top: oy, width: W, height: H, transform: `perspective(1400px) rotateY(${gira}deg)` }}>
        <Img src={img("simbolo-ouro.png")} style={{ width: W, height: H, opacity: f < INICIO ? 1 : 0.28 }} />
        {anatomia.map((a, i) => {
          if (i !== ativo || f < INICIO) return null;
          const local = f - INICIO - i * 50;
          const p = prog(local, 0, 10);
          const r = 130 * p;
          return (
            <div key={i}>
              <Img
                src={img("simbolo-ouro.png")}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: W,
                  height: H,
                  clipPath: `circle(${r}px at ${a.x * W}px ${a.y * H}px)`,
                  filter: `drop-shadow(0 0 18px ${ouroClaro}) brightness(1.3)`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: a.x * W - r,
                  top: a.y * H - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: 999,
                  border: `3px dashed ${ouroClaro}`,
                  boxShadow: `0 0 30px ${ouro}`,
                  transform: `rotate(${f * 3}deg)`,
                }}
              />
            </div>
          );
        })}
      </div>
      {f >= INICIO && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1240 }}>
          {anatomia.map((a, i) => {
            if (i !== ativo) return null;
            const local = f - INICIO - i * 50;
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
                  <Pop em={f - local} de={0.2}>
                    <div
                      style={{
                        width: 66,
                        height: 66,
                        borderRadius: 99,
                        border: `3px solid ${ouro}`,
                        color: ouroClaro,
                        fontFamily: fontes.titulo,
                        fontWeight: 800,
                        fontSize: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </div>
                  </Pop>
                  <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 36, letterSpacing: "0.22em", color: ouro, opacity: prog(local, 2, 8) }}>{a.parte}</div>
                </div>
                <div
                  style={{
                    fontFamily: fontes.titulo,
                    fontWeight: 800,
                    fontSize: 84,
                    lineHeight: 1.05,
                    color: cores.branco,
                    marginTop: 18,
                    transform: `translateY(${(1 - prog(local, 4, 10)) * 60}px)`,
                    opacity: prog(local, 4, 10),
                  }}
                >
                  {a.sentido}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
            {anatomia.map((_, i) => (
              <div key={i} style={{ width: i === ativo ? 70 : 20, height: 8, borderRadius: 8, backgroundColor: i <= ativo ? ouro : "rgba(255,255,255,.2)" }} />
            ))}
          </div>
        </div>
      )}
    </Cena>
  );
};

// ---------- 4. Tipografia (540–690): o moderno e o exclusivo no mesmo nome ----------
const Tipografia: React.FC<ReelsEstilosProps> = () => {
  const f = useCurrentFrame();
  const k = 1000 / LOGO_W;
  const est = prog(f, 4, 14);
  const gri = prog(f, 50, 24);
  const junta = prog(f, 100, 14);
  // "Estilos" e "Griffe" aparecem separados e se juntam no compasso final
  const yEst = interpolate(junta, [0, 1], [-240, 0]);
  const yGri = interpolate(junta, [0, 1], [260, 0]);
  return (
    <Cena>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0 }}>
        <Kicker em={2}>A TIPOGRAFIA</Kicker>
      </div>
      <div style={{ position: "absolute", left: 40, top: 780, width: 1000, height: LOGO_H * k }}>
        <Img
          src={img("texto-branco.png")}
          style={{ position: "absolute", inset: 0, width: 1000, height: LOGO_H * k, clipPath: `inset(0 ${(1 - est) * 100}% 0 0)`, transform: `translateY(${yEst}px) translateX(-120px)` }}
        />
        <Img
          src={img("griffe-ouro.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: 1000,
            height: LOGO_H * k,
            clipPath: `inset(0 ${(1 - gri) * 100}% 0 0)`,
            transform: `translateY(${yGri}px) translateX(-120px)`,
            filter: `drop-shadow(0 0 ${12 + batida(f) * 20}px rgba(232,211,160,.5))`,
          }}
        />
      </div>
      {/* rótulos de cada parte */}
      <div style={{ position: "absolute", left: 80, top: 300, opacity: est * (1 - junta) }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.25em", color: ouro }}>SANS FINA</div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 60, color: cores.branco }}>moderna, limpa, atual</div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 1500, textAlign: "right", opacity: gri * (1 - junta) }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.25em", color: ouro }}>CURSIVA</div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 60, color: cores.branco }}>assinatura exclusiva</div>
      </div>
      <div style={{ position: "absolute", top: 1330, left: 60, right: 60, textAlign: "center" }}>
        <Revela em={108} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: cores.branco }}>
          O moderno e o exclusivo
        </Revela>
        <Revela em={114} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: ouroClaro }}>
          no mesmo nome.
        </Revela>
      </div>
    </Cena>
  );
};

// ---------- 5. Importância (690–890): marca não é só um logo ----------
const Importancia: React.FC<ReelsEstilosProps> = ({ importancia }) => {
  const f = useCurrentFrame();
  const riscado = prog(f, 26, 12);
  return (
    <Cena claro>
      <Faixa texto="ESTILO  •  ATITUDE  •  PERSONALIDADE" top={90} rot={-4} fundo={noite} cor={ouroClaro} />
      <div style={{ position: "absolute", top: 330, left: 80, right: 80 }}>
        <Kicker em={2} cor="#8A7140" style={{ textAlign: "left" }}>
          POR QUE INVESTIR NA MARCA?
        </Kicker>
        <div style={{ position: "relative", marginTop: 16 }}>
          <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1, color: noite }}>
            Marca não é
          </Revela>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1, color: noite }}>
              só um logo.
            </Revela>
            <div style={{ position: "absolute", left: -10, top: "48%", height: 12, width: `${riscado * 104}%`, backgroundColor: ouro, borderRadius: 8, transform: "rotate(-3deg)" }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 820, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 34 }}>
        {importancia.map((t, i) => {
          const em = 50 + i * 25;
          const p = prog(f, em, 12);
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                backgroundColor: cores.branco,
                borderRadius: 28,
                padding: "34px 40px",
                borderLeft: `10px solid ${ouro}`,
                boxShadow: `0 ${20 + batida(f) * 16}px 50px rgba(80,60,20,.16)`,
                transform: `translateX(${(1 - p) * (i % 2 ? 1100 : -1100)}px) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
              }}
            >
              <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1, color: ouro, minWidth: 120 }}>0{i + 1}</div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 56, lineHeight: 1.05, color: noite }}>{t}</div>
            </div>
          );
        })}
      </div>
    </Cena>
  );
};

// ---------- 6. Aplicações (890–1090): da etiqueta à fachada ----------
const Etiqueta: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "relative", width: 300, transformOrigin: "50% -120px", transform: `rotate(${Math.sin(f / 12) * 7}deg)` }}>
    {/* cordão */}
    <div style={{ position: "absolute", left: 147, top: -120, width: 3, height: 140, backgroundColor: ouro }} />
    <div
      style={{
        width: 300,
        height: 480,
        backgroundColor: grafite,
        clipPath: "polygon(20% 0, 80% 0, 100% 12%, 100% 100%, 0 100%, 0 12%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        border: `2px solid ${ouro}`,
      }}
    >
      <div style={{ position: "absolute", top: 30, width: 26, height: 26, borderRadius: 99, backgroundColor: noite, border: `3px solid ${ouro}` }} />
      <Img src={img("simbolo-ouro.png")} style={{ width: 150 }} />
      <div style={{ width: 120, height: 2, backgroundColor: ouro }} />
      <div style={{ fontFamily: fontes.texto, fontSize: 22, letterSpacing: "0.3em", color: ouroClaro }}>COLEÇÃO</div>
    </div>
  </div>
);

const Sacola: React.FC = () => (
  <div style={{ position: "relative", width: 400, height: 470 }}>
    <div style={{ position: "absolute", left: 110, top: 0, width: 180, height: 140, borderRadius: "90px 90px 0 0", border: `10px solid ${noite}`, borderBottom: "none" }} />
    <div
      style={{
        position: "absolute",
        top: 90,
        width: 400,
        height: 380,
        background: `linear-gradient(135deg, ${ouroClaro}, ${ouro} 55%, #A9874A)`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 30px 70px rgba(0,0,0,.5)",
      }}
    >
      <Img src={img("logo-escuro.png")} style={{ width: 330, filter: "brightness(0)" }} />
    </div>
  </div>
);

const PerfilInsta: React.FC<{ f: number; arroba: string }> = ({ f, arroba }) => (
  <div style={{ width: 460, borderRadius: 28, backgroundColor: cores.branco, boxShadow: "0 30px 70px rgba(0,0,0,.45)", padding: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ width: 120, height: 120, borderRadius: 999, padding: 5, background: `conic-gradient(from ${f * 4}deg, ${ouro}, ${ouroClaro}, ${ouro})` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 999, backgroundColor: noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={img("simbolo-ouro.png")} style={{ width: 62 }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: fontes.texto, fontWeight: 600, fontSize: 26, color: noite }}>
          <Icone icone={faInstagram} tamanho={26} cor={ouro} /> {arroba}
        </div>
        {[200, 150].map((w, i) => (
          <div key={i} style={{ width: w, height: 14, borderRadius: 9, backgroundColor: i === 0 ? ouro : cores.borda }} />
        ))}
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginTop: 20 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ aspectRatio: "1", backgroundColor: i % 3 === 1 ? ouro : noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={img("simbolo-ouro.png")} style={{ width: 50, opacity: i % 3 === 1 ? 0 : 0.9 }} />
        </div>
      ))}
    </div>
  </div>
);

const Fachada: React.FC = () => (
  <div style={{ width: 520, height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.6)", border: `3px solid ${ouro}` }}>
    <Img src={img("fachada.jpg")} style={{ width: 520, height: 500, objectFit: "cover", transform: "scale(1.35)" }} />
  </div>
);

const Aplicacoes: React.FC<ReelsEstilosProps> = () => {
  const f = useCurrentFrame();
  const flut = (i: number) => Math.sin((f + i * 25) / 14) * 10;
  const itens = [
    { el: <Etiqueta f={f} />, x: 80, y: 600, rot: -4, em: 6, nome: "Etiqueta" },
    { el: <Sacola />, x: 560, y: 560, rot: 5, em: 25, nome: "Sacola" },
    { el: <PerfilInsta f={f} arroba="Instagram" />, x: 50, y: 1230, rot: 3, em: 50, nome: "Redes" },
    { el: <Fachada />, x: 530, y: 1150, rot: -4, em: 75, nome: "Fachada" },
  ];
  return (
    <Cena flashes>
      <div style={{ position: "absolute", top: 150, left: 70, right: 70 }}>
        <Kicker em={2} style={{ textAlign: "left" }}>
          DA ETIQUETA À FACHADA
        </Kicker>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.branco, marginTop: 10 }}>
          A marca
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: ouroClaro }}>
          veste tudo.
        </Revela>
      </div>
      {itens.map((it, i) => {
        const p = prog(f, it.em, 14);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y + flut(i) + (1 - p) * 1000,
              transform: `rotate(${it.rot + (1 - p) * 25}deg) scale(${0.96 + batida(f) * 0.03})`,
              opacity: p,
            }}
          >
            {it.el}
          </div>
        );
      })}
    </Cena>
  );
};

// ---------- 7. Sucesso (1090–1190): logo sob os flashes ----------
const Sucesso: React.FC<ReelsEstilosProps> = ({ sucesso }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 100], [1.05, 1.15]);
  return (
    <Cena>
      <Flashes seed="su" qtd={6} forca={0.9} />
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center" }}>
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 80, lineHeight: 1.05, color: cores.branco }}>
          {sucesso[0]}
        </Revela>
        <Revela em={22} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 80, lineHeight: 1.05, color: ouroClaro }}>
          {sucesso[1]}
        </Revela>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", transform: `scale(${zoom})` }}>
        <Logo largura={900} brilho={batida(f)} />
      </div>
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0 }}>
        <Kicker em={50} cor={cores.branco} style={{ fontSize: 30 }}>
          MARCA BEM CONSTRUÍDA
        </Kicker>
        <Kicker em={56} style={{ fontSize: 30, marginTop: 8 }}>
          TRABALHA POR VOCÊ
        </Kicker>
      </div>
    </Cena>
  );
};

// ---------- 8. Chamada (1190–1360): assinatura Café e Criar ----------
const Chamada: React.FC<ReelsEstilosProps> = ({ convite, cta, arroba, cliente, segmento }) => {
  const f = useCurrentFrame();
  const brilho = batida(f);
  const vira = prog(f, 0, 16);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <AbsoluteFill
        style={{
          width: 3000,
          height: 3000,
          left: -960,
          top: -540,
          background: `repeating-conic-gradient(from ${-f * 0.5}deg at 50% 50%, rgba(255,228,0,.08) 0deg 6deg, transparent 6deg 18deg)`,
        }}
      />
      <Poeira cor={cores.amareloVivo} qtd={36} seed="c" />
      {/* cortina dourada que revela o preto */}
      <AbsoluteFill style={{ backgroundColor: ouro, clipPath: `inset(0 0 ${vira * 100}% 0)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46, padding: "0 70px" }}>
        <Pop em={10} de={0.6}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, backgroundColor: grafite, border: `2px solid ${ouro}`, borderRadius: 999, padding: "16px 36px" }}>
            <Img src={img("simbolo-ouro.png")} style={{ height: 60 }} />
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, color: ouroClaro, letterSpacing: "0.12em" }}>
              {cliente.toUpperCase()} • {segmento}
            </div>
          </div>
        </Pop>
        <div style={{ textAlign: "center" }}>
          <Revela em={18} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.branco }}>
            {convite[0]}
          </Revela>
          <Revela em={24} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.amareloVivo }}>
            {convite[1]}
          </Revela>
        </div>
        <Pop em={34} de={0.7}>
          <Img src={staticFile("logo-full.png")} style={{ width: 640 }} />
        </Pop>
        <Pop
          em={44}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            backgroundColor: cores.amareloVivo,
            color: cores.preto,
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: 56,
            padding: "30px 64px",
            borderRadius: 999,
            boxShadow: `0 0 ${30 + brilho * 50}px rgba(255,228,0,${0.35 + brilho * 0.35})`,
          }}
        >
          <Icone icone={faWhatsapp} tamanho={66} cor={cores.preto} />
          {cta}
        </Pop>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 42, color: cores.amareloVivo, opacity: prog(f, 50, 10) }}>{arroba}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.preto, opacity: interpolate(f, [152, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// Linha do tempo: [início, duração, cena]
const CENAS: [number, number, React.FC<ReelsEstilosProps>][] = [
  [0, DROP, Gancho],
  [90, 200, Revelacao],
  [290, 250, Anatomia],
  [540, 150, Tipografia],
  [690, 200, Importancia],
  [890, 200, Aplicacoes],
  [1090, 100, Sucesso],
  [1190, 170, Chamada],
];

export const ReelsEstilos: React.FC<ReelsEstilosProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: noite }}>
      {CENAS.map(([de, dur, C]) => (
        <Sequence key={de} from={de} durationInFrames={Math.min(dur, durationInFrames - de)}>
          <C {...props} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
