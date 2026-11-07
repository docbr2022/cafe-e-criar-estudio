import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faCheck, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "./marca";
import { Icone } from "./ReelsOferta";
import { LogoCor, temas } from "./ReelsCupom";

// Reels "caderno", ~21 s a 30 fps. Conceito próprio para o Barber SP: a página do caderno de agenda,
// rabiscada e cheia de mensagens, é arrancada; por baixo aparece a grade de horários se enchendo sozinha.
// Gancho (0–80) | página arrancada (80–110) | grade (110–300) | painel (300–420) | poste (420–520) | chamada (520–630).
export const CADERNO_FPS = 30;
export const CADERNO_DURACAO = 630;

const mono = "'JetBrains Mono', monospace";
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

export type ReelsCadernoProps = {
  tema: keyof typeof temas;
  gancho: [string, string, string];
  rabiscos: string[];
  mensagens: string[];
  horarios: string[];
  gradeTitulo: string;
  gradeApoio: string;
  agendado: string;
  painel: { arquivo: string; selo: string };
  combo: { sistema: string; marketing: string[]; resultado: string };
  site: string;
  sitePergunta: string;
  convite: string;
  cta: string;
  arroba: string;
};

export const reelsCadernoPadrao: ReelsCadernoProps = {
  tema: "preto",
  gancho: ["Sua agenda ainda", "mora no caderno", "e no WhatsApp?"],
  rabiscos: ["9h  Barba", "10h30  Cabelo ??", "12h  ~~Lucas~~ remarcou", "14h  Barba + cabelo", "15h  confirmar"],
  mensagens: ["tem horário hoje?", "e às 15h?", "pode ser amanhã?"],
  horarios: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  gradeTitulo: "O cliente reserva sozinho",
  gradeApoio: "Serviço, barbeiro e horário pelo celular.",
  agendado: "AGENDADO!",
  painel: { arquivo: "sistemas/barbersp-faturamento.jpg", selo: "Caixa e atendimentos no painel" },
  combo: { sistema: "Barber SP", marketing: ["Posts e Reels", "Anúncios no bairro", "Perfil sempre ativo"], resultado: "Agenda organizada e cadeira cheia" },
  site: "barbersp.com.br",
  sitePergunta: "Quer só o sistema? Cadastre-se em",
  convite: "Sistema + marketing: a gente monta com você.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

// Página de caderno pautada com anotações à mão.
const Pagina: React.FC<{ rabiscos: string[] }> = ({ rabiscos }) => (
  <div
    style={{
      width: 860,
      height: 900,
      backgroundColor: "#FBF8EE",
      borderRadius: 18,
      boxShadow: "0 30px 70px rgba(0,0,0,.45)",
      position: "relative",
      backgroundImage: "repeating-linear-gradient(transparent 0 99px, #B9C7E6 99px 102px)",
      backgroundPosition: "0 40px",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 4, backgroundColor: "#E8A0A0" }} />
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 34, top: 80 + i * 120, width: 34, height: 34, borderRadius: 17, backgroundColor: "#1a1a1a" }} />
    ))}
    <div style={{ position: "absolute", left: 140, top: 46, fontFamily: fontes.script, fontSize: 64, color: "#2a2a6a" }}>Agenda — sexta</div>
    {rabiscos.map((r, i) => {
      const riscado = r.includes("~~");
      const texto = r.replace(/~~/g, "");
      return (
        <div key={i} style={{ position: "absolute", left: 140, top: 160 + i * 102, fontFamily: fontes.script, fontSize: 62, color: "#1f2a5a", transform: `rotate(${[-1, 1.5, -2, 0.5, -1][i % 5]}deg)` }}>
          <span style={{ textDecoration: riscado ? "line-through" : "none", textDecorationThickness: 6 }}>{texto}</span>
        </div>
      );
    })}
    {/* mancha de café */}
    <div style={{ position: "absolute", right: 60, bottom: 70, width: 190, height: 190, borderRadius: 95, border: "16px solid rgba(120,70,20,.22)" }} />
  </div>
);

export const ReelsCaderno: React.FC<ReelsCadernoProps> = (props) => {
  const f = useCurrentFrame();
  const t = temas[props.tema] ?? temas.preto;
  const { gancho, rabiscos, mensagens } = props;
  const arranca = p(f, 80, 26);
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.0, color: t.texto };
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      <Sequence from={88} durationInFrames={222}>
        <Grade {...props} />
      </Sequence>
      <Sequence from={300} durationInFrames={125}>
        <Painel {...props} />
      </Sequence>
      <Sequence from={420} durationInFrames={105}>
        <Poste {...props} />
      </Sequence>
      <Sequence from={520}>
        <Chamada {...props} />
      </Sequence>

      {/* gancho por cima de tudo, até a página ser arrancada */}
      <Sequence durationInFrames={110}>
        <AbsoluteFill style={{ backgroundColor: t.fundo, opacity: 1 - p(f, 84, 12) }} />
        <div style={{ position: "absolute", left: 80, right: 60, top: 250, opacity: 1 - p(f, 80, 12) }}>
          <div style={titulo}>{gancho[0]}</div>
          <div style={titulo}>{gancho[1]}</div>
          <div style={{ ...titulo, color: t.destaque }}>{gancho[2]}</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 640,
            transformOrigin: "100% 0%",
            transform: `rotate(${-4 + arranca * 40}deg) translateY(${arranca * 1700}px)`,
          }}
        >
          <Pagina rabiscos={rabiscos} />
        </div>
        {mensagens.map((m, i) => {
          const em = i === 0 ? 0 : 10 + i * 18;
          const e = i === 0 ? 1 : p(f, em, 10);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: [1400, 1090, 790][i],
                [i % 2 ? "left" : "right"]: 50,
                backgroundColor: "#DCF8C6",
                color: "#111",
                borderRadius: 34,
                padding: "22px 34px",
                fontFamily: fontes.texto,
                fontWeight: 500,
                fontSize: 46,
                boxShadow: "0 14px 30px rgba(0,0,0,.35)",
                transform: `scale(${e}) rotate(${i % 2 ? -3 : 3}deg) translateY(${arranca * 1800}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Icone icone={faWhatsapp} tamanho={40} cor="#128C3E" />
              {m}
            </div>
          );
        })}
      </Sequence>
    </AbsoluteFill>
  );
};

const Grade: React.FC<ReelsCadernoProps> = ({ horarios, gradeTitulo, gradeApoio, agendado, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.preto;
  const ordem = [10, 3, 7, 0, 12, 5, 9, 1, 14, 6, 11, 2, 13, 4, 8];
  const carimbo = p(f, 150, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 230 }}>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: t.texto, opacity: p(f, 10, 12) }}>{gradeTitulo}</div>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 44, color: t.destaque, marginTop: 18, opacity: p(f, 18, 12) }}>{gradeApoio}</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 600, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {horarios.map((h, i) => {
          const entra = p(f, 6 + i * 2, 10);
          const k = ordem.indexOf(i);
          const cheio = p(f, 34 + k * 7, 6);
          return (
            <div
              key={h}
              style={{
                height: 150,
                borderRadius: 26,
                border: `4px solid ${cheio > 0.5 ? t.destaque : "#333"}`,
                backgroundColor: cheio > 0.5 ? t.destaque : "#111",
                color: cheio > 0.5 ? "#111" : "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 48,
                transform: `scale(${(0.6 + 0.4 * entra) * (1 + Math.sin(cheio * Math.PI) * 0.12)})`,
                opacity: entra,
              }}
            >
              {h}
              <div style={{ height: 34, fontFamily: fontes.texto, fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {cheio > 0.5 && (
                  <>
                    <Icone icone={faCheck} tamanho={22} cor="#111" /> reservado
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1060,
          transform: `translate(-50%, -50%) rotate(-10deg) scale(${interpolate(carimbo, [0, 1], [3, 1])})`,
          opacity: carimbo,
          backgroundColor: "#fff",
          color: "#111",
          border: `14px solid ${t.destaque}`,
          borderRadius: 30,
          padding: "16px 56px",
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 150,
          boxShadow: "0 30px 60px rgba(0,0,0,.5)",
        }}
      >
        {agendado}
      </div>
    </AbsoluteFill>
  );
};

const Painel: React.FC<ReelsCadernoProps> = ({ painel, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.preto;
  const e = p(f, 0, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3F2EC", clipPath: `circle(${e * 1500}px at 540px 1060px)` }}>
      <div style={{ position: "absolute", left: 540, top: 200, transform: `translateX(-50%) rotate(${3 - e * 3}deg)` }}>
        <div style={{ width: 620, height: 1160, borderRadius: 70, backgroundColor: "#0d0d0d", padding: 22, boxShadow: "0 40px 80px rgba(0,0,0,.3)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", backgroundColor: "#fff" }}>
            <Img src={staticFile(painel.arquivo)} style={{ width: "100%", transform: `translateY(${-Math.max(0, f - 20) * 3}px)` }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", opacity: p(f, 14, 10) }}>
        <span style={{ display: "inline-block", backgroundColor: t.fundo, color: t.destaque, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 56, padding: "16px 40px", borderRadius: 999 }}>{painel.selo}</span>
      </div>
    </AbsoluteFill>
  );
};

// Poste de barbearia girando entre o sistema e o marketing.
const Poste: React.FC<ReelsCadernoProps> = ({ combo, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.preto;
  const lado = (s: number, i: number) => p(f, 6 + i * 6, 12) * s;
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      <div style={{ position: "absolute", left: 465, top: 250, width: 150, height: 760, borderRadius: 75, overflow: "hidden", border: "10px solid #ddd", backgroundColor: "#fff" }}>
        <div style={{ position: "absolute", inset: -200, backgroundImage: `repeating-linear-gradient(45deg, ${t.destaque} 0 40px, #ffffff 40px 80px, #111 80px 120px, #ffffff 120px 160px)`, transform: `translateY(${(f * 8) % 226}px)` }} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 420, width: 370, transform: `translateX(${(1 - lado(1, 0)) * -500}px)` }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: t.destaque }}>SISTEMA</div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 80, lineHeight: 1, color: t.texto, marginTop: 10 }}>{combo.sistema}</div>
      </div>
      <div style={{ position: "absolute", left: 660, top: 420, width: 380, transform: `translateX(${(1 - lado(1, 1)) * 500}px)` }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: t.destaque }}>MARKETING</div>
        {combo.marketing.map((m) => (
          <div key={m} style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 40, lineHeight: 1.45, color: t.texto }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1110, textAlign: "center", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.04, color: t.destaque, opacity: p(f, 30, 12) }}>
        {combo.resultado}
      </div>
    </AbsoluteFill>
  );
};

const Chamada: React.FC<ReelsCadernoProps> = ({ site, sitePergunta, convite, cta, arroba, tema }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.preto;
  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo, alignItems: "center", justifyContent: "center", gap: 46, padding: "0 70px 140px", opacity: p(f, 0, 10) }}>
      <LogoCor arquivo="logo-full.png" cor={t.logo} largura={800} proporcao={848 / 224} />
      <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: t.texto, textAlign: "center" }}>{convite}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, backgroundColor: t.destaque, color: "#111", fontFamily: fontes.texto, fontWeight: 600, fontSize: 56, padding: "32px 66px", borderRadius: 999, transform: `scale(${p(f, 10, 12)})` }}>
        <Icone icone={faWhatsapp} tamanho={66} cor="#111" />
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
