import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowDown,
  faArrowTrendUp,
  faBullseye,
  faCheck,
  faGear,
  faHandshake,
  faPalette,
  faPenNib,
  faRocket,
  faThumbsDown,
  faThumbsUp,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cores, fontes } from "./marca";
import { Icone } from "./ReelsOferta";
import { LogoCor } from "./ReelsCupom";
import { cortesTeste, duracaoBaseTeste, falasTeste } from "./teste-falas";

// Teste de edição de vídeo falado (07/11/2026). Não entra no calendário.
// Base já cortada no ffmpeg (sem pausas); aqui entram zoom por corte, legenda palavra a palavra,
// gráficos ligados à fala e cartão final.
export const TESTE_FPS = 30;
const BASE = Math.round(duracaoBaseTeste * TESTE_FPS);
const FINAL = 105;
export const TESTE_DURACAO = BASE + FINAL;

const AZUL = "#1F4FE0";
const AZUL_ESC = "#0B2A8A";
const AMARELO = cores.amareloVivo;

const suave = Easing.bezier(0.16, 1, 0.3, 1);
const prog = (f: number, a: number, d: number) =>
  interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

// ---------- zoom por corte ----------
const inicioCortes = (() => {
  const r: number[] = [];
  let acc = 0;
  cortesTeste.forEach(([a, b]) => {
    r.push(acc);
    acc += b - a;
  });
  return r;
})();
// alterna enquadramento aberto e fechado a cada corte (esconde o salto do jump cut)
const ZOOMS = [1.0, 1.1, 1.04, 1.13, 1.0, 1.08];

const Camera: React.FC<{ f: number }> = ({ f }) => {
  const t = f / TESTE_FPS;
  let i = 0;
  while (i + 1 < inicioCortes.length && t >= inicioCortes[i + 1]) i++;
  const z = ZOOMS[i % ZOOMS.length];
  const desde = t - inicioCortes[i];
  const empurra = 1 + Math.min(desde, 6) * 0.006; // aproximação lenta dentro do corte
  // "soco" de zoom nas palavras-chave
  const soco = SOCOS.reduce((acc, s) => {
    const d = t - s;
    return d >= 0 && d < 0.5 ? acc + 0.06 * Math.sin((d / 0.5) * Math.PI) : acc;
  }, 0);
  return (
    // a câmera do celular abre escura no 1º segundo; compensa a exposição
    <AbsoluteFill style={{ transform: `scale(${z * empurra + soco})`, transformOrigin: "50% 20%", filter: `brightness(${interpolate(t, [0, 0.8, 0.95], [1.42, 1.34, 1], { extrapolateRight: "clamp" })})` }}>
      <OffthreadVideo src={staticFile("teste/base.mp4")} muted style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

const tempoDe = (palavra: string, n = 0) => {
  const achadas = falasTeste.filter((w) => w.t.replace(/[.,]/g, "").toLowerCase() === palavra.toLowerCase());
  return achadas[n]?.s ?? 0;
};
const SOCOS = [tempoDe("marketing"), tempoDe("faturar"), tempoDe("parceira"), tempoDe("fature"), tempoDe("confiança"), tempoDe("faturar", 1)];

// ---------- legendas ----------
type Grupo = { palavras: { t: string; s: number; e: number }[]; s: number; e: number };
const grupos: Grupo[] = (() => {
  const g: Grupo[] = [];
  let atual: Grupo | null = null;
  falasTeste.forEach((w, i) => {
    const prox = falasTeste[i + 1];
    if (!atual) atual = { palavras: [], s: w.s, e: w.e };
    atual.palavras.push(w);
    atual.e = w.e;
    const letras = atual.palavras.map((p) => p.t).join(" ").length;
    const quebra = /[.,]$/.test(w.t) || atual.palavras.length >= 3 || letras > 16 || !prox || prox.s - w.e > 0.35;
    if (quebra) {
      g.push(atual);
      atual = null;
    }
  });
  // cada grupo fica até o próximo começar
  g.forEach((x, i) => (x.e = g[i + 1] ? Math.min(g[i + 1].s, x.e + 0.6) : x.e + 0.4));
  return g;
})();
const DESTAQUES = /^(marketing|equipe|faturar|fature|lucre|vendas|parceira|prestador|persona|mercado|cliente|dinheiro|confiança|processos|design|link|qualidade|clientes|crescer)$/i;

const Legenda: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const t = f / fps;
  const g = grupos.find((x) => t >= x.s && t < x.e);
  if (!g || t < 2.6) return null;
  const entra = spring({ frame: f - Math.round(g.s * fps), fps, config: { damping: 14, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1470, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px", transform: `scale(${0.85 + 0.15 * entra}) translateY(${(1 - entra) * 30}px)`, opacity: Math.min(1, entra * 1.5) }}>
      {g.palavras.map((w, i) => {
        const ativa = t >= w.s - 0.03;
        const agora = t >= w.s - 0.03 && t < w.e + 0.05;
        const chave = DESTAQUES.test(w.t.replace(/[.,]/g, ""));
        const cor = ativa && chave ? cores.tinta : "#fff";
        return (
          <span
            key={i}
            style={{
              fontFamily: fontes.titulo,
              fontWeight: 800,
              fontSize: chave ? 90 : 80,
              lineHeight: 1.08,
              color: ativa ? cor : "rgba(255,255,255,.55)",
              padding: "0 14px",
              borderRadius: 18,
              backgroundColor: ativa && chave ? AMARELO : "transparent",
              transform: `scale(${agora ? 1.06 : 1}) rotate(${ativa && chave ? -2 : 0}deg)`,
              display: "inline-block",
              WebkitTextStroke: ativa && chave ? undefined : "3px #000",
              paintOrder: "stroke fill",
              textShadow: ativa && chave ? undefined : "0 6px 0 rgba(0,0,0,.55), 0 0 24px rgba(0,0,0,.35)",
            }}
          >
            {w.t.replace(/,$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// ---------- gancho (quadro 0 = capa) ----------
const Gancho: React.FC<{ f: number }> = ({ f }) => {
  const sai = prog(f, 72, 12);
  if (sai >= 1) return null;
  const linhas = ["Um time de", "marketing inteiro", "trabalhando por você"];
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 820, background: "linear-gradient(180deg, rgba(11,42,138,.95) 0%, rgba(11,42,138,.8) 55%, rgba(11,42,138,0) 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, transform: `translateY(${-sai * 60}px)` }}>
        <div style={{ display: "inline-block", backgroundColor: AMARELO, color: cores.tinta, fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, padding: "8px 22px", borderRadius: 12, marginBottom: 18 }}>
          Você sabia?
        </div>
        {linhas.map((l, i) => (
          <div key={i} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 90, lineHeight: 0.98, color: i === 1 ? AMARELO : "#fff", textShadow: "0 6px 0 rgba(0,0,0,.25)" }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- cartões ligados à fala ----------
const Cartao: React.FC<{ f: number; de: number; ate: number; children: React.ReactNode; top?: number }> = ({ f, de, ate, children, top = 1190 }) => {
  const a = Math.round(de * TESTE_FPS);
  const b = Math.round(ate * TESTE_FPS);
  if (f < a - 1 || f > b + 12) return null;
  const e = spring({ frame: f - a, fps: TESTE_FPS, config: { damping: 15, stiffness: 180 } });
  const s = prog(f, b, 10);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, transform: `translateY(${(1 - e) * 120 + s * 40}px) scale(${0.9 + 0.1 * e})`, opacity: Math.min(1, e * 1.4) * (1 - s), display: "flex", justifyContent: "center" }}>
      {children}
    </div>
  );
};

const Chip: React.FC<{ icone: typeof faCheck; texto: string; f: number; em: number; fundo?: string; cor?: string; riscado?: boolean }> = ({ icone, texto, f, em, fundo = AZUL, cor = "#fff", riscado }) => {
  const e = spring({ frame: f - Math.round(em * TESTE_FPS), fps: TESTE_FPS, config: { damping: 12, stiffness: 200 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, backgroundColor: fundo, color: cor, padding: "14px 24px", borderRadius: 22, fontFamily: fontes.titulo, fontWeight: 700, fontSize: 42, transform: `scale(${e})`, boxShadow: "0 14px 30px rgba(0,0,0,.25)", position: "relative" }}>
      <Icone icone={icone} tamanho={44} cor={cor === "#fff" ? AMARELO : cor} />
      {texto}
      {riscado && (
        <div style={{ position: "absolute", left: 20, top: "52%", height: 8, borderRadius: 4, backgroundColor: "#FF3B3B", width: `${prog(f, Math.round(em * TESTE_FPS) + 14, 10) * 92}%` }} />
      )}
    </div>
  );
};

const Linha: React.FC<{ children: React.ReactNode; gap?: number; col?: boolean }> = ({ children, gap = 18, col }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap, flexDirection: col ? "column" : "row", alignItems: "center" }}>{children}</div>
);

const Grafico: React.FC<{ f: number; em: number }> = ({ f, em }) => {
  const a = Math.round(em * TESTE_FPS);
  const alturas = [0.3, 0.45, 0.62, 0.8, 1];
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 36, padding: "22px 36px 22px", width: 640, boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 46, color: AZUL_ESC }}>
        <Icone icone={faArrowTrendUp} tamanho={48} cor={AZUL} />
        Vendas
        <span style={{ marginLeft: "auto", color: "#0F9D58" }}>+{Math.round(prog(f, a, 40) * 38)}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 110, marginTop: 12 }}>
        {alturas.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h * 100 * prog(f, a + i * 5, 18)}%`, borderRadius: 14, backgroundColor: i === alturas.length - 1 ? AMARELO : AZUL }} />
        ))}
      </div>
    </div>
  );
};

const Sobreposicoes: React.FC<{ f: number }> = ({ f }) => {
  const T = tempoDe;
  return (
    <>
      {/* equipe de marketing */}
      <Cartao f={f} de={T("equipe")} ate={T("valores") - 0.1}>
        <Linha>
          <Chip f={f} em={T("equipe")} icone={faPalette} texto="Design" />
          <Chip f={f} em={T("equipe") + 0.15} icone={faPenNib} texto="Texto" />
          <Chip f={f} em={T("equipe") + 0.3} icone={faUsers} texto="Social media" />
          <Chip f={f} em={T("equipe") + 0.45} icone={faBullseye} texto="Tráfego" />
        </Linha>
      </Cartao>
      {/* tamanhos de empresa */}
      <Cartao f={f} de={T("pequeno")} ate={T("esteja")}>
        <Linha gap={14}>
          <Chip f={f} em={T("pequeno")} icone={faCheck} texto="Pequena" />
          <Chip f={f} em={T("micro")} icone={faCheck} texto="Micro" />
          <Chip f={f} em={T("média")} icone={faCheck} texto="Média empresa" />
        </Linha>
      </Cartao>
      {/* começando ou já rodando */}
      <Cartao f={f} de={T("esteja")} ate={T("e", 0) + 0.2}>
        <Linha gap={14}>
          <Chip f={f} em={T("esteja")} icone={faRocket} texto="Começando agora" />
          <Chip f={f} em={T("carteira")} icone={faUsers} texto="Já com clientes" fundo={AMARELO} cor={cores.tinta} />
        </Linha>
      </Cartao>
      {/* faturar mais */}
      <Cartao f={f} de={T("melhorar") - 0.2} ate={T("vem") - 0.2}>
        <Grafico f={f} em={T("melhorar")} />
      </Cartao>
      {/* link abaixo */}
      <Cartao f={f} de={T("clique")} ate={T("café") - 0.1} top={1250}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, backgroundColor: AMARELO, color: cores.tinta, borderRadius: 999, padding: "22px 40px", fontFamily: fontes.titulo, fontWeight: 800, fontSize: 54 }}>
          Link abaixo
          <span style={{ display: "inline-block", transform: `translateY(${Math.sin(f / 3) * 10}px)` }}>
            <Icone icone={faArrowDown} tamanho={52} cor={cores.tinta} />
          </span>
        </div>
      </Cartao>
      {/* parceira x prestador */}
      <Cartao f={f} de={T("parceira")} ate={T("saiba") - 0.05}>
        <Linha gap={14}>
          <Chip f={f} em={T("parceira")} icone={faHandshake} texto="Parceira de trabalho" fundo={AMARELO} cor={cores.tinta} />
          <Chip f={f} em={T("prestador") - 0.15} icone={faXmark} texto="Só prestador de serviço" fundo="#fff" cor="#666" riscado />
        </Linha>
      </Cartao>
      {/* fature, lucre, venda */}
      <Cartao f={f} de={T("fature")} ate={T("sempre") - 0.3}>
        <Grafico f={f} em={T("fature")} />
      </Cartao>
      {/* estudo */}
      <Cartao f={f} de={T("fazemos")} ate={T("faremos", 1) - 0.1}>
        <div style={{ backgroundColor: "#fff", borderRadius: 36, padding: "20px 28px", width: 900, boxShadow: "0 20px 50px rgba(0,0,0,.3)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
          {[
            { em: T("mercado"), icone: faCheck, texto: "Estudo de mercado", cor: AZUL },
            { em: T("persona"), icone: faCheck, texto: "Persona", cor: AZUL },
            { em: T("gosta"), icone: faThumbsUp, texto: "Do que ele gosta", cor: "#0F9D58" },
            { em: T("gosta", 1), icone: faThumbsDown, texto: "Do que não gosta", cor: "#E5484D" },
          ].map((it, i) => {
            const e = prog(f, Math.round(it.em * TESTE_FPS) - 4, 10);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: fontes.titulo, fontWeight: 700, fontSize: 36, lineHeight: 1.05, color: cores.tinta, opacity: e, transform: `translateX(${(1 - e) * -40}px)` }}>
                <div style={{ width: 62, height: 62, borderRadius: 16, backgroundColor: it.cor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icone icone={it.icone} tamanho={34} cor="#fff" />
                </div>
                {it.texto}
              </div>
            );
          })}
        </div>
      </Cartao>
      {/* mais dinheiro, clientes, confiança */}
      <Cartao f={f} de={T("dinheiro") - 0.1} ate={T("e", 1) - 0.1}>
        <Linha gap={14}>
          <Chip f={f} em={T("dinheiro") - 0.1} icone={faArrowTrendUp} texto="+ faturamento" />
          <Chip f={f} em={T("cliente", 2) - 0.1} icone={faUsers} texto="+ clientes" />
          <Chip f={f} em={T("confiança") - 0.1} icone={faHandshake} texto="+ confiança" fundo={AMARELO} cor={cores.tinta} />
        </Linha>
      </Cartao>
      {/* processos internos */}
      <Cartao f={f} de={T("processos") - 0.1} ate={T("fale") - 0.1}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, backgroundColor: AZUL, borderRadius: 32, padding: "26px 38px", boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
          <div style={{ transform: `rotate(${f * 4}deg)` }}>
            <Icone icone={faGear} tamanho={72} cor={AMARELO} />
          </div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 52, color: "#fff", lineHeight: 1.05 }}>
            Processos internos
            <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 32, color: "#DCE5FF" }}>da sua empresa</div>
          </div>
        </div>
      </Cartao>
    </>
  );
};

// ---------- cartão final ----------
const Final: React.FC<{ f: number }> = ({ f }) => {
  const a = BASE - 6;
  if (f < a) return null;
  const cobre = prog(f, a, 16);
  const e = spring({ frame: f - a - 10, fps: TESTE_FPS, config: { damping: 13, stiffness: 160 } });
  const cta = spring({ frame: f - a - 28, fps: TESTE_FPS, config: { damping: 12, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, backgroundColor: AZUL, clipPath: `circle(${cobre * 130}% at 50% 62%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: AZUL_ESC, opacity: 0.35, clipPath: `circle(${cobre * 60}% at 50% 62%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50, opacity: cobre }}>
        <div style={{ transform: `scale(${e})` }}>
          <LogoCor arquivo="logo-full.png" cor="#fff" largura={720} proporcao={848 / 224} />
        </div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 78, color: "#fff", textAlign: "center", lineHeight: 1.02, transform: `translateY(${(1 - e) * 40}px)`, opacity: e }}>
          Seu marketing,
          <br />
          <span style={{ color: AMARELO }}>dentro da sua empresa</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, backgroundColor: AMARELO, color: cores.tinta, borderRadius: 999, padding: "24px 48px", fontFamily: fontes.texto, fontWeight: 600, fontSize: 48, transform: `scale(${cta})` }}>
          <Icone icone={faWhatsapp} tamanho={56} cor={cores.tinta} />
          Fale com a gente
        </div>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 38, color: "#DCE5FF", opacity: cta }}>@cafeecriar</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TesteEdicao: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const barra = Math.min(1, f / BASE);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {f < BASE + 20 && <Camera f={Math.min(f, BASE - 1)} />}
      {/* escurece embaixo para a legenda ler bem */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1000, background: "linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 50%, rgba(0,0,0,0) 100%)" }} />
      <Gancho f={f} />
      <Sobreposicoes f={f} />
      <Legenda f={f} fps={fps} />
      {/* barra de progresso */}
      {f < BASE && (
        <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: `${barra * 100}%`, backgroundColor: AMARELO }} />
      )}
      {/* marca discreta */}
      {f > 84 && f < BASE && (
        <div style={{ position: "absolute", right: 46, top: 250, opacity: 0.9 * prog(f, 84, 12) }}>
          <LogoCor arquivo="logo-mark.png" cor="#fff" largura={84} proporcao={1} />
        </div>
      )}
      <Final f={f} />
    </AbsoluteFill>
  );
};
