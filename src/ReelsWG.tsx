import { AbsoluteFill, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cores, fontes } from "./marca";
import { prog, Revela } from "./ReelsOferta";

// Reels de case da marca WG Ambiental (remoção de entulho e aluguel de caçambas), 30 fps, renderizado sem som.
// Trilha aplicada depois com ffmpeg: percussao-stomp.mp3 a partir de 14,63 s. A pausa da faixa termina
// com a pancada de 16,63 s, que cai no quadro 60 (revelação da marca); o compasso tem ~50 quadros,
// então todos os cortes caem em 60 + 50k. No fim emendamos a intro da logo Café e Criar (intro-9x16).
export const WG_FPS = 30;
export const WG_DURACAO = 1160;
const DROP = 60;
const COMPASSO = 50;

export type ReelsWGProps = {
  logo: string | null; // arquivo em public/clientes/ (null = logotipo provisório desenhado em código)
  cliente: string;
  segmento: string;
  gancho: [string, string];
  identidade: { titulo: string; sentido: string }[];
  numeros: { valor: number; sufixo: string; rotulo: string }[];
  ciclo: string[];
  aplicacoes: string[];
  fecho: [string, string];
};

export const reelsWGPadrao: ReelsWGProps = {
  logo: null,
  cliente: "WG",
  segmento: "AMBIENTAL",
  gancho: ["Toda obra", "gera entulho."],
  identidade: [
    { titulo: "AMARELO", sentido: "A cor da sinalização: atenção e segurança no canteiro" },
    { titulo: "PRETO", sentido: "Força e robustez, como o aço das caçambas" },
    { titulo: "LETRA PESADA", sentido: "Solidez de quem está há 12 anos no mercado" },
  ],
  numeros: [
    { valor: 12, sufixo: "", rotulo: "anos de mercado" },
    { valor: 500, sufixo: "", rotulo: "caçambas de fabricação própria" },
    { valor: 10, sufixo: "", rotulo: "caminhões rodando 24 horas" },
    { valor: 24, sufixo: "h", rotulo: "de atendimento, todos os dias" },
  ],
  ciclo: ["Pedido", "Entrega na obra", "3 a 7 dias na obra", "Retirada", "Destinação", "Triagem"],
  aplicacoes: ["Caçamba", "Caminhão", "Uniforme", "Instagram"],
  fecho: ["Uma marca que trabalha", "tão pesado quanto a empresa."],
};

// Paleta: amarelo e preto da WG (próxima da Café e Criar), concreto e poeira de obra.
const amarelo = cores.amareloVivo;
const preto = "#0B0B0B";
const asfalto = "#17171A";
const concreto = "#8E8A80";
const poeira = "#C9B993";

const pancada = (f: number) => Math.exp(-(f % COMPASSO) / 5);

// ---------- Elementos de obra ----------
const Zebrado: React.FC<{ altura?: number; style?: React.CSSProperties; anda?: number }> = ({ altura = 60, style, anda = 4 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: -200,
        right: -200,
        height: altura,
        backgroundImage: `repeating-linear-gradient(-45deg, ${amarelo} 0 ${altura * 0.7}px, ${preto} ${altura * 0.7}px ${altura * 1.4}px)`,
        backgroundPosition: `${(f * anda) % (altura * 2)}px 0`,
        ...style,
      }}
    />
  );
};

// Caçamba estacionária vista de lado (formato trapézio, nervuras e alças).
export const Cacamba: React.FC<{ largura: number; cor?: string; enche?: number; marca?: React.ReactNode; style?: React.CSSProperties }> = ({
  largura,
  cor = amarelo,
  enche = 0,
  marca,
  style,
}) => {
  const h = largura * 0.5;
  return (
    <div style={{ position: "relative", width: largura, height: h, ...style }}>
      <svg viewBox="0 0 400 200" width={largura} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id="corpo">
            <polygon points="18,26 382,26 336,184 64,184" />
          </clipPath>
        </defs>
        {/* entulho saindo por cima */}
        {enche > 0 && (
          <g>
            {Array.from({ length: 16 }).map((_, i) => {
              const x = 40 + random(`e${i}`) * 320;
              const t = 18 + random(`t${i}`) * 26;
              const y = 30 - enche * (8 + random(`y${i}`) * 34);
              return <rect key={i} x={x} y={y} width={t} height={t * 0.8} rx={4} fill={i % 3 ? concreto : "#B5651D"} transform={`rotate(${random(`r${i}`) * 50 - 25} ${x} ${y})`} opacity={enche} />;
            })}
          </g>
        )}
        <polygon points="18,26 382,26 336,184 64,184" fill={cor} />
        <g clipPath="url(#corpo)">
          {[90, 160, 240, 310].map((x) => (
            <rect key={x} x={x} y={20} width={14} height={170} fill="rgba(0,0,0,.18)" />
          ))}
          <rect x={0} y={150} width={400} height={40} fill="rgba(0,0,0,.2)" />
        </g>
        <rect x={8} y={14} width={384} height={18} rx={4} fill={preto} />
        <circle cx={44} cy={110} r={12} fill={preto} />
        <circle cx={356} cy={110} r={12} fill={preto} />
        <rect x={70} y={182} width={70} height={12} fill={preto} />
        <rect x={260} y={182} width={70} height={12} fill={preto} />
      </svg>
      {marca && (
        <div style={{ position: "absolute", left: largura * 0.27, top: h * 0.3, width: largura * 0.46, height: h * 0.42, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {marca}
        </div>
      )}
    </div>
  );
};

// Caminhão poliguindaste (cabine + braços) visto de lado.
const Caminhao: React.FC<{ largura: number; rodas?: number; carga?: React.ReactNode }> = ({ largura, rodas = 0, carga }) => {
  const h = largura * 0.5;
  const roda = (cx: number) => (
    <g transform={`rotate(${rodas} ${cx} 168)`}>
      <circle cx={cx} cy={168} r={26} fill={preto} />
      <circle cx={cx} cy={168} r={11} fill={concreto} />
      <rect x={cx - 2} y={146} width={4} height={44} fill={concreto} />
    </g>
  );
  return (
    <div style={{ position: "relative", width: largura, height: h }}>
      <svg viewBox="0 0 400 200" width={largura} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={20} y={128} width={360} height={22} fill="#2A2A2A" />
        {/* cabine */}
        <path d="M290 60 h58 l30 44 v44 h-88 z" fill={amarelo} />
        <path d="M300 70 h42 l22 32 h-64 z" fill="#9FD3E6" />
        <rect x={290} y={112} width={88} height={10} fill={preto} />
        {/* braços do poliguindaste */}
        <path d="M60 128 L120 40 L140 40 L84 128 z" fill="#333" />
        <path d="M240 128 L200 40 L220 40 L264 128 z" fill="#333" />
        <rect x={110} y={34} width={120} height={10} fill="#333" />
        {roda(80)}
        {roda(140)}
        {roda(330)}
      </svg>
      {carga && <div style={{ position: "absolute", left: largura * 0.06, top: h * 0.2, width: largura * 0.66 }}>{carga}</div>}
    </div>
  );
};

// Nuvem de poeira que explode quando algo cai no chão.
const Poeira: React.FC<{ em: number; x: number; y: number; qtd?: number; raio?: number }> = ({ em, x, y, qtd = 26, raio = 420 }) => {
  const f = useCurrentFrame();
  const t = f - em;
  if (t < 0 || t > 45) return null;
  const p = t / 45;
  return (
    <>
      {Array.from({ length: qtd }).map((_, i) => {
        const ang = Math.PI + random(`pa${em}${i}`) * Math.PI; // só para cima e para os lados
        const dist = raio * (0.3 + random(`pd${em}${i}`) * 0.7) * (1 - Math.pow(1 - p, 3));
        const tam = 60 + random(`pt${em}${i}`) * 140 * (0.5 + p);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(ang) * dist - tam / 2,
              top: y + Math.sin(ang) * dist * 0.45 - tam / 2,
              width: tam,
              height: tam,
              borderRadius: 999,
              background: `radial-gradient(circle, rgba(201,185,147,.55), rgba(201,185,147,0) 70%)`,
              opacity: (1 - p) * 0.9,
            }}
          />
        );
      })}
    </>
  );
};

// Logotipo: arquivo enviado pelo Danilo ou versão provisória desenhada em código.
const Logo: React.FC<ReelsWGProps & { largura: number; sobreAmarelo?: boolean }> = ({ logo, cliente, segmento, largura, sobreAmarelo }) => {
  if (logo) return <Img src={staticFile(logo)} style={{ width: largura, objectFit: "contain" }} />;
  const s = largura / 600;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: largura }}>
      <div
        style={{
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 300 * s,
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          color: sobreAmarelo ? preto : amarelo,
          paddingTop: 30 * s,
        }}
      >
        {cliente}
      </div>
      <div
        style={{
          marginTop: 10 * s,
          backgroundColor: sobreAmarelo ? preto : amarelo,
          color: sobreAmarelo ? amarelo : preto,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 64 * s,
          letterSpacing: "0.3em",
          padding: `${4 * s}px ${20 * s}px ${0}px ${32 * s}px`,
          borderRadius: 8 * s,
        }}
      >
        {segmento}
      </div>
    </div>
  );
};

// Fundo de canteiro: asfalto, grade de obra, faixas zebradas e flash na pancada.
const Canteiro: React.FC<{ claro?: boolean }> = ({ claro }) => {
  const f = useCurrentFrame();
  const b = pancada(f);
  return (
    <AbsoluteFill style={{ backgroundColor: claro ? amarelo : asfalto, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${claro ? "rgba(0,0,0,.07)" : "rgba(255,228,0,.05)"} 2px, transparent 2px), linear-gradient(90deg, ${claro ? "rgba(0,0,0,.07)" : "rgba(255,228,0,.05)"} 2px, transparent 2px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${f * 1.5}px ${f * 0.8}px`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${claro ? "rgba(255,255,255,.35)" : `rgba(255,228,0,${0.1 + b * 0.12})`} 0%, transparent 60%)` }} />
      {Array.from({ length: 30 }).map((_, i) => {
        const x = random(`px${i}`) * 1080 + Math.sin(f / 25 + i) * 40;
        const y = ((random(`py${i}`) * 2000 - f * (0.5 + random(`pv${i}`))) % 2000 + 2000) % 2000 - 40;
        const t = 4 + random(`pt${i}`) * 8;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: t, height: t, borderRadius: 2, backgroundColor: claro ? "rgba(0,0,0,.25)" : poeira, opacity: 0.35, transform: `rotate(${f * 2 + i * 20}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: `radial-gradient(circle, transparent 55%, rgba(0,0,0,${claro ? 0.15 : 0.6}) 100%)` }} />
    </AbsoluteFill>
  );
};

// Entrada de cena com tremor (como um impacto) e corte zebrado.
const Cena: React.FC<{ children: React.ReactNode; claro?: boolean; tremor?: number }> = ({ children, claro, tremor = 1 }) => {
  const f = useCurrentFrame();
  const t = Math.exp(-f / 5) * 18 * tremor;
  const corte = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Canteiro claro={claro} />
      <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 2.3) * t}px, ${Math.cos(f * 3.1) * t}px)` }}>{children}</AbsoluteFill>
      {corte < 1 && (
        <AbsoluteFill style={{ transform: `translateX(${corte * 2400 - 1200}px) skewX(-20deg)` }}>
          <Zebrado altura={1920} style={{ top: 0, left: 0, right: 0, width: 1400, opacity: 1 - corte * 0.4 }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; em?: number; cor?: string; top: number }> = ({ children, em = 0, cor = amarelo, top }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0 }}>
    <Revela em={em} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.24em", color: cor, textAlign: "center" }}>
      {children}
    </Revela>
  </div>
);

// ---------- 1. Gancho (0–60): o chão treme, entulho e duas linhas ----------
const Gancho: React.FC<ReelsWGProps> = ({ gancho }) => {
  const f = useCurrentFrame();
  const treme = Math.sin(f * 1.7) * interpolate(f, [0, 55], [2, 14]);
  return (
    <AbsoluteFill>
      <Canteiro />
      <AbsoluteFill style={{ transform: `translate(${treme}px, ${treme * 0.6}px)` }}>
        {/* entulho caindo */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = random(`gx${i}`) * 1080;
          const atraso = random(`ga${i}`) * 40;
          const y = interpolate(f - atraso, [0, 30], [-120, 1500 + random(`gy${i}`) * 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const t = 30 + random(`gt${i}`) * 60;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: t, height: t * 0.7, backgroundColor: i % 4 ? concreto : "#B5651D", borderRadius: 6, transform: `rotate(${f * 6 + i * 30}deg)` }} />;
        })}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
          {gancho.map((l, i) => {
            const e = prog(f, i * 14, 10);
            return (
              <div
                key={l}
                style={{
                  fontFamily: fontes.titulo,
                  fontWeight: 800,
                  fontSize: 140,
                  lineHeight: 1,
                  color: i ? amarelo : cores.branco,
                  transform: `translateY(${(1 - e) * -300}px) scale(${1 + (1 - e) * 0.5})`,
                  opacity: e,
                }}
              >
                {l}
              </div>
            );
          })}
          <Revela em={30} style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 42, color: "rgba(255,255,255,.75)", marginTop: 30 }}>
            Alguém precisa levar embora.
          </Revela>
        </AbsoluteFill>
      </AbsoluteFill>
      <Zebrado altura={70} style={{ bottom: 120 }} anda={8} />
      <AbsoluteFill style={{ backgroundColor: amarelo, opacity: interpolate(f, [50, 60], [0, 0.95], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// ---------- 2. Revelação (60–210): a caçamba despenca, poeira, e a marca aparece pintada nela ----------
const Revelacao: React.FC<ReelsWGProps> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const queda = spring({ frame: f, fps, config: { damping: 9, stiffness: 140, mass: 1.1 } });
  const y = interpolate(queda, [0, 1], [-900, 0]);
  const zoom = interpolate(f, [30, 150], [1, 1.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const texto = prog(f, 40, 14);
  const t = Math.exp(-Math.max(0, f - 8) / 5) * 26 * (f >= 8 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Canteiro />
      <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 2.3) * t}px, ${Math.cos(f * 3.1) * t}px) scale(${zoom})`, transformOrigin: "50% 52%" }}>
        {/* chão */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1160, height: 800, backgroundColor: "#101012", borderTop: `6px solid ${amarelo}` }} />
        <Zebrado altura={50} style={{ top: 1720 }} />
        <div style={{ position: "absolute", left: 140, top: 760 + y }}>
          <Cacamba largura={800} marca={<Logo {...props} largura={300} sobreAmarelo />} />
        </div>
        <Poeira em={8} x={540} y={1150} qtd={30} raio={620} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: amarelo, opacity: interpolate(f, [0, 6], [0.9, 0], { extrapolateRight: "clamp" }) }} />
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, textAlign: "center", opacity: texto, transform: `translateY(${(1 - texto) * 40}px)` }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.24em", color: amarelo }}>CASE CAFÉ E CRIAR</div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.05, color: cores.branco, marginTop: 10 }}>
          A marca da
          <br />
          WG Ambiental
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Identidade (210–410): o logo grande e o porquê de cada escolha ----------
const Identidade: React.FC<ReelsWGProps> = (props) => {
  const f = useCurrentFrame();
  const idx = Math.min(props.identidade.length - 1, Math.max(0, Math.floor((f - 50) / COMPASSO)));
  const ativo = f >= 50;
  return (
    <Cena>
      <Kicker top={230}>POR TRÁS DA MARCA</Kicker>
      <div style={{ position: "absolute", top: 340, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${1 + pancada(f) * 0.03})` }}>
        <div style={{ backgroundColor: amarelo, borderRadius: 40, padding: "60px 80px", boxShadow: `0 30px 80px rgba(0,0,0,.5)` }}>
          <Logo {...props} largura={520} sobreAmarelo />
        </div>
      </div>
      <Revela em={8} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 70, lineHeight: 1.05, color: cores.branco, textAlign: "center", padding: "0 80px", marginTop: 1010 }}>
        Uma identidade que fala a língua da obra.
      </Revela>
      {ativo &&
        props.identidade.map((item, i) => {
          if (i !== idx) return null;
          const local = f - 50 - i * COMPASSO;
          const e = prog(local, 0, 12);
          return (
            <div key={item.titulo} style={{ position: "absolute", left: 80, right: 80, top: 1270, opacity: e, transform: `translateX(${(1 - e) * 200}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ width: 70, height: 70, borderRadius: 14, background: i === 0 ? amarelo : i === 1 ? preto : `repeating-linear-gradient(-45deg, ${amarelo} 0 12px, ${preto} 12px 24px)`, border: `4px solid ${amarelo}` }} />
                <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, color: amarelo, letterSpacing: "0.04em" }}>{item.titulo}</div>
              </div>
              <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: cores.branco, marginTop: 18 }}>{item.sentido}</div>
            </div>
          );
        })}
      <div style={{ position: "absolute", top: 1620, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {props.identidade.map((_, i) => (
          <div key={i} style={{ width: 80, height: 10, borderRadius: 9, backgroundColor: ativo && i <= idx ? amarelo : "rgba(255,255,255,.15)" }} />
        ))}
      </div>
    </Cena>
  );
};

// ---------- 4. Números (410–660): cada número cai numa caçamba que enche ----------
const Numeros: React.FC<ReelsWGProps> = ({ numeros }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = Math.min(numeros.length - 1, Math.floor(f / 62));
  const local = f - idx * 62;
  const n = numeros[idx];
  const conta = Math.round(n.valor * prog(local, 4, 30));
  const entra = spring({ frame: local, fps, config: { damping: 11, stiffness: 160 } });
  const enche = prog(local, 0, 40);
  return (
    <Cena claro tremor={0.6}>
      <Zebrado altura={56} style={{ top: 150 }} />
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.24em", color: preto }}>
        A WG EM NÚMEROS
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 330, lineHeight: 0.9, color: preto, transform: `scale(${0.4 + entra * 0.6}) rotate(${(1 - entra) * -8}deg)` }}>
          {conta}
          {n.sufixo}
        </div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: preto, textAlign: "center", padding: "0 90px", opacity: prog(local, 8, 10) }}>{n.rotulo}</div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 240, top: 1330 }}>
        <Cacamba largura={600} cor={preto} enche={enche} />
      </div>
      <Poeira em={idx * 62 + 2} x={540} y={1340} qtd={14} raio={360} />
      <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {numeros.map((_, i) => (
          <div key={i} style={{ width: 70, height: 10, borderRadius: 9, backgroundColor: i <= idx ? preto : "rgba(0,0,0,.18)" }} />
        ))}
      </div>
    </Cena>
  );
};

// ---------- 5. Ciclo (660–910): o caminhão percorre a estrada pelas etapas do resíduo ----------
const Ciclo: React.FC<ReelsWGProps> = ({ ciclo }) => {
  const f = useCurrentFrame();
  const passo = 34;
  const ate = Math.min(ciclo.length - 1, Math.floor(Math.max(0, f - 20) / passo));
  const pos = interpolate(f, [20, 20 + passo * (ciclo.length - 1)], [0, ciclo.length - 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const topo = 520;
  const gap = 200;
  return (
    <Cena>
      <Kicker top={200}>DO PEDIDO À TRIAGEM</Kicker>
      <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 74, color: cores.branco, textAlign: "center", marginTop: 270, lineHeight: 1.05 }}>
        A marca acompanha
        <br />o ciclo inteiro.
      </Revela>
      {/* estrada vertical */}
      <div style={{ position: "absolute", left: 170, top: topo - 20, width: 90, height: gap * (ciclo.length - 1) + 40, backgroundColor: "#222226", borderRadius: 45 }} />
      <div
        style={{
          position: "absolute",
          left: 211,
          top: topo,
          width: 8,
          height: gap * (ciclo.length - 1),
          backgroundImage: `repeating-linear-gradient(${amarelo} 0 30px, transparent 30px 60px)`,
          backgroundPosition: `0 ${-f * 4}px`,
        }}
      />
      {ciclo.map((etapa, i) => {
        const on = i <= ate && f >= 20;
        const e = prog(f, 20 + i * passo, 10);
        return (
          <div key={etapa} style={{ position: "absolute", left: 300, top: topo + i * gap - 40, display: "flex", alignItems: "center", gap: 26, opacity: 0.3 + e * 0.7 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: on ? amarelo : "transparent",
                border: `5px solid ${amarelo}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fontes.titulo,
                fontWeight: 800,
                fontSize: 44,
                color: on ? preto : amarelo,
                transform: `scale(${1 + (on ? Math.exp(-(f - 20 - i * passo) / 6) * 0.3 : 0)})`,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 56, color: on ? cores.branco : "rgba(255,255,255,.5)", transform: `translateX(${(1 - e) * 60}px)` }}>{etapa}</div>
          </div>
        );
      })}
      {/* caminhão descendo a estrada */}
      <div style={{ position: "absolute", left: 140, top: topo - 70 + pos * gap, transform: "rotate(90deg) scale(0.5)", transformOrigin: "75px 75px" }}>
        <Caminhao largura={360} rodas={f * 12} carga={<Cacamba largura={240} />} />
      </div>
    </Cena>
  );
};

// ---------- 6. Aplicação (910–1060): a marca em uso, cartões entrando no tempo ----------
const Aplicacao: React.FC<ReelsWGProps> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anda = interpolate(f, [0, 60], [-900, 0], { extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const card = (i: number) => spring({ frame: f - 30 - i * 14, fps, config: { damping: 13, stiffness: 170 } });
  return (
    <Cena>
      <Kicker top={200}>A MARCA EM USO</Kicker>
      <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 74, color: cores.branco, textAlign: "center", marginTop: 270, lineHeight: 1.05 }}>
        Na rua, na obra
        <br />e no celular.
      </Revela>
      {/* caminhão entrando com a caçamba marcada */}
      <div style={{ position: "absolute", left: 120 + anda, top: 520 }}>
        <Caminhao largura={840} rodas={f * 14} carga={<Cacamba largura={560} marca={<Logo {...props} largura={200} sobreAmarelo />} />} />
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, height: 6, backgroundColor: amarelo }} />
      {/* cartões: uniforme e post */}
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        <div style={{ width: 400, height: 520, borderRadius: 28, backgroundColor: amarelo, transform: `translateY(${(1 - card(0)) * 700}px) rotate(${-4 + (1 - card(0)) * -10}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, boxShadow: "0 30px 60px rgba(0,0,0,.5)" }}>
          {/* camiseta */}
          <svg viewBox="0 0 200 200" width={260} height={260}>
            <path d="M60 20 L30 40 L10 80 L40 95 L50 75 L50 185 L150 185 L150 75 L160 95 L190 80 L170 40 L140 20 Q100 45 60 20 z" fill={preto} />
          </svg>
          <div style={{ position: "absolute", top: 210 }}>
            <Logo {...props} largura={110} />
          </div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 40, color: preto }}>Uniforme</div>
        </div>
        <div style={{ width: 400, height: 520, borderRadius: 28, backgroundColor: cores.branco, overflow: "hidden", transform: `translateY(${(1 - card(1)) * 700}px) rotate(${4 + (1 - card(1)) * 10}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 20 }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Logo {...props} largura={44} />
            </div>
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 24, color: preto }}>wgambiental</div>
          </div>
          <div style={{ height: 340, backgroundColor: preto, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative", overflow: "hidden" }}>
            <Zebrado altura={30} style={{ top: 0 }} />
            <Cacamba largura={260} />
            <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 36, color: amarelo }}>Sua obra limpa</div>
          </div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 40, color: preto, textAlign: "center", paddingTop: 22 }}>Instagram</div>
        </div>
      </div>
    </Cena>
  );
};

// ---------- 7. Fecho (1060–1160): frase final e passagem para a intro Café e Criar ----------
const Fecho: React.FC<ReelsWGProps> = (props) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Cena claro>
      <Zebrado altura={56} style={{ top: 180 }} />
      <Zebrado altura={56} style={{ bottom: 180 }} anda={-4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50, transform: `scale(${1 + f * 0.0015})` }}>
        <Logo {...props} largura={420} sobreAmarelo />
        <div style={{ textAlign: "center", padding: "0 70px" }}>
          {props.fecho.map((l, i) => (
            <Revela key={l} em={6 + i * 8} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: preto }}>
              {l}
            </Revela>
          ))}
        </div>
        <Revela em={30} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 36, letterSpacing: "0.12em", color: preto }}>
          CRIADA PELA CAFÉ E CRIAR
        </Revela>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.preto, opacity: sai }} />
    </Cena>
  );
};

export const ReelsWG: React.FC<ReelsWGProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: asfalto }}>
    <Sequence durationInFrames={DROP}>
      <Gancho {...props} />
    </Sequence>
    <Sequence from={DROP} durationInFrames={COMPASSO * 3}>
      <Revelacao {...props} />
    </Sequence>
    <Sequence from={DROP + COMPASSO * 3} durationInFrames={COMPASSO * 4}>
      <Identidade {...props} />
    </Sequence>
    <Sequence from={DROP + COMPASSO * 7} durationInFrames={COMPASSO * 5}>
      <Numeros {...props} />
    </Sequence>
    <Sequence from={DROP + COMPASSO * 12} durationInFrames={COMPASSO * 5}>
      <Ciclo {...props} />
    </Sequence>
    <Sequence from={DROP + COMPASSO * 17} durationInFrames={COMPASSO * 3}>
      <Aplicacao {...props} />
    </Sequence>
    <Sequence from={DROP + COMPASSO * 20} durationInFrames={COMPASSO * 2}>
      <Fecho {...props} />
    </Sequence>
  </AbsoluteFill>
);
