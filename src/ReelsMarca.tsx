import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels "uma marca do zero em 15 s", 30 fps, sem trilha. Abre no resultado (quadro 0) e volta ao processo:
// conversa → rascunho → forma → letra → aplicações → chamada. A marca do vídeo é um exemplo fictício.
export const MARCA_FPS = 30;
export const MARCA_DURACAO = 450;

export type ReelsMarcaProps = {
  gancho: [string, string];
  marca: string;
  slogan: string;
  briefing: string[];
  etapas: [string, string, string, string, string];
  aviso: string;
  convite: [string, string];
  cta: string;
  arroba: string;
};

export const reelsMarcaPadrao: ReelsMarcaProps = {
  gancho: ["Uma marca do zero", "em 15 segundos"],
  marca: "Grão Dourado",
  slogan: "PADARIA DE BAIRRO",
  briefing: ["Padaria de bairro", "Acolhedora", "Zona Leste", "Pão quentinho às 6h"],
  etapas: ["A CONVERSA", "O RASCUNHO", "A FORMA", "A LETRA", "NO DIA A DIA"],
  aviso: "Marca fictícia, criada para este vídeo.",
  convite: ["A próxima marca", "pode ser a sua."],
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

// Espiga: haste + 5 pares de grãos + grão do topo, desenhada num quadro 200×260.
const GRAOS: { cx: number; cy: number; rot: number }[] = [
  ...[0, 1, 2, 3, 4].flatMap((i) => [
    { cx: 78, cy: 200 - i * 34, rot: -32 },
    { cx: 122, cy: 200 - i * 34, rot: 32 },
  ]),
  { cx: 100, cy: 34, rot: 0 },
];

// tracado: 0–1 desenha os contornos; preenche: 0–1 pinta os grãos.
// contorno: cor da borda dos grãos (a cor do fundo separa os grãos quando estão pintados).
const Espiga: React.FC<{ tamanho: number; cor: string; tracado?: number; preenche?: number; traco?: string; contorno?: string }> = ({
  tamanho,
  cor,
  tracado = 1,
  preenche = 1,
  traco = cor,
  contorno = traco,
}) => (
  <svg width={tamanho} height={tamanho * 1.3} viewBox="0 0 200 260">
    <path d="M100 250 L100 60" stroke={traco} strokeWidth={8} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tracado} />
    {GRAOS.map((g, i) => {
      const t = interpolate(tracado, [i / GRAOS.length, Math.min(1, (i + 2) / GRAOS.length)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const p = interpolate(preenche, [i / GRAOS.length, Math.min(1, (i + 3) / GRAOS.length)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <ellipse
          key={i}
          cx={g.cx}
          cy={g.cy}
          rx={18}
          ry={30}
          transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}
          fill={cor}
          fillOpacity={p}
          stroke={contorno}
          strokeWidth={7}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - t}
        />
      );
    })}
  </svg>
);

// Selo final: círculo preto, anel amarelo, espiga.
const Selo: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <div
    style={{
      width: tamanho,
      height: tamanho,
      borderRadius: 9999,
      backgroundColor: cores.preto,
      boxShadow: `inset 0 0 0 ${tamanho * 0.035}px ${cores.amareloVivo}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Espiga tamanho={tamanho * 0.42} cor={cores.amareloVivo} contorno={cores.preto} />
  </div>
);

const Logotipo: React.FC<{ marca: string; slogan: string; escala?: number; cor?: string }> = ({ marca, slogan, escala = 1, cor = cores.branco }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 120 * escala, lineHeight: 1, color: cor }}>{marca}</div>
    <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30 * escala, letterSpacing: "0.3em", color: cores.amareloVivo, marginTop: 14 * escala }}>{slogan}</div>
  </div>
);

const Etapa: React.FC<{ n: number; texto: string; escuro: boolean }> = ({ n, texto, escuro }) => (
  <div style={{ position: "absolute", top: 150, left: 90, display: "flex", alignItems: "center", gap: 22 }}>
    <div
      style={{
        width: 70,
        height: 70,
        borderRadius: 999,
        backgroundColor: escuro ? cores.amareloVivo : cores.preto,
        color: escuro ? cores.preto : cores.amareloVivo,
        fontFamily: fontes.titulo,
        fontWeight: 800,
        fontSize: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {n}
    </div>
    <Revela em={0} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.18em", color: escuro ? cores.amareloVivo : cores.ouro }}>
      {texto}
    </Revela>
  </div>
);

// Papel quadriculado do rascunho.
const Grade: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: cores.offWhite,
      backgroundImage: `linear-gradient(${cores.borda} 2px, transparent 2px), linear-gradient(90deg, ${cores.borda} 2px, transparent 2px)`,
      backgroundSize: "60px 60px",
    }}
  />
);

// 1. Gancho (0–45): o resultado pronto já no quadro 0.
const Gancho: React.FC<ReelsMarcaProps> = ({ gancho, marca, slogan }) => {
  const f = useCurrentFrame();
  const saida = prog(f, 36, 9);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 70, filter: `blur(${saida * 18}px)`, transform: `scale(${1 + saida * 0.3})` }}>
      <div style={{ textAlign: "center", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 100, lineHeight: 1, color: cores.branco }}>
        <div>{gancho[0]}</div>
        <div style={{ color: cores.amareloVivo }}>{gancho[1]}</div>
      </div>
      <div style={{ transform: `rotate(${Math.sin(f / 10) * 3}deg)` }}>
        <Selo tamanho={420} />
      </div>
      <Logotipo marca={marca} slogan={slogan} escala={0.8} />
    </AbsoluteFill>
  );
};

// 2. Conversa (45–105): o briefing entra em etiquetas.
const Conversa: React.FC<ReelsMarcaProps> = ({ briefing, etapas }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Etapa n={1} texto={etapas[0]} escuro />
      <div style={{ position: "absolute", top: 520, left: 90, right: 90, display: "flex", flexWrap: "wrap", gap: 26 }}>
        {briefing.map((b, i) => (
          <Pop
            key={b}
            em={6 + i * 8}
            de={0.3}
            style={{
              backgroundColor: i % 2 ? cores.branco : cores.amareloVivo,
              color: cores.preto,
              fontFamily: fontes.titulo,
              fontWeight: 800,
              fontSize: 76,
              padding: "18px 44px",
              borderRadius: 999,
              transform: `rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg) translateY(${Math.sin((f + i * 20) / 12) * 8}px)`,
            }}
          >
            {b}
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 3. Rascunho (105–195): a espiga é desenhada no papel quadriculado.
const Rascunho: React.FC<ReelsMarcaProps> = ({ etapas }) => {
  const f = useCurrentFrame();
  const tracado = prog(f, 6, 60);
  return (
    <AbsoluteFill>
      <Grade />
      <Etapa n={2} texto={etapas[1]} escuro={false} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `rotate(${-4 + tracado * 4}deg)` }}>
          <Espiga tamanho={560} cor={cores.preto} tracado={tracado} preenche={0} traco={cores.tinta} />
        </div>
      </AbsoluteFill>
      {/* lápis acompanhando o traço */}
      <div
        style={{
          position: "absolute",
          left: 540 + Math.cos(f / 4) * 160 * (1 - tracado),
          top: 1180 - tracado * 640 + Math.sin(f / 3) * 40,
          width: 26,
          height: 200,
          borderRadius: 8,
          backgroundColor: cores.amarelo,
          transform: "rotate(28deg)",
          opacity: tracado < 1 ? 1 : 1 - prog(f, 70, 10),
          boxShadow: "0 10px 20px rgba(0,0,0,.2)",
        }}
      />
    </AbsoluteFill>
  );
};

// 4. Forma (195–270): círculos de construção, a espiga ganha cor e o selo fecha.
const Forma: React.FC<ReelsMarcaProps> = ({ etapas }) => {
  const f = useCurrentFrame();
  const fundo = prog(f, 0, 14);
  const preenche = prog(f, 10, 30);
  const anel = prog(f, 36, 14);
  const raio = interpolate(fundo, [0, 1], [0, 1400]);
  return (
    <AbsoluteFill>
      <Grade />
      <AbsoluteFill style={{ backgroundColor: cores.preto, clipPath: `circle(${raio}px at 540px 960px)` }}>
        <Etapa n={3} texto={etapas[2]} escuro />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {[300, 380, 460].map((r, i) => (
            <div
              key={r}
              style={{
                position: "absolute",
                width: r * 2,
                height: r * 2,
                borderRadius: 9999,
                border: `3px dashed ${cores.ouro}`,
                opacity: (1 - anel) * 0.8,
                transform: `rotate(${f * (i % 2 ? 1 : -1)}deg) scale(${0.6 + fundo * 0.4})`,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              width: 760,
              height: 760,
              borderRadius: 9999,
              boxShadow: `inset 0 0 0 ${26 * anel}px ${cores.amareloVivo}`,
              transform: `scale(${0.8 + anel * 0.2})`,
            }}
          />
          <Espiga tamanho={330} cor={cores.amareloVivo} preenche={preenche} traco={cores.amareloVivo} contorno={preenche > 0.5 ? cores.preto : cores.branco} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 5. Letra (270–345): o nome é digitado e o selo encolhe para o lado.
const Letra: React.FC<ReelsMarcaProps> = ({ etapas, marca, slogan }) => {
  const f = useCurrentFrame();
  const letras = Math.floor(interpolate(f, [8, 40], [0, marca.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cursor = f < 46 && Math.floor(f / 6) % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 60 }}>
      <Etapa n={4} texto={etapas[3]} escuro />
      <div style={{ transform: `scale(${interpolate(prog(f, 0, 12), [0, 1], [1.8, 1])})` }}>
        <Selo tamanho={380} />
      </div>
      <div style={{ textAlign: "center", minHeight: 200 }}>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 130, lineHeight: 1, color: cores.branco }}>
          {marca.slice(0, letras)}
          <span style={{ color: cores.amareloVivo, opacity: cursor ? 1 : 0 }}>|</span>
        </div>
        <Revela em={44} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.3em", color: cores.amareloVivo, marginTop: 16 }}>
          {slogan}
        </Revela>
      </div>
    </AbsoluteFill>
  );
};

// 6. Aplicações (345–405): copo, sacola e perfil entram em cards.
const Aplicacoes: React.FC<ReelsMarcaProps> = ({ etapas, marca, slogan }) => {
  const f = useCurrentFrame();
  const card: React.CSSProperties = {
    backgroundColor: cores.branco,
    borderRadius: 28,
    boxShadow: "0 20px 50px rgba(0,0,0,.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <Etapa n={5} texto={etapas[4]} escuro={false} />
      {/* Copo */}
      <Pop em={0} de={0.3} style={{ ...card, left: 90, top: 330, width: 430, height: 620, transform: `rotate(${-3 + Math.sin(f / 9) * 1.5}deg)` }}>
        <div
          style={{
            width: 240,
            height: 340,
            backgroundColor: cores.preto,
            clipPath: "polygon(0 0, 100% 0, 86% 100%, 14% 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 40,
          }}
        >
          <Espiga tamanho={90} cor={cores.amareloVivo} contorno={cores.preto} />
        </div>
      </Pop>
      {/* Sacola */}
      <Pop em={10} de={0.3} style={{ ...card, right: 90, top: 400, width: 430, height: 620, transform: `rotate(${4 + Math.sin(f / 11) * 1.5}deg)` }}>
        <div style={{ position: "relative", width: 280, height: 340, backgroundColor: cores.amareloVivo, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ position: "absolute", top: -60, width: 120, height: 90, borderRadius: "60px 60px 0 0", border: `12px solid ${cores.preto}`, borderBottom: "none" }} />
          <Espiga tamanho={80} cor={cores.preto} contorno={cores.amareloVivo} />
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 40, color: cores.preto }}>{marca}</div>
        </div>
      </Pop>
      {/* Perfil */}
      <Pop em={20} de={0.3} style={{ ...card, left: 90, right: 90, top: 1100, height: 420, padding: "0 50px", justifyContent: "flex-start", gap: 40 }}>
        <Selo tamanho={240} />
        <div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, color: cores.tinta }}>{marca}</div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, letterSpacing: "0.2em", color: cores.ouro }}>{slogan}</div>
          <div style={{ display: "flex", gap: 30, marginTop: 20, fontFamily: fontes.texto, fontSize: 30, color: cores.cinza700 }}>
            <span>
              <b>{Math.round(interpolate(f, [20, 55], [0, 1280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}</b> seguidores
            </span>
          </div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// 7. Chamada (405–450)
const Chamada: React.FC<ReelsMarcaProps> = ({ convite, cta, arroba, aviso }) => {
  const f = useCurrentFrame();
  const brilho = Math.exp(-(f % 15) / 4);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 50, padding: "0 80px" }}>
      <Pop em={0} de={0.8}>
        <Img src={staticFile("logo-full.png")} style={{ width: 820 }} />
      </Pop>
      <div style={{ textAlign: "center" }}>
        <Revela em={4} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: cores.branco }}>
          {convite[0]}
        </Revela>
        <Revela em={10} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: cores.amareloVivo }}>
          {convite[1]}
        </Revela>
      </div>
      <Pop
        em={14}
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
      <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 42, color: cores.amareloVivo }}>{arroba}</div>
      <div style={{ position: "absolute", bottom: 120, fontFamily: fontes.texto, fontSize: 28, color: cores.cinza500 }}>{aviso}</div>
    </AbsoluteFill>
  );
};

export const ReelsMarca: React.FC<ReelsMarcaProps> = (props) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    <Sequence durationInFrames={45}>
      <Gancho {...props} />
    </Sequence>
    <Sequence from={45} durationInFrames={60}>
      <Conversa {...props} />
    </Sequence>
    <Sequence from={105} durationInFrames={90}>
      <Rascunho {...props} />
    </Sequence>
    <Sequence from={195} durationInFrames={75}>
      <Forma {...props} />
    </Sequence>
    <Sequence from={270} durationInFrames={75}>
      <Letra {...props} />
    </Sequence>
    <Sequence from={345} durationInFrames={60}>
      <Aplicacoes {...props} />
    </Sequence>
    <Sequence from={405}>
      <Chamada {...props} />
    </Sequence>
  </AbsoluteFill>
);
