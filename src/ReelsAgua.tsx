import { faDroplet, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels case de marca com tema água (HJ Distribuidora · Água Potável, 08/11/2026), 30 fps, renderizado sem som.
// Conceito: a marca nasce de uma gota. A gota cai e faz ondas, a água sobe e a logo emerge,
// o símbolo é explicado por partes, a paleta cai em gotas coloridas e as aplicações surgem com a água subindo.
// No fim emenda-se a intro da logo Café e Criar (IntroLogo mudo) com ffmpeg.
export const AGUA_FPS = 30;
export const AGUA_DURACAO = 1035;

export type ReelsAguaProps = {
  cliente: string;
  segmento: string;
  logo: string | null; // versão para fundo escuro, em public/clientes/ (null = logotipo em texto)
  logoClaro: string | null; // versão colorida para fundo claro
  simbolo: string | null; // símbolo colorido sozinho
  logoAltura: number;
  site: string;
  paletaTema: { fundo: string; profundo: string; agua: string; claro: string; espuma: string };
  gancho: [string, string];
  anatomia: { parte: string; sentido: string; x: number; y: number }[]; // x, y: ponto no símbolo (0–1)
  paleta: { nome: string; hex: string; sentido: string }[];
  aplicacoes: { foto: string; nome: string }[];
  fecho: [string, string];
};

export const reelsAguaPadrao: ReelsAguaProps = {
  cliente: "HJ Distribuidora",
  segmento: "ÁGUA POTÁVEL",
  logo: "clientes/hj-logo-branco.png",
  logoClaro: "clientes/hj-logo-completo.png",
  simbolo: "clientes/hj-simbolo.png",
  logoAltura: 300,
  site: "hjagua.com.br",
  paletaTema: { fundo: "#041530", profundo: "#0C2C54", agua: "#2C7390", claro: "#65C8CB", espuma: "#E9F7F8" },
  gancho: ["Toda grande marca", "começa com uma gota."],
  anatomia: [
    { parte: "A GOTA", sentido: "Água potável, pura e confiável", x: 0.5, y: 0.04 },
    { parte: "A ONDA", sentido: "O movimento de quem leva água até você", x: 0.42, y: 0.6 },
    { parte: "O DEGRADÊ", sentido: "Do azul profundo ao turquesa: solidez e frescor", x: 0.93, y: 0.62 },
  ],
  paleta: [
    { nome: "Azul profundo", hex: "#0C2C54", sentido: "Confiança" },
    { nome: "Azul oceano", hex: "#2C7390", sentido: "Movimento" },
    { nome: "Turquesa", hex: "#65C8CB", sentido: "Frescor" },
  ],
  aplicacoes: [
    { foto: "clientes/hj-caminhao.jpg", nome: "Frota" },
    { foto: "clientes/hj-outdoor.jpg", nome: "Outdoor" },
    { foto: "clientes/hj-cartao.jpg", nome: "Cartão de visita" },
    { foto: "clientes/hj-polo.jpg", nome: "Uniforme" },
  ],
  fecho: ["Marca que flui", "com o seu negócio."],
};

const W = 1080;
const H = 1920;

// Contorno de onda (seno duplo) de x=0 a 1080 na altura y, fechado até o fundo.
const onda = (f: number, y: number, amp: number, comp: number, vel: number, fase = 0) => {
  let d = `M 0 ${H + 40}`;
  for (let x = 0; x <= W; x += 20) {
    const yy = y + Math.sin((x / comp) * Math.PI * 2 + f * vel + fase) * amp + Math.sin((x / (comp * 0.47)) * Math.PI * 2 - f * vel * 1.3 + fase) * amp * 0.35;
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return d + ` L ${W} ${H + 40} Z`;
};

// Gota em SVG (ponta em cima).
const Gota: React.FC<{ x: number; y: number; tam: number; cor: string; brilho?: string }> = ({ x, y, tam, cor, brilho = "rgba(255,255,255,.55)" }) => (
  <svg width={tam} height={tam * 1.35} viewBox="0 0 100 135" style={{ position: "absolute", left: x - tam / 2, top: y - tam * 1.35 }}>
    <path d="M50 0 C 50 0, 96 62, 96 88 A 46 46 0 0 1 4 88 C 4 62, 50 0, 50 0 Z" fill={cor} />
    <ellipse cx="34" cy="88" rx="9" ry="16" fill={brilho} transform="rotate(20 34 88)" />
  </svg>
);

// Bolhas subindo.
const Bolhas: React.FC<{ qtd?: number; seed?: string; cor?: string; limite?: number }> = ({ qtd = 40, seed = "b", cor = "rgba(232,248,255,.55)", limite = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: qtd }).map((_, i) => {
        const r = 4 + random(`${seed}r${i}`) * 18;
        const vel = 2 + random(`${seed}v${i}`) * 5;
        const y = H + 60 - ((random(`${seed}y${i}`) * 2200 + f * vel) % 2200);
        if (y < limite) return null;
        const x = random(`${seed}x${i}`) * W + Math.sin(f / 14 + i * 1.7) * (10 + r);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `2px solid ${cor}`,
              background: "radial-gradient(circle at 32% 30%, rgba(255,255,255,.7) 0 12%, transparent 30%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Raios de luz atravessando a água (cáusticas).
const Luz: React.FC<{ cor: string }> = ({ cor }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const x = 80 + i * 150 + Math.sin(f / 40 + i) * 60;
        const op = 0.06 + 0.07 * Math.abs(Math.sin(f / 25 + i * 2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: -200,
              width: 90 + (i % 3) * 40,
              height: 2400,
              background: `linear-gradient(180deg, ${cor} 0%, transparent 70%)`,
              opacity: op,
              transform: `rotate(${12 + Math.sin(f / 60 + i) * 4}deg)`,
              transformOrigin: "top center",
              filter: "blur(18px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Logo da cliente (imagem ou logotipo em texto). claro = versão para fundo claro.
const Logo: React.FC<{ p: ReelsAguaProps; altura?: number; cor?: string; claro?: boolean }> = ({ p, altura, cor, claro }) => {
  const h = altura ?? p.logoAltura;
  const arq = claro ? p.logoClaro ?? p.logo : p.logo;
  if (arq) return <Img src={staticFile(arq)} style={{ height: h }} />;
  const [a, ...b] = p.cliente.split(" ");
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: h * 0.08, fontFamily: fontes.titulo, fontWeight: 800, lineHeight: 1, color: cor ?? p.paletaTema.espuma }}>
      <span style={{ fontSize: h * 0.62 }}>{a}</span>
      <span style={{ fontSize: h * 0.62, color: cor ?? p.paletaTema.claro }}>{b.join(" ")}</span>
      <Icone icone={faDroplet} tamanho={h * 0.36} cor={cor ?? p.paletaTema.claro} style={{ alignSelf: "flex-start", marginTop: h * 0.08 }} />
    </div>
  );
};

const Kicker: React.FC<{ texto: string; cor: string; em?: number }> = ({ texto, cor, em = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.22em", color: cor, opacity: prog(f, em, 10) }}>{texto}</div>
  );
};

// ---------- 1. Gancho (0–105): gota cai e faz ondas ----------
const SUPERF = 1180;
const Gancho: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const QUEDA = 26;
  const yGota = interpolate(f, [0, QUEDA], [-80, SUPERF], { extrapolateRight: "clamp", easing: (x) => x * x });
  const impacto = f - QUEDA;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${t.fundo} 0%, ${t.profundo} 100%)` }}>
      <Luz cor={t.claro} />
      {/* superfície */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="agua1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={t.agua} stopOpacity="0.9" />
            <stop offset="1" stopColor={t.fundo} />
          </linearGradient>
        </defs>
        <path d={onda(f, SUPERF + 10, 6 + Math.max(0, 22 * Math.exp(-impacto / 18)) * (impacto > 0 ? 1 : 0), 520, 0.06)} fill="url(#agua1)" />
        {/* anéis de onda */}
        {impacto > 0 &&
          [0, 9, 18, 27].map((atraso, i) => {
            const k = impacto - atraso;
            if (k < 0) return null;
            const rx = k * 16;
            return <ellipse key={i} cx={540} cy={SUPERF + 10} rx={rx} ry={rx * 0.16} fill="none" stroke={t.espuma} strokeWidth={5 - i} opacity={Math.max(0, 0.9 - k / 60)} />;
          })}
      </svg>
      {/* respingos */}
      {impacto > 0 &&
        impacto < 40 &&
        Array.from({ length: 14 }).map((_, i) => {
          const ang = Math.PI * (0.15 + 0.7 * random(`s${i}`));
          const v = 14 + random(`sv${i}`) * 16;
          const x = 540 + Math.cos(ang) * v * impacto * (random(`sd${i}`) > 0.5 ? 1 : -1);
          const y = SUPERF - Math.sin(ang) * v * impacto + 0.9 * impacto * impacto;
          if (y > SUPERF + 10) return null;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14, height: 14, borderRadius: "50%", backgroundColor: t.espuma, opacity: 1 - impacto / 40 }} />;
        })}
      {f < QUEDA && <Gota x={540} y={yGota} tam={70} cor={t.claro} />}
      <AbsoluteFill style={{ top: 1360, alignItems: "center", textAlign: "center", padding: "0 70px" }}>
        <Revela em={30} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 84, lineHeight: 1.04, color: cores.branco }}>
          {p.gancho[0]}
        </Revela>
        <Revela em={37} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 84, lineHeight: 1.04, color: t.claro }}>
          {p.gancho[1]}
        </Revela>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 420, alignItems: "center" }}>
        <Kicker texto="CASE · CRIAÇÃO DE MARCA" cor={t.claro} em={6} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 2. Revelação (105–255): a água sobe e a logo emerge ----------
const Revelacao: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const nivel = interpolate(f, [0, 34], [SUPERF, -120], { extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const sobe = prog(f, 24, 30);
  const flutua = Math.sin(f / 18) * 10;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${t.fundo} 0%, ${t.profundo} 100%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <path d={onda(f, nivel + 40, 26, 640, 0.08, 1)} fill={t.profundo} opacity={0.9} />
        <path d={onda(f, nivel, 34, 520, 0.1)} fill={t.agua} opacity={0.85} />
      </svg>
      <Luz cor={t.espuma} />
      <Bolhas qtd={46} seed="rv" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        <div style={{ transform: `translateY(${(1 - sobe) * 700 + flutua}px) scale(${0.85 + 0.15 * sobe})`, filter: `drop-shadow(0 20px 60px rgba(0,0,0,.35)) blur(${(1 - sobe) * 6}px)` }}>
          <Logo p={p} />
        </div>
        <div style={{ opacity: prog(f, 56, 14), transform: `translateY(${(1 - prog(f, 56, 14)) * 30}px)` }}>
          <Kicker texto={p.segmento} cor={t.espuma} em={56} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1500, alignItems: "center", textAlign: "center" }}>
        <Revela em={70} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 56, color: cores.branco }}>
          Uma marca criada do zero
        </Revela>
        <Revela em={76} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 56, color: t.espuma }}>
          pela Café e Criar.
        </Revela>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. Símbolo (255–465): o símbolo numa bolha de luz, explicado por partes ----------
const Simbolo: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const T = 620; // tamanho do símbolo
  const x0 = (W - T) / 2;
  const y0 = 520;
  const entra = prog(f, 0, 22);
  const flutua = Math.sin(f / 22) * 8;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, #FFFFFF 0%, ${t.espuma} 45%, ${t.claro} 120%)` }}>
      <Bolhas qtd={26} seed="si" cor={`${t.agua}66`} />
      <AbsoluteFill style={{ top: 200, alignItems: "center" }}>
        <Kicker texto="POR TRÁS DO SÍMBOLO" cor={t.agua} />
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 80, color: t.profundo, marginTop: 10 }}>
          Nada está por acaso
        </Revela>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: x0, top: y0 + flutua, width: T, height: T, transform: `scale(${0.7 + 0.3 * entra})`, opacity: entra }}>
        {p.simbolo ? <Img src={staticFile(p.simbolo)} style={{ width: T, height: T, objectFit: "contain" }} /> : <Logo p={p} altura={T * 0.5} claro />}
      </div>
      {p.anatomia.map((a, i) => {
        const em = 30 + i * 52;
        const s = prog(f, em, 16);
        const px = x0 + a.x * T;
        const py = y0 + a.y * T + flutua;
        const ty = 1210 + i * 215;
        return (
          <div key={i} style={{ opacity: f < em ? 0 : 1 }}>
            {/* ponto pulsando no símbolo */}
            <div style={{ position: "absolute", left: px - 20, top: py - 20, width: 40, height: 40, borderRadius: "50%", backgroundColor: t.claro, border: `5px solid #fff`, transform: `scale(${s * (1 + 0.15 * Math.sin(f / 5))})`, boxShadow: `0 0 0 ${10 + (f % 30)}px ${t.claro}${Math.round(40 * (1 - (f % 30) / 30)).toString(16).padStart(2, "0")}` }} />
            <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              <line x1={px} y1={py} x2={interpolate(s, [0, 1], [px, 110])} y2={interpolate(s, [0, 1], [py, ty + 10])} stroke={t.agua} strokeWidth={3} strokeDasharray="8 8" />
            </svg>
            <div style={{ position: "absolute", left: 110, right: 70, top: ty, opacity: prog(f, em + 8, 12), transform: `translateX(${(1 - prog(f, em + 8, 12)) * -40}px)` }}>
              <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: t.agua }}>{a.parte}</div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 46, lineHeight: 1.08, color: t.profundo }}>{a.sentido}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 4. Paleta (465–615): gotas coloridas caem e viram cores ----------
const Paleta: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const n = p.paleta.length;
  const larg = W / n;
  return (
    <AbsoluteFill style={{ backgroundColor: t.espuma }}>
      <AbsoluteFill style={{ top: 200, alignItems: "center" }}>
        <Kicker texto="AS CORES" cor={t.agua} />
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 80, color: t.fundo, marginTop: 10 }}>
          Tiradas da própria água
        </Revela>
      </AbsoluteFill>
      {p.paleta.map((c, i) => {
        const em = 14 + i * 14;
        const queda = interpolate(f, [em, em + 18], [-150, 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
        const k = f - (em + 18);
        const cx = larg * i + larg / 2;
        const enche = prog(f, em + 18, 26);
        return (
          <div key={i}>
            {k < 0 && f >= em && <Gota x={cx} y={queda} tam={60} cor={c.hex} />}
            {/* coluna da cor que enche de baixo para cima a partir do impacto */}
            <div
              style={{
                position: "absolute",
                left: larg * i + 14,
                width: larg - 28,
                top: 760,
                height: 900,
                borderRadius: 40,
                overflow: "hidden",
                opacity: k < 0 ? 0 : 1,
              }}
            >
              <svg width={larg - 28} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
                <path
                  d={(() => {
                    const w = larg - 28;
                    const topo = interpolate(enche, [0, 1], [900, 0]) + Math.sin(f / 9 + i) * 8 * (1 - enche * 0.6);
                    let d = `M 0 900`;
                    for (let x = 0; x <= w; x += 10) d += ` L ${x} ${(topo + Math.sin(x / 40 + f / 6 + i) * 10).toFixed(1)}`;
                    return d + ` L ${w} 900 Z`;
                  })()}
                  fill={c.hex}
                />
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, textAlign: "center", opacity: prog(f, em + 36, 12) }}>
                <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 44, color: cores.branco, lineHeight: 1.05 }}>{c.sentido}</div>
                <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 24, color: "rgba(255,255,255,.85)", marginTop: 12 }}>{c.nome}</div>
                <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,.85)", letterSpacing: "0.08em" }}>{c.hex.toUpperCase()}</div>
              </div>
            </div>
            {/* anel de impacto */}
            {k >= 0 && k < 24 && (
              <div
                style={{
                  position: "absolute",
                  left: cx - k * 6,
                  top: 760 - k * 1.2,
                  width: k * 12,
                  height: k * 2.4,
                  borderRadius: "50%",
                  border: `3px solid ${c.hex}`,
                  opacity: 1 - k / 24,
                }}
              />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 5. Aplicações (615–885): as fotos surgem com a água subindo ----------
const ondaClip = (f: number, nivel: number, w: number, h: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= w; x += w / 24) pts.push(`${x.toFixed(0)}px ${(nivel + Math.sin(x / 70 + f / 4) * 14).toFixed(1)}px`);
  return `polygon(${pts.join(", ")}, ${w}px ${h}px, 0px ${h}px)`;
};
const Aplicacoes: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const CW = 960;
  const CH = 540;
  const POR = 135; // cada par de fotos
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${t.profundo} 0%, ${t.fundo} 100%)` }}>
      <Luz cor={t.claro} />
      <Bolhas qtd={24} seed="ap" />
      <AbsoluteFill style={{ top: 150, alignItems: "center" }}>
        <Kicker texto="A MARCA NA PRÁTICA" cor={t.claro} />
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 76, color: cores.branco, marginTop: 10 }}>
          Por onde a água passa
        </Revela>
      </AbsoluteFill>
      {p.aplicacoes.map((a, i) => {
        const par = Math.floor(i / 2);
        const local = f - par * POR - (i % 2) * 14 - 8;
        if (local < 0 || f - par * POR > POR + 12) return null;
        const sobe = prog(local, 0, 26);
        const sai = prog(f - par * POR, POR - 10, 14);
        const top = 440 + (i % 2) * 650;
        const zoom = 1.08 - 0.08 * prog(local, 0, POR);
        return (
          <div key={a.foto} style={{ position: "absolute", left: 60, top, width: CW, height: CH + 60, transform: `translateX(${sai * (i % 2 ? 1 : -1) * 1200}px)` }}>
            <div style={{ position: "absolute", width: CW, height: CH, borderRadius: 36, overflow: "hidden", clipPath: ondaClip(f, CH * (1 - sobe) - 20 * (1 - sobe), CW, CH), boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
              <Img src={staticFile(a.foto)} style={{ width: CW, height: CH, objectFit: "cover", transform: `scale(${zoom})` }} />
            </div>
            <Pop em={par * POR + (i % 2) * 14 + 30} style={{ position: "absolute", left: 30, top: CH - 34, backgroundColor: t.claro, color: t.fundo, borderRadius: 999, padding: "12px 30px", fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, display: "flex", alignItems: "center", gap: 12 }}>
              <Icone icone={faDroplet} tamanho={28} cor={t.fundo} />
              {a.nome}
            </Pop>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 6. Fecho (825–990): mensagem final e onda que leva para a intro ----------
const Fecho: React.FC<ReelsAguaProps> = (p) => {
  const f = useCurrentFrame();
  const t = p.paletaTema;
  const fim = 150 - 30;
  const engole = interpolate(f, [fim, fim + 26], [H + 120, -160], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${t.agua} 0%, ${t.profundo} 60%, ${t.fundo} 100%)` }}>
      <Luz cor={t.espuma} />
      <Bolhas qtd={36} seed="fe" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 60, padding: "0 70px", textAlign: "center" }}>
        <Pop em={4} de={0.7}>
          <div style={{ transform: `translateY(${Math.sin(f / 18) * 10}px)` }}>
            <Logo p={p} altura={p.logoAltura * 0.8} />
          </div>
        </Pop>
        <div>
          <Revela em={20} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: cores.branco }}>
            {p.fecho[0]}
          </Revela>
          <Revela em={27} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: t.claro }}>
            {p.fecho[1]}
          </Revela>
        </div>
        <Pop em={46} style={{ display: "flex", alignItems: "center", gap: 14, border: `2px solid ${t.espuma}`, borderRadius: 999, padding: "14px 34px" }}>
          <Icone icone={faGlobe} tamanho={40} cor={t.espuma} />
          <span style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 38, color: t.espuma }}>{p.site}</span>
        </Pop>
      </AbsoluteFill>
      {/* onda escura sobe e entrega para a intro Café e Criar (fundo preto) */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <path d={onda(f, engole, 40, 540, 0.15)} fill={cores.preto} />
      </svg>
    </AbsoluteFill>
  );
};

const CENAS: [number, number, React.FC<ReelsAguaProps>][] = [
  [0, 105, Gancho],
  [105, 150, Revelacao],
  [255, 210, Simbolo],
  [465, 150, Paleta],
  [615, 270, Aplicacoes],
  [885, 150, Fecho],
];

export const ReelsAgua: React.FC<ReelsAguaProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: props.paletaTema.fundo }}>
      {CENAS.map(([de, dur, C]) => (
        <Sequence key={de} from={de} durationInFrames={dur}>
          <C {...props} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
