import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faBell, faGlobe, faHouse, faLocationDot, faLock } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "./marca";
import { Icone } from "./ReelsOferta";
import { LogoCor, temas } from "./ReelsCupom";

// Reels "abas", ~22 s a 30 fps. Conceito próprio para o ImobiCore: janelas de vários lugares flutuando
// (portais, grupo, planilha) se juntam numa janela só; o endereço próprio é digitado e o site real aparece.
// Gancho (0–80) | junta (80–130) | site (130–370) | contatos (370–460) | pino (460–560) | chamada (560–660).
export const ABAS_FPS = 30;
export const ABAS_DURACAO = 660;

const mono = "'JetBrains Mono', monospace";
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

export type ReelsAbasProps = {
  tema: keyof typeof temas;
  gancho: [string, string, string];
  abas: string[];
  endereco: string;
  telas: { arquivo: string; selo: string }[];
  contatos: string[];
  combo: { marketing: string[]; resultado: string };
  site: string;
  sitePergunta: string;
  convite: string;
  cta: string;
  arroba: string;
};

export const reelsAbasPadrao: ReelsAbasProps = {
  tema: "azul",
  gancho: ["Seus imóveis", "ainda espalhados", "em vários portais?"],
  abas: ["Portal 1", "Portal 2", "Portal 3", "Grupo de WhatsApp", "Planilha de imóveis"],
  endereco: "suaimobiliaria.com.br",
  telas: [
    { arquivo: "sistemas/imobicore-busca.jpg", selo: "Busca por cidade, tipo e preço" },
    { arquivo: "sistemas/imobicore-imovel.jpg", selo: "Uma página por imóvel" },
  ],
  contatos: ["Novo contato: quer agendar uma visita", "Novo contato pelo WhatsApp", "Novo contato: pediu mais fotos"],
  combo: { marketing: ["Posts e Reels", "Anúncios por região", "Imóvel em destaque"], resultado: "Mais contatos para o seu corretor" },
  site: "imobicore.com.br",
  sitePergunta: "Quer só o sistema? Cadastre-se em",
  convite: "Sistema + marketing: a gente monta com você.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

const Janela: React.FC<{ titulo: string; largura: number; altura: number; children?: React.ReactNode; endereco?: React.ReactNode }> = ({ titulo, largura, altura, children, endereco }) => (
  <div style={{ width: largura, height: altura, borderRadius: 28, backgroundColor: "#fff", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,20,.35)" }}>
    <div style={{ height: 64, backgroundColor: "#E9EDF7", display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c }} />
      ))}
      <div style={{ marginLeft: 12, fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, color: "#333", whiteSpace: "nowrap", overflow: "hidden" }}>{titulo}</div>
    </div>
    {endereco}
    <div style={{ position: "relative", height: altura - 64, overflow: "hidden" }}>{children}</div>
  </div>
);

// Conteúdo genérico de "anúncio de imóvel" dentro das janelas espalhadas.
const Esboco: React.FC = () => (
  <div style={{ padding: 20 }}>
    <div style={{ height: 130, borderRadius: 14, backgroundColor: "#D6DDEE", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icone icone={faHouse} tamanho={60} cor="#9AA8C8" />
    </div>
    <div style={{ height: 18, width: "80%", borderRadius: 9, backgroundColor: "#D6DDEE", marginTop: 18 }} />
    <div style={{ height: 18, width: "55%", borderRadius: 9, backgroundColor: "#D6DDEE", marginTop: 12 }} />
  </div>
);

export const ReelsAbas: React.FC<ReelsAbasProps> = (props) => {
  const f = useCurrentFrame();
  const t = temas[props.tema] ?? temas.azul;
  const { gancho, abas } = props;
  const junta = p(f, 80, 30);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1.0, color: t.texto };
  const pos = [
    { x: 60, y: 760, r: -8 },
    { x: 560, y: 700, r: 6 },
    { x: 120, y: 1150, r: 5 },
    { x: 600, y: 1120, r: -6 },
    { x: 330, y: 1430, r: 3 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundoEscuro }}>
      <AbsoluteFill style={{ opacity: 0.1, backgroundImage: `radial-gradient(${t.texto} 3px, transparent 3px)`, backgroundSize: "60px 60px" }} />
      <Sequence durationInFrames={135}>
        <div style={{ position: "absolute", left: 80, right: 60, top: 250, opacity: 1 - p(f, 78, 12), transform: `translateY(${-p(f, 78, 12) * 200}px)` }}>
          <div style={titulo}>{gancho[0]}</div>
          <div style={titulo}>{gancho[1]}</div>
          <div style={{ ...titulo, color: t.destaque }}>{gancho[2]}</div>
        </div>
        {abas.map((a, i) => {
          const q = pos[i % pos.length];
          const flutua = Math.sin(f / 14 + i * 1.7) * 14;
          const x = interpolate(junta, [0, 1], [q.x, 160]);
          const y = interpolate(junta, [0, 1], [q.y + flutua, 520]);
          return (
            <div key={a} style={{ position: "absolute", left: x, top: y, transform: `rotate(${q.r * (1 - junta)}deg) scale(${1 - junta * 0.1})`, opacity: f > 118 ? 0 : 1 }}>
              <Janela titulo={a} largura={420} altura={300}>
                <Esboco />
              </Janela>
            </div>
          );
        })}
      </Sequence>
      <Sequence from={112} durationInFrames={265}>
        <Site {...props} />
      </Sequence>
      <Sequence from={370} durationInFrames={95}>
        <Contatos {...props} />
      </Sequence>
      <Sequence from={460} durationInFrames={105}>
        <Pino {...props} />
      </Sequence>
      <Sequence from={560}>
        <Chamada {...props} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Site: React.FC<ReelsAbasProps> = ({ endereco, telas, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.azul;
  const abre = p(f, 0, 16);
  const letras = Math.floor(interpolate(f, [16, 46], [0, endereco.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cursor = Math.floor(f / 8) % 2 === 0;
  const troca = 150;
  const idx = f < troca ? 0 : 1;
  const local = f < troca ? f - 50 : f - troca;
  const barra = (
    <div style={{ height: 80, backgroundColor: "#F4F6FB", borderBottom: "2px solid #E1E6F0", display: "flex", alignItems: "center", padding: "0 24px" }}>
      <div style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: "#fff", border: `3px solid ${letras >= endereco.length ? t.fundo : "#D6DDEE"}`, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", fontFamily: mono, fontSize: 32, color: "#111" }}>
        <Icone icone={faLock} tamanho={24} cor="#2f9e44" />
        {endereco.slice(0, letras)}
        {cursor && letras < endereco.length && <span style={{ width: 3, height: 34, backgroundColor: "#111" }} />}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540, top: 240, transform: `translateX(-50%) scale(${0.6 + 0.4 * abre})`, transformOrigin: "50% 20%", opacity: abre }}>
        <Janela titulo="Imobiliária" largura={940} altura={1260} endereco={barra}>
          {f > 46 &&
            telas.map((tl, i) => (
              <Img
                key={i}
                src={staticFile(tl.arquivo)}
                style={{ position: "absolute", left: 0, top: -135, width: "100%", opacity: i === idx ? p(f, i === 0 ? 46 : troca, 10) : 0, transform: `translateY(${-Math.max(0, local) * (i === 0 ? 4 : 5)}px)` }}
              />
            ))}
        </Janela>
      </div>
      {telas.map((tl, i) =>
        i === idx && f > 56 ? (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", opacity: p(f, i === 0 ? 56 : troca + 6, 10) }}>
            <span style={{ display: "inline-block", backgroundColor: t.destaque, color: "#111", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 56, padding: "16px 40px", borderRadius: 999, whiteSpace: "nowrap" }}>{tl.selo}</span>
          </div>
        ) : null,
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, color: t.texto, opacity: p(f, 46, 10) }}>
        Seu endereço, sua vitrine.
      </div>
    </AbsoluteFill>
  );
};

const Contatos: React.FC<ReelsAbasProps> = ({ contatos, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.azul;
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, clipPath: `inset(0 0 ${(1 - p(f, 0, 14)) * 100}% 0)` }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 300, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 100, lineHeight: 1, color: t.texto }}>
        O contato chega <span style={{ color: t.destaque }}>direto para você</span>
      </div>
      {contatos.map((c, i) => {
        const e = p(f, 16 + i * 14, 10);
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              top: 760 + i * 210,
              backgroundColor: "#fff",
              borderRadius: 32,
              padding: "30px 36px",
              display: "flex",
              alignItems: "center",
              gap: 26,
              boxShadow: "0 20px 40px rgba(0,0,30,.3)",
              transform: `translateY(${(1 - e) * -120}px) scale(${0.9 + 0.1 * e})`,
              opacity: e,
            }}
          >
            <div style={{ width: 90, height: 90, borderRadius: 24, backgroundColor: i === 1 ? "#25D366" : t.fundo, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
              <Icone icone={i === 1 ? faWhatsapp : faBell} tamanho={50} cor="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, color: "#6b6b6b" }}>ImobiCore • agora</div>
              <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, color: "#111" }}>{c}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Pino: React.FC<ReelsAbasProps> = ({ combo, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.azul;
  const cai = p(f, 0, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundoEscuro }}>
      <AbsoluteFill style={{ opacity: 0.1, backgroundImage: `radial-gradient(${t.texto} 3px, transparent 3px)`, backgroundSize: "60px 60px" }} />
      {[0, 1, 2].map((k) => {
        const r = p(f, 14 + k * 8, 30);
        return <div key={k} style={{ position: "absolute", left: 540 - 60 - r * 300, top: 760 - r * 120, width: 120 + r * 600, height: 50 + r * 240, borderRadius: "50%", border: `6px solid ${t.destaque}`, opacity: 1 - r }} />;
      })}
      <div style={{ position: "absolute", left: 540, top: 300, transform: `translate(-50%, ${(1 - cai) * -700}px)` }}>
        <Icone icone={faLocationDot} tamanho={460} cor={t.destaque} />
      </div>
      {combo.marketing.map((m, i) => (
        <div
          key={m}
          style={{
            position: "absolute",
            top: 930 + i * 120,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: p(f, 24 + i * 6, 10),
          }}
        >
          <span style={{ display: "inline-block", backgroundColor: "#fff", color: t.fundoEscuro, fontFamily: fontes.texto, fontWeight: 600, fontSize: 44, padding: "14px 36px", borderRadius: 999 }}>{m}</span>
        </div>
      ))}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, textAlign: "center", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1.04, color: t.texto, opacity: p(f, 46, 12) }}>
        {combo.resultado}
      </div>
    </AbsoluteFill>
  );
};

const Chamada: React.FC<ReelsAbasProps> = ({ site, sitePergunta, convite, cta, arroba, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.azul;
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, alignItems: "center", justifyContent: "center", gap: 46, padding: "0 70px 140px", clipPath: `circle(${p(f, 0, 14) * 1500}px at 540px 700px)` }}>
      <LogoCor arquivo="logo-full.png" cor={t.logo} largura={800} proporcao={848 / 224} />
      <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: t.texto, textAlign: "center" }}>{convite}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, backgroundColor: t.texto, color: t.fundo, fontFamily: fontes.texto, fontWeight: 600, fontSize: 56, padding: "32px 66px", borderRadius: 999, transform: `scale(${p(f, 10, 12)})` }}>
        <Icone icone={faWhatsapp} tamanho={66} cor={t.fundo} />
        {cta}
      </div>
      <div style={{ textAlign: "center", opacity: p(f, 22, 10) }}>
        <div style={{ fontFamily: fontes.texto, fontSize: 40, color: t.texto }}>{sitePergunta}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginTop: 14, fontFamily: mono, fontWeight: 700, fontSize: 50, color: t.texto, borderBottom: `6px solid ${t.destaque}`, paddingBottom: 6 }}>
          <Icone icone={faGlobe} tamanho={44} cor={t.destaque} />
          {site}
        </div>
      </div>
      <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, color: t.destaque, opacity: p(f, 28, 10) }}>{arroba}</div>
    </AbsoluteFill>
  );
};
