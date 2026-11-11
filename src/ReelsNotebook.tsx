import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame } from "remotion";

// Reels de apresentação de site (Inovação Assessoria Contábil, 11/11/2026), 30 fps, renderizado sem som.
// Conceito: o notebook chega fechado, a tampa abre e o site roda na tela (gravação acelerada 2x),
// a câmera passeia e se aproxima enquanto legendas no estilo do próprio site contam cada parte.
// A gravação (public/clientes/inovacao-site-2x.mp4, 18 MB) fica só na pasta do projeto, fora do git: recortar a barra do navegador e acelerar 2x com ffmpeg (crop=1358:654:0:81,setpts=0.5*PTS,fps=30).
// No fim a tampa fecha e o nome do cliente aparece em contorno dourado, como no rodapé do site.
export const NOTEBOOK_FPS = 30;
export const NOTEBOOK_DURACAO = 1080;

const carregar = (familia: string, arquivo: string, peso: string, estilo = "normal") =>
  loadFont({ family: familia, url: staticFile(`fontes/${arquivo}.woff2`), weight: peso, style: estilo, format: "woff2" });
["400", "600", "700"].forEach((p) => carregar("Inter Tight", `InterTight-${p}`, p));
carregar("Instrument Serif", "InstrumentSerif-400-italic", "400", "italic");

const SANS = "'Inter Tight', sans-serif";
const SERIF = "'Instrument Serif', serif";

export type ReelsNotebookProps = {
  video: string; // gravação do site já recortada (sem a barra do navegador) e acelerada, em public/
  videoDuracao: number; // em quadros
  videoInicio: number; // quadro em que o vídeo começa a rodar na tela
  cliente: [string, string]; // nome em sans + complemento em itálico
  kicker: string;
  endereco: string; // texto da barra de endereço do notebook
  tema: { fundo: string; profundo: string; ouro: string; ouroClaro: string; texto: string };
  legendas: { de: number; ate: number; numero: string; linha: string; destaque: string }[]; // quadros globais
  selos: { em: number; ate: number; texto: string; lado: "esq" | "dir"; y: number }[];
  aproximacoes: { de: number; ate: number; escala: number; y: number }[];
  fecho: { contorno: string; linha: string; destaque: string; texto: string };
};

export const reelsNotebookPadrao: ReelsNotebookProps = {
  video: "clientes/inovacao-site-2x.mp4",
  videoDuracao: 899,
  videoInicio: 30,
  cliente: ["Inovação", "Assessoria Contábil"],
  kicker: "SITE NOVO NO AR",
  endereco: "contabilinovacaoassessoria.com.br",
  tema: { fundo: "#050C18", profundo: "#0C1B33", ouro: "#C9A45C", ouroClaro: "#E8CF95", texto: "#F4EFE4" },
  legendas: [
    { de: 60, ate: 140, numero: "01", linha: "Primeira impressão", destaque: "que passa confiança." },
    { de: 140, ate: 285, numero: "02", linha: "Quem somos,", destaque: "em poucas linhas." },
    { de: 285, ate: 525, numero: "03", linha: "Cada serviço", destaque: "com a sua própria cena." },
    { de: 525, ate: 690, numero: "04", linha: "Benefícios e diferenciais", destaque: "claros para quem chega." },
    { de: 690, ate: 840, numero: "05", linha: "Dúvidas respondidas", destaque: "antes da primeira ligação." },
    { de: 840, ate: 935, numero: "06", linha: "Contato direto,", destaque: "a um toque do WhatsApp." },
  ],
  selos: [
    { em: 110, ate: 280, texto: "Animações em partículas", lado: "dir", y: 600 },
    { em: 330, ate: 520, texto: "Contábil · Trabalhista · Abertura", lado: "esq", y: 1300 },
    { em: 560, ate: 700, texto: "CNPJ em até 48 h em destaque", lado: "dir", y: 1290 },
    { em: 860, ate: 935, texto: "WhatsApp fixo na tela", lado: "esq", y: 1290 },
  ],
  aproximacoes: [
    { de: 300, ate: 520, escala: 1.1, y: 110 },
    { de: 700, ate: 830, escala: 1.06, y: 90 },
  ],
  fecho: {
    contorno: "INOVAÇÃO",
    linha: "Site novo,",
    destaque: "pensado por dentro.",
    texto: "Entramos na rotina do escritório para contar, do jeito certo, o que a Inovação faz de melhor.",
  },
};

const W = 1080;
const H = 1920;
const suave = Easing.bezier(0.65, 0, 0.35, 1);
const rapido = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, b: number, e = rapido) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------- fundo: azul-marinho com poeira dourada, como o site ----------
const Poeira: React.FC<{ ouro: string }> = ({ ouro }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(140).fill(0).map((_, i) => {
        const x = random(`x${i}`) * W;
        const vel = 0.15 + random(`v${i}`) * 0.6;
        const y = (((random(`y${i}`) * H - f * vel) % H) + H) % H;
        const tam = 1.5 + random(`t${i}`) * 3.5;
        const brilho = 0.25 + 0.75 * Math.abs(Math.sin(f / (14 + random(`b${i}`) * 30) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(f / 50 + i) * 8,
              top: y,
              width: tam,
              height: tam,
              borderRadius: "50%",
              background: ouro,
              opacity: brilho * (tam > 3.8 ? 0.9 : 0.55),
              boxShadow: tam > 3.8 ? `0 0 ${tam * 3}px ${ouro}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Fundo: React.FC<{ tema: ReelsNotebookProps["tema"] }> = ({ tema }) => {
  const f = useCurrentFrame();
  const gx = 50 + Math.sin(f / 80) * 18;
  const gy = 42 + Math.cos(f / 110) * 8;
  return (
    <AbsoluteFill style={{ background: tema.fundo }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${gx}% ${gy}%, ${tema.ouro}38 0%, ${tema.profundo} 34%, ${tema.fundo} 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${tema.ouro}0d 1px, transparent 1px), linear-gradient(90deg, ${tema.ouro}0d 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${(f * 0.6) % 90}px`,
          maskImage: "radial-gradient(circle at 50% 50%, black 10%, transparent 70%)",
        }}
      />
      <Poeira ouro={tema.ouroClaro} />
    </AbsoluteFill>
  );
};

// ---------- o notebook ----------
const LARG = 1000; // largura da tampa
const ALT = 600; // altura da tampa
const BORDA = 26;
const BARRA = 34; // barra do navegador
const PROF = 640; // profundidade da base

const Teclado: React.FC = () => {
  const linhas = [14, 14, 13, 12, 11];
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 46, display: "flex", flexDirection: "column", gap: 10 }}>
      {linhas.map((n, l) => (
        <div key={l} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {new Array(n).fill(0).map((_, k) => (
            <div
              key={k}
              style={{
                width: l === 4 && k === 5 ? 250 : 48,
                height: 46,
                borderRadius: 8,
                background: "linear-gradient(180deg,#1a1c21,#121317)",
                boxShadow: "inset 0 1px 0 #34373f, 0 2px 0 #08090b",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const Notebook: React.FC<{ props: ReelsNotebookProps; abertura: number; f: number }> = ({ props, abertura, f }) => {
  const { tema } = props;
  const anguloTampa = interpolate(abertura, [0, 1], [-90, 8]);
  const tela = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 30,
        background: "#0b0c0f",
        border: "2px solid #3a3d44",
        boxShadow: "inset 0 0 0 3px #15171b",
        backfaceVisibility: "hidden",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 9, left: "50%", width: 9, height: 9, marginLeft: -4.5, borderRadius: "50%", background: "#24272e", boxShadow: "inset 0 0 0 2px #121318" }} />
      <div style={{ position: "absolute", left: BORDA, right: BORDA, top: BORDA, bottom: BORDA, borderRadius: 6, overflow: "hidden", background: tema.fundo }}>
        {/* barra do navegador */}
        <div style={{ height: BARRA, background: "#14161b", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
          <div
            style={{
              marginLeft: 16,
              flex: 1,
              height: 22,
              borderRadius: 11,
              background: "#22252c",
              color: "#aeb3bd",
              fontFamily: SANS,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              gap: 8,
            }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12">
              <rect x="1" y="5" width="8" height="7" rx="1.5" fill="#aeb3bd" />
              <path d="M2.8 5V3.6a2.2 2.2 0 0 1 4.4 0V5" stroke="#aeb3bd" strokeWidth="1.4" fill="none" />
            </svg>
            {props.endereco}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: BARRA, bottom: 0, background: tema.fundo }}>
          <Sequence from={props.videoInicio} durationInFrames={props.videoDuracao} layout="none">
            <OffthreadVideo src={staticFile(props.video)} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
          </Sequence>
          {f >= props.videoInicio + props.videoDuracao && (
            <Img src={staticFile("clientes/inovacao-site-ultimo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
          )}
          {f < props.videoInicio && (
            <Img src={staticFile("clientes/inovacao-site-primeiro.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} />
          )}
        </div>
        {/* reflexo do vidro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${20 + Math.sin(f / 70) * 6}%, rgba(255,255,255,0.07) ${32 + Math.sin(f / 70) * 6}%, rgba(255,255,255,0) ${46 + Math.sin(f / 70) * 6}%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );

  const costas = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 30,
        background: "linear-gradient(160deg,#4a4e57,#2b2e35 55%,#22252b)",
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={staticFile("logo-mark.png")} style={{ width: 110, opacity: 0.55, filter: "grayscale(1) brightness(1.6)" }} />
    </div>
  );

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}>
      {/* base */}
      <div
        style={{
          position: "absolute",
          left: -LARG / 2 - 20,
          top: 0,
          width: LARG + 40,
          height: PROF,
          transformOrigin: "50% 0",
          transform: "rotateX(90deg)",
          transformStyle: "preserve-3d",
          borderRadius: "10px 10px 34px 34px",
          background: "linear-gradient(180deg,#3b3f47,#2c2f36 60%,#25282e)",
          boxShadow: "inset 0 0 0 2px #4c505a",
        }}
      >
        <Teclado />
        <div style={{ position: "absolute", left: "50%", marginLeft: -170, width: 340, height: 220, bottom: 40, borderRadius: 16, background: "linear-gradient(180deg,#34373e,#2d3036)", boxShadow: "inset 0 0 0 2px #464a53" }} />
        {/* frente da base */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: PROF,
            height: 22,
            transformOrigin: "50% 0",
            transform: "rotateX(-90deg)",
            borderRadius: "0 0 24px 24px",
            background: "linear-gradient(180deg,#5a5f69,#2a2d33)",
          }}
        >
          <div style={{ position: "absolute", left: "50%", marginLeft: -80, width: 160, height: 8, top: 0, borderRadius: "0 0 10px 10px", background: "#1e2025" }} />
        </div>
      </div>
      {/* tampa */}
      <div
        style={{
          position: "absolute",
          left: -LARG / 2,
          top: -ALT,
          width: LARG,
          height: ALT,
          transformOrigin: "50% 100%",
          transform: `rotateX(${anguloTampa}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {tela}
        {costas}
      </div>
    </div>
  );
};

// ---------- textos ----------
const Linha: React.FC<{ em: number; sai?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ em, sai, children, style }) => {
  const f = useCurrentFrame();
  const entra = p(f, em, em + 14);
  const fora = sai === undefined ? 0 : p(f, sai - 10, sai, suave);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 12, marginBottom: -12 }}>
      <div style={{ ...style, transform: `translateY(${(1 - entra) * 110 - fora * 110}%)`, opacity: 1 - fora }}>{children}</div>
    </div>
  );
};

const Legenda: React.FC<{ l: ReelsNotebookProps["legendas"][number]; tema: ReelsNotebookProps["tema"] }> = ({ l, tema }) => {
  const f = useCurrentFrame();
  const barra = p(f, l.de, l.de + 18) * (1 - p(f, l.ate - 10, l.ate, suave));
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1400 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <Linha em={l.de} sai={l.ate} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 4, color: tema.ouro }}>
          {l.numero}
        </Linha>
        <div style={{ height: 2, width: 140 * barra, background: tema.ouro, opacity: 0.8 }} />
      </div>
      <Linha em={l.de + 3} sai={l.ate} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 74, lineHeight: 1.05, letterSpacing: -2, color: tema.texto }}>
        {l.linha}
      </Linha>
      <Linha em={l.de + 7} sai={l.ate} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, lineHeight: 1.05, color: tema.ouro }}>
        {l.destaque}
      </Linha>
    </div>
  );
};

const Selo: React.FC<{ s: ReelsNotebookProps["selos"][number]; tema: ReelsNotebookProps["tema"] }> = ({ s, tema }) => {
  const f = useCurrentFrame();
  const e = p(f, s.em, s.em + 16);
  const fora = p(f, s.ate - 10, s.ate, suave);
  const flutua = Math.sin((f - s.em) / 18) * 6;
  const dx = (s.lado === "esq" ? -1 : 1) * (1 - e) * 120;
  return (
    <div
      style={{
        position: "absolute",
        top: s.y + flutua,
        [s.lado === "esq" ? "left" : "right"]: 60,
        transform: `translateX(${dx}px) scale(${0.85 + 0.15 * e})`,
        opacity: e * (1 - fora),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 26px",
        borderRadius: 999,
        background: "rgba(12,27,51,0.82)",
        border: `1.5px solid ${tema.ouro}88`,
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${tema.ouro}22`,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 30,
        color: tema.texto,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: tema.ouro, boxShadow: `0 0 12px ${tema.ouro}` }} />
      {s.texto}
    </div>
  );
};

// ---------- composição ----------
export const ReelsNotebook: React.FC<ReelsNotebookProps> = (props) => {
  const f = useCurrentFrame();
  const { tema } = props;
  const fimVideo = props.videoInicio + props.videoDuracao;

  // chegada, abertura e fechamento da tampa
  const chega = p(f, 0, 34);
  const abre = p(f, 8, 58, suave);
  const fecha = p(f, fimVideo + 4, fimVideo + 40, suave);
  const abertura = abre * (1 - fecha);

  // câmera: inclinação do alto no começo, quase de frente durante o site
  let tilt = interpolate(abre, [0, 1], [-34, -9]) + fecha * -22;
  let escala = 0.82 + 0.06 * p(f, 40, 120, suave);
  let desceY = 0;
  for (const a of props.aproximacoes) {
    const z = p(f, a.de, a.de + 30, suave) * (1 - p(f, a.ate - 30, a.ate, suave));
    escala += (a.escala - 0.88) * z;
    desceY += a.y * z;
  }
  const balanco = Math.sin(f / 75) * 9 * (1 - fecha) + interpolate(chega, [0, 1], [-25, 0]);
  const centroY = 1030 + (1 - chega) * 700 + desceY + fecha * 520;
  const some = p(f, fimVideo + 30, fimVideo + 60, suave);

  // brilho atrás da tela quando abre
  const halo = abre * (1 - fecha);

  // título fixo do topo
  const sobeTitulo = p(f, fimVideo - 6, fimVideo + 12, suave);

  // fecho
  const F0 = fimVideo + 34;
  const contorno = p(f, F0, F0 + 40, suave);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Fundo tema={tema} />

      {/* halo dourado */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 600,
          top: centroY - 700,
          width: 1200,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${tema.ouro}55 0%, ${tema.ouro}00 65%)`,
          opacity: halo * 0.9,
          filter: "blur(10px)",
        }}
      />

      {/* sombra no chão */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 480 * escala,
          top: centroY + 120 * escala,
          width: 960 * escala,
          height: 120 * escala,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)",
          opacity: chega * (1 - some),
        }}
      />

      {/* notebook */}
      <div style={{ position: "absolute", inset: 0, perspective: 2600, perspectiveOrigin: `50% ${centroY - 300}px`, opacity: 1 - some }}>
        <div
          style={{
            position: "absolute",
            left: W / 2,
            top: centroY,
            transformStyle: "preserve-3d",
            transform: `scale(${escala}) rotateX(${tilt}deg) rotateY(${balanco}deg)`,
          }}
        >
          <Notebook props={props} abertura={abertura} f={f} />
        </div>
      </div>

      {/* título do topo */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 250, transform: `translateY(${-sobeTitulo * 80}px)`, opacity: 1 - sobeTitulo }}>
        <Linha em={4} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 6, color: tema.ouro }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: tema.ouro, boxShadow: `0 0 14px ${tema.ouro}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(f / 10)) }} />
          {props.kicker}
        </Linha>
        <div style={{ height: 14 }} />
        <Linha em={10} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 96, lineHeight: 1, letterSpacing: -3, color: tema.texto }}>
          {props.cliente[0]}
        </Linha>
        <Linha em={16} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 100, lineHeight: 1.05, color: tema.ouro }}>
          {props.cliente[1]}
        </Linha>
      </div>

      {props.legendas.map((l) => (
        <Sequence key={l.numero} from={0} durationInFrames={l.ate + 1} layout="none">
          {f >= l.de - 1 && <Legenda l={l} tema={tema} />}
        </Sequence>
      ))}
      {props.selos.map((s) => f >= s.em - 1 && f <= s.ate && <Selo key={s.texto} s={s} tema={tema} />)}

      {/* fecho */}
      {f >= F0 - 2 && (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 470,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 210,
              letterSpacing: -6,
              color: "transparent",
              WebkitTextStroke: `2.5px ${tema.ouro}`,
              opacity: 0.25 + 0.75 * contorno,
              clipPath: `inset(0 ${(1 - contorno) * 100}% 0 0)`,
              transform: `scale(${1.08 - 0.08 * contorno})`,
              filter: `drop-shadow(0 0 18px ${tema.ouro}55)`,
            }}
          >
            {props.fecho.contorno}
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 790 }}>
            <Linha em={F0 + 18} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 98, lineHeight: 1, letterSpacing: -3, color: tema.texto }}>
              {props.fecho.linha}
            </Linha>
            <Linha em={F0 + 24} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 112, lineHeight: 1.05, color: tema.ouro }}>
              {props.fecho.destaque}
            </Linha>
            <div style={{ height: 34 }} />
            <Linha em={F0 + 34} style={{ fontFamily: SANS, fontWeight: 400, fontSize: 38, lineHeight: 1.4, color: `${tema.texto}cc`, maxWidth: 860 }}>
              {props.fecho.texto}
            </Linha>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1380,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              opacity: p(f, F0 + 50, F0 + 70),
              transform: `translateY(${(1 - p(f, F0 + 50, F0 + 70)) * 40}px)`,
            }}
          >
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: tema.ouro }}>SITE FEITO PELA</div>
            <Img src={staticFile("logo-full.png")} style={{ width: 460, filter: "brightness(0) invert(1)" }} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
