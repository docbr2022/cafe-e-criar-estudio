import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faBell, faGlobe, faPlus } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "./marca";
import { Icone } from "./ReelsOferta";
import { LogoCor, temas } from "./ReelsCupom";

// Reels "comandas", 22 s a 30 fps. Conceito próprio para o SuperMenu: as comandas dos pedidos
// chegam penduradas no trilho da cozinha, sem taxa por venda; depois o celular mostra o painel real.
// Gancho (0–75) | trilho + taxa zero (75–300) | telas (300–450) | combo (450–560) | chamada (560–660).
export const COMANDA_FPS = 30;
export const COMANDA_DURACAO = 660;

const mono = "'JetBrains Mono', monospace";
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

export type Comanda = { local: string; hora: string; itens: string[]; valor: string };
export type ReelsComandaProps = {
  tema: keyof typeof temas;
  gancho: [string, string, string]; // a linha do meio leva o risco
  comandas: Comanda[];
  taxaRotulo: string;
  taxaValor: string;
  taxaApoio: string;
  telas: { arquivo: string; selo: string }[];
  combo: { sistema: string; marketing: string[]; resultado: string };
  site: string;
  sitePergunta: string;
  convite: string;
  cta: string;
  arroba: string;
};

export const reelsComandaPadrao: ReelsComandaProps = {
  tema: "verde",
  gancho: ["Ainda paga", "taxa de app", "para vender o seu lanche?"],
  // Pedidos de exemplo iguais aos do print real do painel (sistemas/supermenu-pedidos.jpg).
  comandas: [
    { local: "BALCÃO", hora: "18:38", itens: ["2x Pão australiano"], valor: "R$ 46,00" },
    { local: "BALCÃO", hora: "18:17", itens: ["1x Combo Casal", "1x Empanada"], valor: "R$ 56,00" },
    { local: "BALCÃO", hora: "17:55", itens: ["1x Bolo de banana"], valor: "R$ 48,00" },
  ],
  taxaRotulo: "TAXA POR VENDA",
  taxaValor: "R$ 0,00",
  taxaApoio: "Pedido do seu cardápio próprio, direto no seu painel.",
  telas: [
    { arquivo: "sistemas/supermenu-pedidos.jpg", selo: "Todos os pedidos num lugar só" },
    { arquivo: "sistemas/supermenu-categorias.jpg", selo: "Cardápio organizado do seu jeito" },
    { arquivo: "sistemas/supermenu-pdv.jpg", selo: "Garçom lança a mesa pelo celular" },
  ],
  combo: { sistema: "SuperMenu SP", marketing: ["Posts e Reels", "Anúncios locais", "Calendário fixo"], resultado: "Mais gente pedindo direto com você" },
  site: "supermenusp.com.br",
  sitePergunta: "Quer só o sistema? Cadastre-se em",
  convite: "Sistema + marketing: a gente monta com você.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

const Ticket: React.FC<{ c: Comanda; destaque: string; balanco: number }> = ({ c, destaque, balanco }) => (
  <div style={{ width: 300, transformOrigin: "150px -30px", transform: `rotate(${balanco}deg)` }}>
    <div style={{ margin: "0 auto", width: 40, height: 30, backgroundColor: "#c9c9c9", borderRadius: "0 0 10px 10px" }} />
    <div
      style={{
        backgroundColor: "#FFFDF6",
        padding: "22px 24px 30px",
        fontFamily: mono,
        color: "#1a1a1a",
        boxShadow: "0 18px 30px rgba(0,0,0,.25)",
        clipPath: "polygon(0 0,100% 0,100% 96%,90% 100%,80% 96%,70% 100%,60% 96%,50% 100%,40% 96%,30% 100%,20% 96%,10% 100%,0 96%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 26 }}>
        <span>{c.local}</span>
        <span>{c.hora}</span>
      </div>
      <div style={{ borderTop: "3px dashed #999", margin: "14px 0" }} />
      {c.itens.map((it) => (
        <div key={it} style={{ fontSize: 24, lineHeight: 1.5 }}>
          {it}
        </div>
      ))}
      <div style={{ borderTop: "3px dashed #999", margin: "14px 0" }} />
      <div style={{ fontWeight: 700, fontSize: 34 }}>{c.valor}</div>
      <div style={{ fontSize: 22, marginTop: 6, color: "#0b7a43", fontWeight: 700 }}>taxa app: R$ 0,00</div>
      <div style={{ position: "absolute", right: 18, top: 70, width: 26, height: 26, borderRadius: 13, backgroundColor: destaque, opacity: 0.0 }} />
    </div>
  </div>
);

// Trilho de comandas: cada uma entra deslizando da direita e balança ao parar.
const Trilho: React.FC<{ comandas: Comanda[]; destaque: string; inicio: number; y: number }> = ({ comandas, destaque, inicio, y }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 0, height: 22, borderRadius: 11, backgroundColor: "#d9d9d9", boxShadow: "0 6px 14px rgba(0,0,0,.25)" }} />
      {comandas.map((c, i) => {
        const em = i === 0 ? -100 : inicio + (i - 1) * 30;
        const e = i === 0 ? 1 : p(f, em, 16);
        const dt = Math.max(0, f - em - 12);
        const balanco = Math.sin(dt / 3) * 9 * Math.exp(-dt / 14) + Math.sin(f / 20 + i) * 0.8;
        return (
          <div key={i} style={{ position: "absolute", top: 10, left: 70 + i * 320 + (1 - e) * 1100 }}>
            <Ticket c={c} destaque={destaque} balanco={balanco} />
          </div>
        );
      })}
    </div>
  );
};

const Celular: React.FC<{ arquivo: string; largura: number; rolagem?: number }> = ({ arquivo, largura, rolagem = 0 }) => (
  <div style={{ width: largura, height: largura * 1.9, borderRadius: 70, backgroundColor: "#0d0d0d", padding: 22, boxShadow: "0 40px 80px rgba(0,0,0,.35)" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", backgroundColor: "#fff" }}>
      <Img src={staticFile(arquivo)} style={{ width: "100%", transform: `translateY(${-rolagem}px)` }} />
    </div>
  </div>
);

export const ReelsComanda: React.FC<ReelsComandaProps> = (props) => {
  const f = useCurrentFrame();
  const t = temas[props.tema] ?? temas.verde;
  const { gancho, comandas, taxaRotulo, taxaValor, taxaApoio, telas, combo, site, sitePergunta, convite, cta, arroba } = props;

  // Gancho sai para cima; trilho sobe de 1180 para 200.
  const sai = p(f, 62, 14);
  const yTrilho = interpolate(p(f, 64, 18), [0, 1], [1180, 170]);
  const risco = p(f, 14, 10);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 118, lineHeight: 1.0, color: t.texto };

  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      {/* azulejos de cozinha bem sutis */}
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: `linear-gradient(${t.texto} 3px, transparent 3px), linear-gradient(90deg, ${t.texto} 3px, transparent 3px)`, backgroundSize: "135px 135px" }} />

      <Sequence durationInFrames={80}>
        <div style={{ position: "absolute", left: 80, right: 60, top: 300, transform: `translateY(${-sai * 600}px)`, opacity: 1 - sai }}>
          <div style={titulo}>{gancho[0]}</div>
          <div style={{ ...titulo, position: "relative", display: "inline-block", opacity: 0.75 }}>
            {gancho[1]}
            <div style={{ position: "absolute", left: -10, top: "50%", height: 20, borderRadius: 10, width: `${risco * 106}%`, backgroundColor: t.destaque, transform: "rotate(-3deg)" }} />
          </div>
          <div style={{ ...titulo, color: t.destaque }}>{gancho[2]}</div>
        </div>
      </Sequence>

      <Sequence durationInFrames={300}>
        <Trilho comandas={comandas} destaque={t.destaque} inicio={90} y={yTrilho} />
        {/* campainha + taxa zero */}
        <div style={{ position: "absolute", left: 80, right: 80, top: 760, opacity: p(f, 150, 12), transform: `translateY(${(1 - p(f, 150, 12)) * 60}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: t.destaque, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(f / 2) * 12 * Math.exp(-Math.max(0, f - 150) / 20)}deg)` }}>
              <Icone icone={faBell} tamanho={44} cor={t.fundoEscuro} />
            </div>
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, letterSpacing: "0.16em", color: t.texto }}>{taxaRotulo}</div>
          </div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 260, lineHeight: 1, color: t.destaque, marginTop: 20 }}>{taxaValor}</div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 48, lineHeight: 1.35, color: t.texto, marginTop: 20, opacity: p(f, 172, 12) }}>{taxaApoio}</div>
        </div>
      </Sequence>

      {/* telas do painel */}
      <Sequence from={290} durationInFrames={170}>
        <Telas telas={telas} t={t} />
      </Sequence>

      <Sequence from={450} durationInFrames={115}>
        <Combo combo={combo} t={t} />
      </Sequence>

      <Sequence from={560}>
        <Chamada site={site} sitePergunta={sitePergunta} convite={convite} cta={cta} arroba={arroba} t={t} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Telas: React.FC<{ telas: ReelsComandaProps["telas"]; t: (typeof temas)[string] }> = ({ telas, t }) => {
  const f = useCurrentFrame();
  const sobe = p(f, 0, 16);
  const cada = 52;
  const idx = Math.min(telas.length - 1, Math.floor(Math.max(0, f - 10) / cada));
  const local = f - 10 - idx * cada;
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, clipPath: `inset(${(1 - sobe) * 100}% 0 0 0)` }}>
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: `linear-gradient(${t.texto} 3px, transparent 3px), linear-gradient(90deg, ${t.texto} 3px, transparent 3px)`, backgroundSize: "135px 135px" }} />
      <div style={{ position: "absolute", left: 540, top: 300, transform: `translateX(-50%) translateY(${(1 - sobe) * 400}px) rotate(${-3 + Math.sin(f / 25) * 1.5}deg)` }}>
        <div style={{ position: "relative" }}>
          {telas.map((tl, i) => (
            <div key={i} style={{ position: i === 0 ? "relative" : "absolute", top: 0, left: 0, opacity: i === idx ? 1 : 0 }}>
              <Celular arquivo={tl.arquivo} largura={640} rolagem={i === idx ? Math.max(0, local) * 2.2 : 0} />
            </div>
          ))}
        </div>
      </div>
      {telas.map((tl, i) => {
        const e = p(f, 10 + i * cada, 12);
        return i === idx ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              top: 1500,
              textAlign: "center",
              transform: `rotate(2deg) scale(${0.8 + 0.2 * e})`,
              opacity: e,
            }}
          >
            <span style={{ display: "inline-block", backgroundColor: t.destaque, color: "#111", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 52, padding: "14px 36px", borderRadius: 999, whiteSpace: "nowrap" }}>{tl.selo}</span>
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

const Combo: React.FC<{ combo: ReelsComandaProps["combo"]; t: (typeof temas)[string] }> = ({ combo, t }) => {
  const f = useCurrentFrame();
  const junta = p(f, 18, 16);
  const card: React.CSSProperties = { width: 430, borderRadius: 40, padding: "44px 40px", backgroundColor: t.texto, color: "#111", boxShadow: "0 30px 60px rgba(0,0,0,.25)" };
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundoEscuro }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 - junta * 0 }}>
        <div style={{ ...card, transform: `translateX(${(1 - p(f, 0, 14)) * -700}px) rotate(-3deg)` }}>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: t.fundo }}>SISTEMA</div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 66, lineHeight: 1.05, marginTop: 10 }}>{combo.sistema}</div>
        </div>
        <div style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: t.destaque, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(f, 10, 10)}) rotate(${junta * 180}deg)` }}>
          <Icone icone={faPlus} tamanho={50} cor="#111" />
        </div>
        <div style={{ ...card, transform: `translateX(${(1 - p(f, 4, 14)) * 700}px) rotate(3deg)` }}>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: t.fundo }}>MARKETING</div>
          {combo.marketing.map((m) => (
            <div key={m} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, lineHeight: 1.5 }}>
              {m}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1000, textAlign: "center", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.04, color: t.destaque, opacity: p(f, 34, 12), transform: `translateY(${(1 - p(f, 34, 12)) * 60}px)` }}>
        {combo.resultado}
      </div>
    </AbsoluteFill>
  );
};

const Chamada: React.FC<{ site: string; sitePergunta: string; convite: string; cta: string; arroba: string; t: (typeof temas)[string] }> = ({ site, sitePergunta, convite, cta, arroba, t }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, alignItems: "center", justifyContent: "center", gap: 46, padding: "0 70px 140px", clipPath: `circle(${p(f, 0, 14) * 1500}px at 540px 960px)` }}>
      <LogoCor arquivo="logo-full.png" cor={t.logo} largura={800} proporcao={848 / 224} />
      <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: t.texto, textAlign: "center", opacity: p(f, 6, 10) }}>{convite}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, backgroundColor: t.destaque, color: "#111", fontFamily: fontes.texto, fontWeight: 600, fontSize: 56, padding: "32px 66px", borderRadius: 999, transform: `scale(${p(f, 12, 12)})` }}>
        <Icone icone={faWhatsapp} tamanho={66} cor="#111" />
        {cta}
      </div>
      <div style={{ textAlign: "center", opacity: p(f, 24, 10) }}>
        <div style={{ fontFamily: fontes.texto, fontSize: 40, color: t.texto }}>{sitePergunta}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginTop: 14, fontFamily: mono, fontWeight: 700, fontSize: 50, color: t.texto, borderBottom: `6px solid ${t.destaque}`, paddingBottom: 6 }}>
          <Icone icone={faGlobe} tamanho={44} cor={t.destaque} />
          {site}
        </div>
      </div>
      <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, color: t.destaque, opacity: p(f, 30, 10) }}>{arroba}</div>
    </AbsoluteFill>
  );
};
