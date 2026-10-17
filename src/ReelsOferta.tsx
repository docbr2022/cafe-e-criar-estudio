import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faCalendarCheck, faCheck, faMagnifyingGlassChart, faMugHot, faPenNib } from "@fortawesome/free-solid-svg-icons";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores, fontes } from "./marca";

// Reels de oferta, 15 s a 30 fps, cortes no tempo da trilha (120 BPM: 1 batida = 15 quadros, 1 compasso = 60).
export const OFERTA_FPS = 30;
export const BATIDA = 15;
export const OFERTA_DURACAO = 450;

export type ReelsOfertaProps = {
  gancho: [string, string, string]; // 3 linhas; a última fica em amarelo
  solucao: [string, string];
  plano: string;
  preco: number;
  periodo: string;
  itens: { icone: "diagnostico" | "artes" | "calendario" | "whatsapp"; texto: string }[];
  prazo: string;
  prazoApoio: string;
  faixa: string;
  convite: string;
  cta: string;
  arroba: string;
  trilha: string | null;
  // Versão "preço primeiro": abre no valor já cheio (quadro 0), sem o gancho em texto.
  abrirComPreco?: boolean;
  precoTitulo?: [string, string];
};

export const reelsOfertaPadrao: ReelsOfertaProps = {
  gancho: ["Seu", "Instagram", "tá parado?"],
  solucao: ["A gente resolve", "com um café."],
  plano: "PLANO CAFÉ EXPRESSO",
  preco: 497,
  periodo: "/mês",
  itens: [
    { icone: "diagnostico", texto: "Diagnóstico do seu negócio" },
    { icone: "artes", texto: "8 artes + 8 legendas por mês" },
    { icone: "calendario", texto: "Calendário editorial" },
    { icone: "whatsapp", texto: "Suporte no WhatsApp" },
  ],
  prazo: "31/12",
  prazoApoio: "Depois disso, o plano encerra.",
  faixa: "CAFÉ EXPRESSO  •  R$ 497/MÊS  •  ",
  convite: "Venha tomar um café conosco.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
  trilha: "audio/trilha-120bpm.wav",
};

const icones: Record<ReelsOfertaProps["itens"][number]["icone"], IconDefinition> = {
  diagnostico: faMagnifyingGlassChart,
  artes: faPenNib,
  calendario: faCalendarCheck,
  whatsapp: faWhatsapp,
};

export const Icone: React.FC<{ icone: IconDefinition; tamanho: number; cor: string; style?: React.CSSProperties }> = ({ icone, tamanho, cor, style }) => {
  const [w, h, , , d] = icone.icon;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={tamanho} height={tamanho} style={style}>
      {(Array.isArray(d) ? d : [d]).map((p) => (
        <path key={p} d={p} fill={cor} />
      ))}
    </svg>
  );
};

export const rapido = Easing.bezier(0.16, 1, 0.3, 1);
export const prog = (f: number, inicio: number, dur: number) =>
  interpolate(f, [inicio, inicio + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: rapido });

// Pulso que acende em cada batida e some rápido.
export const pulso = (f: number) => Math.exp(-(f % BATIDA) / 4);

// Linha que sobe de trás de uma máscara.
export const Revela: React.FC<{ em: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ em, children, style, dur = 9 }) => {
  const f = useCurrentFrame();
  const p = prog(f, em, dur);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8 }}>
      <div style={{ ...style, transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

export const Pop: React.FC<{ em: number; children: React.ReactNode; style?: React.CSSProperties; de?: number }> = ({ em, children, style, de = 0.6 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - em, fps, config: { damping: 16, stiffness: 180 } });
  return <div style={{ ...style, opacity: f < em ? 0 : 1, transform: `${style?.transform ?? ""} scale(${de + (1 - de) * s})` }}>{children}</div>;
};

export const Grao: React.FC<{ x: number; y: number; tam: number; rot: number; cor: string }> = ({ x, y, tam, rot, cor }) => (
  <svg width={tam} height={tam * 1.3} viewBox="0 0 100 130" style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }}>
    <ellipse cx="50" cy="65" rx="46" ry="62" fill={cor} />
    <path d="M50 8 C 30 45, 70 85, 50 122" stroke={cores.preto} strokeWidth="9" fill="none" strokeLinecap="round" />
  </svg>
);

export const Graos: React.FC<{ cor: string; seed?: number }> = ({ cor, seed = 1 }) => {
  const f = useCurrentFrame();
  const pos = [
    [80, 260, 70],
    [880, 330, 90],
    [760, 1500, 60],
    [140, 1420, 85],
    [930, 980, 50],
    [40, 860, 45],
  ];
  return (
    <>
      {pos.map(([x, y, t], i) => (
        <Grao key={i} x={x} y={y - f * (1.2 + (i % 3) * 0.5)} tam={t} rot={(i * 47 * seed + f * (i % 2 ? 1.5 : -1.5)) % 360} cor={cor} />
      ))}
    </>
  );
};

// 1. Gancho (0–60)
const Gancho: React.FC<ReelsOfertaProps> = ({ gancho }) => {
  const f = useCurrentFrame();
  const faixa = prog(f, 0, 10);
  const recolhe = prog(f, 10, 10);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 168, lineHeight: 0.95, color: cores.branco };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Graos cor={cores.ouro} />
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 1560 - 1400 * (1 - recolhe) * faixa,
          height: 24 + 1400 * (1 - recolhe) * faixa,
          backgroundColor: cores.amareloVivo,
          transform: "rotate(-8deg)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px", transform: `scale(${1 + pulso(f) * 0.015})` }}>
        <Revela em={6} style={titulo}>
          {gancho[0]}
        </Revela>
        <Revela em={14} style={titulo}>
          {gancho[1]}
        </Revela>
        <Revela em={30} style={{ ...titulo, color: cores.amareloVivo }}>
          {gancho[2]}
        </Revela>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2. Solução (60–120): fundo amarelo entra em círculo, xícara com vapor.
const Solucao: React.FC<ReelsOfertaProps> = ({ solucao }) => {
  const f = useCurrentFrame();
  const raio = interpolate(prog(f, 0, 12), [0, 1], [0, 1500]);
  const xicara = prog(f, 10, 14);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 130, lineHeight: 1, color: cores.preto };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, clipPath: `circle(${raio}px at 540px 960px)` }}>
        <AbsoluteFill style={{ padding: "0 80px", justifyContent: "center", gap: 70 }}>
          <div>
            <Revela em={6} style={titulo}>
              {solucao[0]}
            </Revela>
            <Revela em={15} style={titulo}>
              {solucao[1]}
            </Revela>
          </div>
          <div style={{ transform: `translateY(${(1 - xicara) * 300}px) rotate(${Math.sin(f / 6) * 3}deg)`, opacity: xicara, alignSelf: "center" }}>
            <Icone icone={faMugHot} tamanho={520} cor={cores.preto} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 3. Preço (120–180): contador sobe até o valor, anéis no impacto.
const Preco: React.FC<ReelsOfertaProps> = ({ plano, preco, periodo, abrirComPreco, precoTitulo }) => {
  const f = useCurrentFrame();
  const valor = abrirComPreco ? preco : Math.round(preco * prog(f, 6, 18));
  const impacto = abrirComPreco ? 8 : 24;
  const letras = abrirComPreco ? plano.length : Math.floor(interpolate(f, [0, 12], [0, plano.length], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center" }}>
      {[0, 6, 12].map((atraso) => {
        const p = prog(f, impacto + atraso, 24);
        return (
          <div
            key={atraso}
            style={{
              position: "absolute",
              width: 500 + p * 900,
              height: 500 + p * 900,
              borderRadius: 9999,
              border: `${8 * (1 - p)}px solid ${cores.amareloVivo}`,
              opacity: f < impacto + atraso ? 0 : 1 - p,
            }}
          />
        );
      })}
      {abrirComPreco && precoTitulo && (
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1, color: cores.branco, textAlign: "center", marginBottom: 60 }}>
          <div>{precoTitulo[0]}</div>
          <div style={{ color: cores.amareloVivo }}>{precoTitulo[1]}</div>
        </div>
      )}
      <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 46, letterSpacing: "0.18em", color: cores.amareloVivo, marginBottom: 30, minHeight: 60 }}>
        {plano.slice(0, letras)}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", transform: `scale(${1 + (f >= impacto ? pulso(f - impacto) * 0.06 : 0)})` }}>
        <span style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 110, color: cores.branco, marginTop: 50, marginRight: 16 }}>R$</span>
        <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 360, lineHeight: 1, color: cores.amareloVivo, fontVariantNumeric: "tabular-nums" }}>
          {valor}
        </span>
      </div>
      <Pop em={impacto} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 96, color: cores.branco, marginTop: -10 }}>
        {periodo}
      </Pop>
    </AbsoluteFill>
  );
};

// 4. Entregas (180–300): celular com o feed se preenchendo + lista com ícones.
const Entregas: React.FC<ReelsOfertaProps> = ({ itens, arroba }) => {
  const f = useCurrentFrame();
  const entra = prog(f, 0, 10);
  const tiles = [cores.preto, cores.amareloVivo, cores.branco, cores.amareloVivo, cores.preto, cores.amareloVivo, cores.branco, cores.preto, cores.amareloVivo];
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite, transform: `translateX(${(1 - entra) * 100}%)` }}>
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em", color: cores.ouro }}>
        O QUE VOCÊ RECEBE
      </div>
      {/* Celular */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 320,
          width: 440,
          height: 630,
          borderRadius: 56,
          backgroundColor: cores.preto,
          padding: 18,
          boxShadow: "0 30px 60px rgba(0,0,0,.18)",
          transform: `translateY(${(1 - prog(f, 4, 14)) * 120}px) rotate(${-3 + Math.sin(f / 20) * 1.5}deg)`,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 40, backgroundColor: cores.branco, overflow: "hidden", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("logo-mark.png")} style={{ width: 62 }} />
            </div>
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 26, color: cores.tinta }}>{arroba}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {tiles.map((c, i) => {
              const p = prog(f, 12 + i * 5, 8);
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: "4 / 5",
                    backgroundColor: c,
                    border: c === cores.branco ? `2px solid ${cores.borda}` : undefined,
                    transform: `scale(${p})`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: 10,
                    gap: 6,
                  }}
                >
                  <div style={{ height: 8, width: "70%", borderRadius: 9, backgroundColor: c === cores.preto ? cores.amareloVivo : cores.preto }} />
                  <div style={{ height: 8, width: "45%", borderRadius: 9, backgroundColor: c === cores.preto ? cores.branco : cores.cinza500 }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Pop
        em={60}
        style={{
          position: "absolute",
          top: 300,
          left: 640,
          backgroundColor: cores.amareloVivo,
          color: cores.preto,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 54,
          padding: "14px 34px",
          borderRadius: 999,
          transform: "rotate(8deg)",
          boxShadow: "0 8px 20px rgba(0,0,0,.15)",
        }}
      >
        8 artes/mês
      </Pop>
      {/* Lista */}
      <div style={{ position: "absolute", top: 960, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 22 }}>
        {itens.map((item, i) => {
          const em = 20 + i * BATIDA;
          const p = prog(f, em, 10);
          return (
            <div
              key={item.texto}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                backgroundColor: cores.branco,
                borderRadius: 20,
                padding: "22px 30px",
                boxShadow: "0 10px 30px rgba(0,0,0,.07)",
                opacity: p,
                transform: `translateX(${(1 - p) * (i % 2 ? 160 : -160)}px)`,
              }}
            >
              <div style={{ width: 76, height: 76, borderRadius: 999, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icone icone={icones[item.icone]} tamanho={38} cor={cores.amareloVivo} />
              </div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 50, lineHeight: 1.05, color: cores.tinta, flex: 1 }}>{item.texto}</div>
              <Pop em={em + 6}>
                <Icone icone={faCheck} tamanho={40} cor={cores.amarelo} />
              </Pop>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Letreiro: React.FC<{ texto: string; top: number; rot: number; sentido: 1 | -1; fundo: string; cor: string }> = ({ texto, top, rot, sentido, fundo, cor }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: -300, right: -300, top, transform: `rotate(${rot}deg)`, backgroundColor: fundo, padding: "18px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ transform: `translateX(${sentido * (f * 9) - 1200}px)`, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, color: cor }}>{texto.repeat(8)}</div>
    </div>
  );
};

// 5. Urgência (300–360)
const Urgencia: React.FC<ReelsOfertaProps> = ({ prazo, prazoApoio, faixa }) => {
  const f = useCurrentFrame();
  const bate = prog(f, 6, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Letreiro texto={faixa} top={250} rot={-6} sentido={1} fundo={cores.amareloVivo} cor={cores.preto} />
      <Letreiro texto={faixa} top={1480} rot={5} sentido={-1} fundo={cores.branco} cor={cores.preto} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Revela em={0} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 110, color: cores.branco, textAlign: "center" }}>
          Só até
        </Revela>
        <div
          style={{
            fontFamily: fontes.titulo,
            fontWeight: 800,
            fontSize: 300,
            lineHeight: 1,
            color: cores.amareloVivo,
            opacity: f < 6 ? 0 : 1,
            transform: `scale(${2.2 - 1.2 * bate}) rotate(${(1 - bate) * -8}deg)`,
          }}
        >
          {prazo}
        </div>
        <Revela em={22} style={{ fontFamily: fontes.texto, fontSize: 46, color: cores.branco, textAlign: "center", marginTop: 20 }}>
          {prazoApoio}
        </Revela>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 6. CTA (360–450)
const Chamada: React.FC<ReelsOfertaProps> = ({ convite, cta, arroba }) => {
  const f = useCurrentFrame();
  const brilho = pulso(f);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 56, padding: "0 80px 220px" }}>
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
      <Pop em={0} de={0.85}>
        <Img src={staticFile("logo-full.png")} style={{ width: 860 }} />
      </Pop>
      <Revela em={8} style={{ fontFamily: fontes.texto, fontSize: 54, lineHeight: 1.35, color: cores.branco, textAlign: "center" }}>
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
      <Revela em={24} style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 42, color: cores.amareloVivo }}>
        {arroba}
      </Revela>
    </AbsoluteFill>
  );
};

// Preço primeiro, 13 s: valor (0–60) → entregas (60–180) → solução (180–240) → prazo (240–300) → chamada (300–390).
export const OFERTA_PRECO_DURACAO = 390;
const ReelsOfertaPreco: React.FC<ReelsOfertaProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    {props.trilha && (
      <Audio src={staticFile(props.trilha)} volume={(q) => interpolate(q, [0, 350, OFERTA_PRECO_DURACAO], [1, 1, 0], { extrapolateRight: "clamp" })} />
    )}
    <Sequence durationInFrames={60}>
      <Preco {...props} />
    </Sequence>
    <Sequence from={60} durationInFrames={120}>
      <Entregas {...props} />
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <Solucao {...props} />
    </Sequence>
    <Sequence from={240} durationInFrames={60}>
      <Urgencia {...props} />
    </Sequence>
    <Sequence from={300}>
      <Chamada {...props} />
    </Sequence>
  </AbsoluteFill>
);

export const ReelsOferta: React.FC<ReelsOfertaProps> = (props) =>
  props.abrirComPreco ? <ReelsOfertaPreco {...props} /> : (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    {props.trilha && <Audio src={staticFile(props.trilha)} />}
    <Sequence durationInFrames={60}>
      <Gancho {...props} />
    </Sequence>
    <Sequence from={60} durationInFrames={60}>
      <Solucao {...props} />
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <Preco {...props} />
    </Sequence>
    <Sequence from={180} durationInFrames={120}>
      <Entregas {...props} />
    </Sequence>
    <Sequence from={300} durationInFrames={60}>
      <Urgencia {...props} />
    </Sequence>
    <Sequence from={360}>
      <Chamada {...props} />
    </Sequence>
  </AbsoluteFill>
);
