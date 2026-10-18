import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faCheck, faEnvelope, faGlobe, faLock, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cores, fontes } from "./marca";
import { Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels de apresentação de marca de cliente (case), 30 fps, 47 s, renderizado sem som.
// Trilha aplicada depois com ffmpeg (the-borderland.mp3 a partir de 9,85 s): o drop cai no quadro 90
// e as batidas fortes se repetem a cada 48 quadros, então todos os cortes caem em 90 + 48k.
export const MATRIZ_FPS = 30;
export const MATRIZ_DURACAO = 1410;
const DROP = 90;
const BATIDA = 48;

export type ReelsMatrizProps = {
  cliente: string;
  segmento: string;
  site: string;
  telas: string[]; // prints do site em public/clientes/ (vazio = cena do site só com o logo)
  chamadaSite: string;
  servicos: string[];
  gancho: [string, string, string];
  anatomia: { parte: string; sentido: string; x: number; y: number }[]; // x, y: ponto no símbolo (0–1)
  importancia: [string, string, string];
  especialista: { sozinho: string; certo: string }[];
  convite: [string, string];
  cta: string;
  arroba: string;
};

export const reelsMatrizPadrao: ReelsMatrizProps = {
  cliente: "Matriz",
  segmento: "MARCAS E PATENTES",
  site: "matrizmarcas.com.br",
  telas: ["clientes/matriz-site-1.jpg", "clientes/matriz-site-2.jpg", "clientes/matriz-site-3.jpg"],
  chamadaSite: "Sua marca garantida",
  servicos: ["Pesquisa de anterioridade", "Protocolo no INPI", "Acompanhamento do processo", "Defesa dos seus direitos"],
  gancho: ["Seu nome.", "Sua reputação.", "Seu patrimônio."],
  anatomia: [
    { parte: "A COLUNA", sentido: "Solidez e proteção", x: 0.49, y: 0.6 },
    { parte: "A BALANÇA", sentido: "Justiça e equilíbrio", x: 0.14, y: 0.74 },
    { parte: "O DOURADO", sentido: "Valor e patrimônio", x: 0.84, y: 0.36 },
    { parte: "A SERIFA", sentido: "Tradição e confiança", x: 0.49, y: 0.08 },
  ],
  importancia: ["É a primeira impressão.", "É o que gera confiança.", "É o que te diferencia."],
  especialista: [
    { sozinho: "Logo de banco de imagem", certo: "Símbolo com significado" },
    { sozinho: "Cores no chute", certo: "Paleta estratégica" },
    { sozinho: "Cada post de um jeito", certo: "Identidade consistente" },
    { sozinho: "Nome sem pesquisa", certo: "Marca pronta para registrar" },
  ],
  convite: ["Sua marca também", "merece nascer certa."],
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

// Cores da marca da cliente (tiradas do logo).
const ouro = "#BD9D60";
const ouroClaro = "#E2C98F";
const noite = "#0C0D12";
const noite2 = "#16171F";

// Pulso das batidas fortes (some em ~6 quadros).
// Toda cena começa em DROP + 48k, então o quadro local de cada cena já está alinhado à batida.
const batida = (f: number) => Math.exp(-(f % BATIDA) / 6);

// ---------- Fundo vivo: brilho, raios girando, grade em perspectiva e partículas douradas ----------
const Particulas: React.FC<{ qtd?: number; cor?: string; seed?: string; atrai?: number }> = ({ qtd = 46, cor = ouro, seed = "p", atrai = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: qtd }).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1080;
        const vel = 0.6 + random(`${seed}v${i}`) * 2.2;
        const y0 = ((random(`${seed}y${i}`) * 2200 - f * vel) % 2200 + 2200) % 2200 - 140;
        const x = x0 + Math.sin(f / 30 + i) * 30;
        const tx = interpolate(atrai, [0, 1], [x, 540]);
        const ty = interpolate(atrai, [0, 1], [y0, 960]);
        const t = 3 + random(`${seed}t${i}`) * 9;
        const pisca = 0.35 + 0.65 * Math.abs(Math.sin(f / (8 + (i % 7)) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: tx,
              top: ty,
              width: t,
              height: t,
              borderRadius: 99,
              backgroundColor: cor,
              opacity: pisca * (1 - atrai * 0.3),
              boxShadow: `0 0 ${t * 3}px ${cor}`,
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
  const base = claro ? "#F4F1EA" : noite;
  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {/* raios girando */}
      <AbsoluteFill
        style={{
          width: 3000,
          height: 3000,
          left: -960,
          top: -540,
          background: `repeating-conic-gradient(from ${f * 0.4}deg at 50% 50%, ${claro ? "rgba(189,157,96,.10)" : "rgba(189,157,96,.07)"} 0deg 6deg, transparent 6deg 18deg)`,
        }}
      />
      {/* brilho central que pulsa na batida */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, rgba(226,201,143,${(claro ? 0.25 : 0.18) + b * 0.15}) 0%, transparent ${55 + b * 8}%)`,
        }}
      />
      {/* grade em perspectiva no chão */}
      <div style={{ position: "absolute", left: -540, right: -540, bottom: -200, height: 900, perspective: 700, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(68deg)",
            transformOrigin: "50% 100%",
            backgroundImage: `linear-gradient(rgba(189,157,96,${claro ? 0.35 : 0.25}) 2px, transparent 2px), linear-gradient(90deg, rgba(189,157,96,${claro ? 0.35 : 0.25}) 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0 ${(f * 3) % 90}px`,
            maskImage: "linear-gradient(transparent, black 70%)",
            WebkitMaskImage: "linear-gradient(transparent, black 70%)",
          }}
        />
      </div>
      <Particulas cor={claro ? ouro : ouroClaro} qtd={claro ? 24 : 46} />
      {/* vinheta */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 55%, ${claro ? "rgba(120,100,60,.18)" : "rgba(0,0,0,.65)"} 100%)` }} />
    </AbsoluteFill>
  );
};

// Entrada de cena: flash dourado + zoom com desfoque.
const Cena: React.FC<{ children: React.ReactNode; claro?: boolean; flash?: boolean }> = ({ children, claro, flash = true }) => {
  const f = useCurrentFrame();
  const e = prog(f, 0, 12);
  return (
    <AbsoluteFill>
      <Fundo claro={claro} />
      <AbsoluteFill style={{ transform: `scale(${1.12 - e * 0.12})`, filter: `blur(${(1 - e) * 14}px)` }}>{children}</AbsoluteFill>
      {flash && <AbsoluteFill style={{ backgroundColor: ouroClaro, opacity: interpolate(f, [0, 7], [0.85, 0], { extrapolateRight: "clamp" }), mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; em?: number; cor?: string; style?: React.CSSProperties }> = ({ children, em = 0, cor = ouro, style }) => (
  <Revela em={em} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.22em", color: cor, textAlign: "center", ...style }}>
    {children}
  </Revela>
);

// Faixa que corre na diagonal (texto em loop).
const Faixa: React.FC<{ texto: string; top: number; rot: number; inverso?: boolean; fundo?: string; cor?: string }> = ({ texto, top, rot, inverso, fundo = ouro, cor = noite }) => {
  const f = useCurrentFrame();
  const desloc = ((inverso ? f : -f) * 6) % 900;
  return (
    <div style={{ position: "absolute", left: -300, right: -300, top, transform: `rotate(${rot}deg)`, backgroundColor: fundo, padding: "14px 0", overflow: "hidden" }}>
      <div style={{ whiteSpace: "nowrap", transform: `translateX(${desloc - 900}px)`, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 44, letterSpacing: "0.08em", color: cor }}>
        {Array.from({ length: 10 }).map(() => texto).join("  ✦  ")}
      </div>
    </div>
  );
};

// ---------- 1. Gancho (0–90): três palavras no tempo da subida da trilha ----------
const Gancho: React.FC<ReelsMatrizProps> = ({ gancho }) => {
  const f = useCurrentFrame();
  const idx = Math.min(2, Math.floor(f / 30));
  const local = f - idx * 30;
  const entra = prog(local, 0, 8);
  const atrai = prog(f, 60, 30);
  return (
    <AbsoluteFill>
      <Fundo pulsa={false} />
      <Particulas qtd={60} seed="g" atrai={atrai} cor={ouroClaro} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: fontes.titulo,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1,
            textAlign: "center",
            color: idx === 2 ? ouroClaro : cores.branco,
            transform: `scale(${1.6 - entra * 0.6 + local * 0.004}) rotate(${(1 - entra) * (idx % 2 ? 6 : -6)}deg)`,
            filter: `blur(${(1 - entra) * 16}px)`,
            opacity: entra,
            textShadow: idx === 2 ? `0 0 60px rgba(226,201,143,.6)` : "none",
            padding: "0 60px",
          }}
        >
          {gancho[idx]}
        </div>
        {/* contador de batidas: três traços */}
        <div style={{ position: "absolute", bottom: 380, display: "flex", gap: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 90, height: 8, borderRadius: 9, backgroundColor: i <= idx ? ouro : "rgba(255,255,255,.15)" }} />
          ))}
        </div>
      </AbsoluteFill>
      {/* flash crescente antes do drop */}
      <AbsoluteFill style={{ backgroundColor: ouroClaro, opacity: interpolate(f, [78, 90], [0, 0.9], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// ---------- 2. Revelação do logo (90–282) ----------
const Revelacao: React.FC<ReelsMatrizProps> = ({ segmento }) => {
  const f = useCurrentFrame();
  const sobe = prog(f, 4, 34); // símbolo sobe de baixo para cima (máscara)
  const nome = prog(f, 40, 26);
  const linha = prog(f, 62, 18);
  const sub = prog(f, 72, 20);
  const b = batida(f);
  return (
    <Cena>
      {/* ondas de choque saindo do símbolo a cada batida */}
      {[0, 16, 32].map((a) => {
        const t = f < a ? 0 : ((f - a) % BATIDA) / BATIDA;
        const d = 300 + t * 1300;
        return (
          <div
            key={a}
            style={{
              position: "absolute",
              left: 540 - d / 2,
              top: 584 - d / 2,
              width: d,
              height: d,
              borderRadius: 9999,
              border: `${4 - t * 3}px solid ${ouro}`,
              opacity: f < a ? 0 : (1 - t) * 0.55,
            }}
          />
        );
      })}
      {/* símbolo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 490, height: 568, transform: `scale(${1 + b * 0.04}) translateY(${Math.sin(f / 20) * 8}px)` }}>
          <Img
            src={staticFile("clientes/matriz-simbolo.png")}
            style={{
              width: 490,
              height: 568,
              clipPath: `inset(${(1 - sobe) * 100}% 0 0 0)`,
              filter: `drop-shadow(0 0 ${20 + b * 40}px rgba(226,201,143,.55))`,
            }}
          />
          {/* lâmina de luz acompanhando a máscara */}
          <div
            style={{
              position: "absolute",
              left: -60,
              right: -60,
              top: `${(1 - sobe) * 100}%`,
              height: 8,
              borderRadius: 8,
              backgroundColor: "#FFF4D6",
              boxShadow: `0 0 40px 12px ${ouroClaro}`,
              opacity: sobe > 0 && sobe < 0.995 ? 1 : 0,
            }}
          />
          {/* brilho atravessando o símbolo */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              WebkitMaskImage: `url(${staticFile("clientes/matriz-simbolo.png")})`,
              WebkitMaskSize: "100% 100%",
              maskImage: `url(${staticFile("clientes/matriz-simbolo.png")})`,
              maskSize: "100% 100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -100,
                bottom: -100,
                width: 140,
                left: interpolate((f - 40) % 96, [0, 40], [-200, 700], { extrapolateRight: "clamp" }),
                transform: "rotate(20deg)",
                background: "linear-gradient(90deg, transparent, rgba(255,250,235,.9), transparent)",
                opacity: f > 40 ? 1 : 0,
              }}
            />
          </div>
        </div>
      </div>
      {/* nome: letras entram uma a uma (recortes do logotipo) */}
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 880, height: 222 }}>
          <Img
            src={staticFile("clientes/matriz-nome.png")}
            style={{
              width: 880,
              height: 222,
              clipPath: `inset(0 ${(1 - nome) * 100}% 0 0)`,
              transform: `translateY(${(1 - nome) * 20}px)`,
              WebkitMaskImage: `linear-gradient(90deg, black ${nome * 100}%, transparent ${nome * 100 + 10}%)`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: 540 - 220 * linha,
          width: 440 * linha,
          height: 4,
          backgroundColor: ouro,
          boxShadow: `0 0 20px ${ouro}`,
        }}
      />
      <div style={{ position: "absolute", top: 1340, left: 0, right: 0, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)` }}>
        <Kicker em={72} cor={cores.branco} style={{ fontSize: 32 }}>
          UMA MARCA CRIADA DO ZERO
        </Kicker>
        <div style={{ textAlign: "center", fontFamily: fontes.texto, fontSize: 32, color: ouroClaro, marginTop: 10, letterSpacing: "0.1em" }}>
          pela <span style={{ fontFamily: fontes.script, fontSize: 52, color: cores.amareloVivo, letterSpacing: 0 }}>Café e Criar</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, opacity: prog(f, 100, 14) }}>
        <Kicker em={100}>{`CASE  •  ${segmento}`}</Kicker>
      </div>
    </Cena>
  );
};

// ---------- 3. Anatomia do símbolo (282–522): cada detalhe tem um porquê ----------
const Anatomia: React.FC<ReelsMatrizProps> = ({ anatomia }) => {
  const f = useCurrentFrame();
  const W = 560;
  const H = W * (284 / 245);
  const ox = 260;
  const oy = 520;
  const ativo = Math.min(anatomia.length - 1, Math.max(0, Math.floor((f - 24) / BATIDA)));
  return (
    <Cena>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0 }}>
        <Kicker em={2}>POR TRÁS DO SÍMBOLO</Kicker>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.branco, textAlign: "center", marginTop: 14 }}>
          Cada detalhe
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: ouroClaro, textAlign: "center" }}>
          tem um porquê.
        </Revela>
      </div>
      {/* símbolo com lupa no detalhe ativo */}
      <div style={{ position: "absolute", left: ox, top: oy, width: W, height: H }}>
        <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: W, height: H, opacity: f < 24 ? 1 : 0.35 }} />
        {anatomia.map((a, i) => {
          if (i !== ativo || f < 24) return null;
          const local = f - 24 - i * BATIDA;
          const p = prog(local, 0, 10);
          const r = 120 * p;
          return (
            <div key={i}>
              {/* recorte iluminado do detalhe */}
              <Img
                src={staticFile("clientes/matriz-simbolo.png")}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: W,
                  height: H,
                  clipPath: `circle(${r}px at ${a.x * W}px ${a.y * H}px)`,
                  filter: `drop-shadow(0 0 18px ${ouroClaro}) brightness(1.25)`,
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
                  border: `4px solid ${ouroClaro}`,
                  boxShadow: `0 0 30px ${ouro}`,
                  transform: `rotate(${f * 3}deg)`,
                  borderStyle: "dashed",
                }}
              />
            </div>
          );
        })}
      </div>
      {/* legenda do detalhe ativo */}
      {f >= 24 && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 1330 }}>
          {anatomia.map((a, i) => {
            if (i !== ativo) return null;
            const local = f - 24 - i * BATIDA;
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
                  <Pop em={local < 0 ? 0 : f - local} de={0.2}>
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 99,
                        backgroundColor: ouro,
                        color: noite,
                        fontFamily: fontes.titulo,
                        fontWeight: 800,
                        fontSize: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </div>
                  </Pop>
                  <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.2em", color: ouro, opacity: prog(local, 2, 8) }}>{a.parte}</div>
                </div>
                <div
                  style={{
                    fontFamily: fontes.titulo,
                    fontWeight: 800,
                    fontSize: 88,
                    color: cores.branco,
                    marginTop: 16,
                    transform: `translateY(${(1 - prog(local, 4, 10)) * 60}px)`,
                    opacity: prog(local, 4, 10),
                  }}
                >
                  {a.sentido}
                </div>
              </div>
            );
          })}
          {/* indicador de progresso */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
            {anatomia.map((_, i) => (
              <div key={i} style={{ width: i === ativo ? 70 : 22, height: 22, borderRadius: 22, backgroundColor: i <= ativo ? ouro : "rgba(255,255,255,.2)" }} />
            ))}
          </div>
        </div>
      )}
    </Cena>
  );
};

// ---------- 4. Importância (522–714): marca não é só logo ----------
const Importancia: React.FC<ReelsMatrizProps> = ({ importancia }) => {
  const f = useCurrentFrame();
  const riscado = prog(f, 26, 12);
  return (
    <Cena claro>
      <Faixa texto="IDENTIDADE  •  POSICIONAMENTO  •  CONFIANÇA" top={90} rot={-4} fundo={noite} cor={ouroClaro} />
      <div style={{ position: "absolute", top: 330, left: 80, right: 80 }}>
        <Kicker em={2} cor="#8A7140" style={{ textAlign: "left" }}>
          POR QUE CRIAR A MARCA?
        </Kicker>
        <div style={{ position: "relative", marginTop: 16 }}>
          <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1, color: noite }}>
            Marca não é
          </Revela>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1, color: noite }}>
              só um logo.
            </Revela>
            <div style={{ position: "absolute", left: -10, top: "48%", height: 14, width: `${riscado * 104}%`, backgroundColor: ouro, borderRadius: 8, transform: "rotate(-3deg)" }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 820, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 34 }}>
        {importancia.map((t, i) => {
          const em = 42 + i * 40;
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
                boxShadow: `0 ${20 + batida(f) * 20}px 50px rgba(80,60,20,.16)`,
                transform: `translateX(${(1 - p) * (i % 2 ? 1100 : -1100)}px) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
              }}
            >
              <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: ouro, minWidth: 130 }}>0{i + 1}</div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 60, lineHeight: 1.05, color: noite }}>{t}</div>
            </div>
          );
        })}
      </div>
    </Cena>
  );
};

// ---------- 5. Comunicação correta (714–858): a mesma voz em todo lugar ----------
const CartaoVisita: React.FC = () => (
  <div style={{ width: 600, height: 340, borderRadius: 22, backgroundColor: noite2, boxShadow: "0 30px 70px rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 30, border: `2px solid rgba(189,157,96,.35)` }}>
    <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: 130 }} />
    <Img src={staticFile("clientes/matriz-nome.png")} style={{ width: 330 }} />
  </div>
);

const PerfilInsta: React.FC<{ f: number; cliente: string; segmento: string }> = ({ f, cliente, segmento }) => (
  <div style={{ width: 600, borderRadius: 28, backgroundColor: cores.branco, boxShadow: "0 30px 70px rgba(0,0,0,.45)", padding: 34 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      <div style={{ width: 150, height: 150, borderRadius: 999, padding: 6, background: `conic-gradient(from ${f * 4}deg, ${ouro}, ${ouroClaro}, ${ouro})` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 999, backgroundColor: noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: 80 }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[220, 300, 180].map((w, i) => (
          <div key={i} style={{ width: w, height: 18, borderRadius: 9, backgroundColor: i === 0 ? ouro : cores.borda }} />
        ))}
      </div>
    </div>
    <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, color: noite, marginTop: 20 }}>
      {cliente} {segmento.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 20 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ aspectRatio: "1", backgroundColor: i % 2 ? ouro : noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: 60, opacity: i % 2 ? 0 : 0.9 }} />
        </div>
      ))}
    </div>
  </div>
);

const Assinatura: React.FC<{ site: string }> = ({ site }) => (
  <div style={{ width: 600, borderRadius: 22, backgroundColor: "#F7F4EC", boxShadow: "0 30px 70px rgba(0,0,0,.45)", padding: "30px 34px", display: "flex", gap: 26, alignItems: "center" }}>
    <div style={{ width: 120, height: 120, borderRadius: 20, backgroundColor: noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: 70 }} />
    </div>
    <div style={{ fontFamily: fontes.texto, fontSize: 24, color: cores.cinza700, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontWeight: 600, fontSize: 30, color: noite }}>Assinatura de e-mail</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Icone icone={faGlobe} tamanho={22} cor={ouro} /> {site}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Icone icone={faEnvelope} tamanho={22} cor={ouro} />
        <Icone icone={faPhone} tamanho={22} cor={ouro} />
        <Icone icone={faInstagram} tamanho={22} cor={ouro} />
      </div>
    </div>
  </div>
);

const Comunicacao: React.FC<ReelsMatrizProps> = ({ cliente, segmento, site }) => {
  const f = useCurrentFrame();
  const flut = (i: number) => Math.sin((f + i * 25) / 14) * 12;
  const itens = [
    { el: <CartaoVisita />, x: 60, y: 560, rot: -6, em: 8 },
    { el: <PerfilInsta f={f} cliente={cliente} segmento={segmento} />, x: 420, y: 780, rot: 5, em: 20 },
    { el: <Assinatura site={site} />, x: 70, y: 1520, rot: -3, em: 32 },
  ];
  return (
    <Cena>
      <div style={{ position: "absolute", top: 150, left: 70, right: 70 }}>
        <Kicker em={2} style={{ textAlign: "left" }}>
          COMUNICAÇÃO CORRETA
        </Kicker>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 86, lineHeight: 1.02, color: cores.branco, marginTop: 10 }}>
          A mesma voz
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 86, lineHeight: 1.02, color: ouroClaro }}>
          em todo lugar.
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
              top: it.y + flut(i) + (1 - p) * 900,
              transform: `rotate(${it.rot + (1 - p) * 25}deg) scale(${0.95 + batida(f) * 0.03})`,
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

// ---------- 6. O site (858–1050): endereço digitado, telas rolando no celular, serviços em volta ----------
const Site: React.FC<ReelsMatrizProps> = ({ site, telas, servicos, chamadaSite }) => {
  const f = useCurrentFrame();
  const letras = Math.floor(interpolate(f, [8, 34], [0, site.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cursor = Math.floor(f / 6) % 2 === 0;
  const celular = prog(f, 26, 16);
  const TELA_W = 504;
  const TELA_H = 1050;
  const altura = TELA_W * (1270 / 630); // altura de cada print na largura da tela
  const total = Math.max(0, telas.length * altura - TELA_H);
  const rolagem = interpolate(f, [72, 186], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  return (
    <Cena>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0 }}>
        <Kicker em={2}>E A MARCA GANHOU CASA</Kicker>
      </div>
      {/* barra de endereço */}
      <div style={{ position: "absolute", top: 200, left: 80, right: 80, height: 104, borderRadius: 999, backgroundColor: cores.branco, display: "flex", alignItems: "center", gap: 24, padding: "0 40px", boxShadow: `0 0 ${30 + batida(f) * 40}px rgba(226,201,143,.45)` }}>
        <Icone icone={faLock} tamanho={36} cor={ouro} />
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 46, color: noite }}>
          {site.slice(0, letras)}
          <span style={{ color: ouro, opacity: cursor ? 1 : 0 }}>|</span>
        </div>
      </div>
      {/* celular */}
      <div
        style={{
          position: "absolute",
          left: 540 - 270,
          top: 380 + (1 - celular) * 1500,
          width: 540,
          height: TELA_H + 36,
          borderRadius: 70,
          backgroundColor: "#050507",
          padding: 18,
          boxShadow: `0 40px 100px rgba(0,0,0,.6), 0 0 0 3px ${ouro}`,
          transform: `rotate(${(1 - celular) * 12 + Math.sin(f / 20) * 1.2}deg)`,
        }}
      >
        <div style={{ position: "relative", width: TELA_W, height: TELA_H, borderRadius: 54, overflow: "hidden", backgroundColor: cores.branco }}>
          {telas.length > 0 ? (
            <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${-rolagem * total}px)` }}>
              {telas.map((t) => (
                <Img key={t} src={staticFile(t)} style={{ width: TELA_W, height: altura, display: "block" }} />
              ))}
            </div>
          ) : (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40, padding: 40, backgroundColor: noite2 }}>
              <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ width: 240 }} />
              <Img src={staticFile("clientes/matriz-nome.png")} style={{ width: 400 }} />
            </AbsoluteFill>
          )}
          <div style={{ position: "absolute", top: 14, left: "50%", marginLeft: -70, width: 140, height: 34, borderRadius: 30, backgroundColor: "#050507" }} />
        </div>
      </div>
      {/* frase do site */}
      <div style={{ position: "absolute", left: 40, top: 560, opacity: 1 - prog(f, 84, 10) }}>
      <Pop em={36} de={0.3} style={{ transform: "rotate(-6deg)" }}>
        <div style={{ backgroundColor: ouro, color: noite, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 52, padding: "12px 34px", borderRadius: 999, boxShadow: "0 20px 40px rgba(0,0,0,.4)" }}>
          {chamadaSite}
        </div>
      </Pop>
      </div>
      {/* serviços entram dos dois lados enquanto as telas rolam */}
      {servicos.map((sv, i) => {
        const em = 80 + i * 18;
        const p = prog(f, em, 12);
        const esq = i % 2 === 0;
        return (
          <div
            key={sv}
            style={{
              position: "absolute",
              top: 1020 + i * 120 + Math.sin((f + i * 20) / 15) * 6,
              left: esq ? 40 : undefined,
              right: esq ? undefined : 40,
              transform: `translateX(${(1 - p) * (esq ? -1200 : 1200)}px) rotate(${esq ? -2 : 2}deg)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              backgroundColor: noite2,
              border: `2px solid ${ouro}`,
              borderRadius: 999,
              padding: "16px 30px",
              boxShadow: "0 18px 40px rgba(0,0,0,.55)",
            }}
          >
            <Icone icone={faCheck} tamanho={34} cor={ouroClaro} />
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 36, color: cores.branco }}>{sv}</div>
          </div>
        );
      })}
    </Cena>
  );
};

// ---------- 7. Por que contratar quem entende (1050–1242) ----------
const Especialista: React.FC<ReelsMatrizProps> = ({ especialista }) => {
  const f = useCurrentFrame();
  return (
    <Cena>
      <div style={{ position: "absolute", top: 140, left: 70, right: 70 }}>
        <Kicker em={2}>POR QUE CONTRATAR QUEM ENTENDE?</Kicker>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60, fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.12em" }}>
          <div style={{ color: "#9A9AA3", width: "46%", textAlign: "center", opacity: prog(f, 8, 10) }}>FAZER SOZINHO</div>
          <div style={{ color: ouroClaro, width: "46%", textAlign: "center", opacity: prog(f, 8, 10) }}>COM ESPECIALISTA</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 400, left: 50, right: 50, display: "flex", flexDirection: "column", gap: 30 }}>
        {especialista.map((e, i) => {
          const em = 16 + i * 30;
          const pe = prog(f, em, 10);
          const pd = prog(f, em + 10, 12);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", gap: 20 }}>
              <div
                style={{
                  width: "47%",
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,.06)",
                  border: "2px solid rgba(255,255,255,.12)",
                  padding: "28px 26px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: pe * (1 - pd * 0.45),
                  transform: `translateX(${(1 - pe) * -300}px)`,
                  filter: `grayscale(1)`,
                }}
              >
                <Icone icone={faXmark} tamanho={44} cor="#C25B5B" />
                <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 36, lineHeight: 1.15, color: "#C9C9D1", textDecoration: pd > 0.5 ? "line-through" : "none" }}>{e.sozinho}</div>
              </div>
              <div
                style={{
                  width: "47%",
                  borderRadius: 24,
                  backgroundColor: ouro,
                  padding: "28px 26px",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: pd,
                  transform: `translateX(${(1 - pd) * 300}px) scale(${1 + (pd < 1 ? 0 : batida(f) * 0.03)})`,
                  boxShadow: `0 0 ${30 * pd}px rgba(226,201,143,.5)`,
                }}
              >
                <Icone icone={faCheck} tamanho={44} cor={noite} />
                <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 36, lineHeight: 1.15, color: noite }}>{e.certo}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1420, left: 70, right: 70, textAlign: "center" }}>
        <Revela em={140} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: cores.branco }}>
          Marca bem feita
        </Revela>
        <Revela em={146} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: ouroClaro }}>
          é investimento.
        </Revela>
      </div>
    </Cena>
  );
};

// ---------- 8. Chamada (1242–1410): assinatura Café e Criar ----------
const Chamada: React.FC<ReelsMatrizProps> = ({ convite, cta, arroba, cliente, segmento, site }) => {
  const f = useCurrentFrame();
  const brilho = Math.exp(-(f % 24) / 5);
  const vira = prog(f, 0, 16);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      {/* raios amarelos da Café e Criar */}
      <AbsoluteFill
        style={{
          width: 3000,
          height: 3000,
          left: -960,
          top: -540,
          background: `repeating-conic-gradient(from ${-f * 0.5}deg at 50% 50%, rgba(255,228,0,.08) 0deg 6deg, transparent 6deg 18deg)`,
        }}
      />
      <Particulas cor={cores.amareloVivo} qtd={36} seed="c" />
      {/* cortina dourada que revela o preto */}
      <AbsoluteFill style={{ backgroundColor: ouro, clipPath: `inset(0 0 ${vira * 100}% 0)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 46, padding: "0 70px" }}>
        <Pop em={10} de={0.6}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, backgroundColor: noite2, border: `2px solid ${ouro}`, borderRadius: 999, padding: "16px 36px" }}>
            <Img src={staticFile("clientes/matriz-simbolo.png")} style={{ height: 60 }} />
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, color: ouroClaro, letterSpacing: "0.12em" }}>
              {cliente.toUpperCase()} {segmento}
            </div>
          </div>
        </Pop>
        <div style={{ fontFamily: fontes.texto, fontSize: 30, color: cores.cinza500, marginTop: -26, opacity: prog(f, 16, 10) }}>{site}</div>
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
      {/* fade final */}
      <AbsoluteFill style={{ backgroundColor: cores.preto, opacity: interpolate(f, [150, 168], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// Linha do tempo: [início, duração, cena]
const CENAS: [number, number, React.FC<ReelsMatrizProps>][] = [
  [0, 90, Gancho],
  [90, 192, Revelacao],
  [282, 240, Anatomia],
  [522, 192, Importancia],
  [714, 144, Comunicacao],
  [858, 192, Site],
  [1050, 192, Especialista],
  [1242, 168, Chamada],
];

export const ReelsMatriz: React.FC<ReelsMatrizProps> = (props) => {
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
