import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowTrendUp,
  faBed,
  faBellConcierge,
  faBolt,
  faBowlFood,
  faBuilding,
  faBullhorn,
  faBurger,
  faCalendarCheck,
  faCar,
  faCashRegister,
  faChartLine,
  faCheck,
  faGlassWater,
  faGlobe,
  faHandPointer,
  faHouse,
  faLocationDot,
  faLock,
  faMagnifyingGlass,
  faMotorcycle,
  faPenNib,
  faPizzaSlice,
  faPlus,
  faRocket,
  faRulerCombined,
  faScissors,
  faStar,
  faStore,
  faUser,
  faUtensils,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { cores, fontes } from "./marca";
import { Graos, Icone, Pop, prog, Revela } from "./ReelsOferta";

// Reels de demonstração de sistema (SuperMenu SP, Barber SP, ImobiCore), 30 s a 30 fps.
// 0–75 gancho (texto inteiro no quadro 0, vira a capa) | 75–165 apresenta o sistema | 165–525 três telas (120 cada)
// 525–675 sistema + gestão de marketing | 675–780 "quer só o sistema? cadastre-se" | 780–900 chamada.
// As telas são desenhadas em código a partir das props; quando houver print real, use { tipo: "imagem" }.
export const SISTEMA_FPS = 30;
export const SISTEMA_DURACAO = 900;
const IMPACTOS = [0, 75, 165, 285, 405, 525, 585, 675, 780];

const ICONES: Record<string, IconDefinition> = {
  burger: faBurger,
  pizza: faPizzaSlice,
  bebida: faGlassWater,
  prato: faBowlFood,
  talheres: faUtensils,
  moto: faMotorcycle,
  tesoura: faScissors,
  agenda: faCalendarCheck,
  caixa: faCashRegister,
  carteira: faWallet,
  usuario: faUser,
  estrela: faStar,
  casa: faHouse,
  predio: faBuilding,
  cama: faBed,
  carro: faCar,
  metragem: faRulerCombined,
  local: faLocationDot,
  busca: faMagnifyingGlass,
  grafico: faChartLine,
  megafone: faBullhorn,
  loja: faStore,
  globo: faGlobe,
  whatsapp: faWhatsapp,
  instagram: faInstagram,
  foguete: faRocket,
  raio: faBolt,
  pena: faPenNib,
  servico: faBellConcierge,
};
const ic = (nome: string) => ICONES[nome] ?? faStar;

type Base = { titulo: string; legenda: string; selo: string };
export type Tela =
  | (Base & {
      tipo: "lista";
      cabecalho: string;
      itens: { nome: string; detalhe: string; preco: string; icone: string }[];
      toques: number[]; // índices tocados pelo dedo
      rodape: string; // barra que sobe no fim (ex.: "Fazer pedido  R$ 61,80")
    })
  | (Base & {
      tipo: "agenda";
      cabecalho: string;
      colunas: string[];
      horarios: string[];
      reservas: { coluna: number; linha: number; cliente: string }[];
    })
  | (Base & {
      tipo: "busca";
      cabecalho: string;
      pesquisa: string;
      filtros: string[];
      total: number;
      resultados: { nome: string; detalhe: string; preco: string; icone: string }[];
    })
  | (Base & {
      tipo: "painel";
      cabecalho: string;
      kpis: { rotulo: string; valor: number; prefixo?: string; casas?: number }[];
      barras: number[]; // 0 a 1
      rotulos: string[];
      feed: { texto: string; valor: string; icone: string }[];
    })
  | (Base & { tipo: "imagem"; arquivo: string });

export type ReelsSistemaProps = {
  sistema: string;
  icone: string;
  nicho: string; // kicker da abertura
  gancho: [string, string, string]; // a última linha fica em amarelo
  slogan: string;
  legendaApresenta: string;
  telas: [Tela, Tela, Tela];
  aviso: string | null; // ex.: "Telas ilustrativas"; null quando as telas forem prints reais
  combo: { marketing: string[]; resultado: [string, string]; legenda: string };
  url: string;
  cadastro: { pergunta: [string, string]; botao: string; legenda: string };
  convite: string;
  cta: string;
  arroba: string;
  trilha: string | null;
};

// ------------------------------------------------------------ utilidades
const decai = (f: number, t: number, tau = 5) => (f < t ? 0 : Math.exp(-(f - t) / tau));
const ultimo = (f: number) => IMPACTOS.filter((t) => t <= f).pop() ?? -100;
const pill: React.CSSProperties = { borderRadius: 999 };

const Listras: React.FC<{ cor: string; opacidade: number; velocidade?: number }> = ({ cor, opacidade, velocidade = 6 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: opacidade }}>
      <div
        style={{
          position: "absolute",
          inset: -800,
          transform: `rotate(-24deg) translateX(${(f * velocidade) % 240}px)`,
          backgroundImage: `repeating-linear-gradient(90deg, ${cor} 0 60px, transparent 60px 240px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Letreiro: React.FC<{ texto: string; top: number; rot: number; sentido: 1 | -1; fundo: string; cor: string }> = ({ texto, top, rot, sentido, fundo, cor }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: -300, right: -300, top, transform: `rotate(${rot}deg)`, backgroundColor: fundo, padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ transform: `translateX(${sentido * (f * 9) - 1400}px)`, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 54, color: cor }}>{texto.repeat(12)}</div>
    </div>
  );
};

// Legenda falada: as palavras acendem uma a uma, num bloco sólido no rodapé.
const Legenda: React.FC<{ texto: string; em?: number; escuro?: boolean; bottom?: number }> = ({ texto, em = 4, escuro = true, bottom = 150 }) => {
  const f = useCurrentFrame();
  const palavras = texto.split(" ");
  const entra = prog(f, em, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom,
        display: "flex",
        justifyContent: "center",
        opacity: entra,
        transform: `translateY(${(1 - entra) * 40}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: escuro ? cores.preto : cores.branco,
          borderRadius: 20,
          padding: "22px 34px",
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.3,
          textAlign: "center",
          color: escuro ? cores.branco : cores.tinta,
          boxShadow: "0 18px 50px rgba(0,0,0,.28)",
        }}
      >
        {palavras.map((p, i) => {
          const aceso = f >= em + 4 + i * 2.2;
          return (
            <span key={i} style={{ opacity: aceso ? 1 : 0.25, color: aceso && i === palavras.length - 1 ? (escuro ? cores.amareloVivo : cores.ouro) : undefined }}>
              {p}
              {i < palavras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Dedo que toca a tela: chega, aperta (onda) e sai.
const Dedo: React.FC<{ x: number; y: number; em: number }> = ({ x, y, em }) => {
  const f = useCurrentFrame();
  if (f < em - 10 || f > em + 18) return null;
  const chega = prog(f, em - 10, 10);
  const onda = prog(f, em, 14);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 60,
          top: y - 60,
          width: 120,
          height: 120,
          ...pill,
          border: `6px solid ${cores.amarelo}`,
          transform: `scale(${0.3 + onda * 1.2})`,
          opacity: f < em ? 0 : 1 - onda,
        }}
      />
      <div style={{ position: "absolute", left: x - 18, top: y - 8 + (1 - chega) * 120, opacity: chega, transform: `scale(${f >= em && f < em + 5 ? 0.85 : 1})` }}>
        <Icone icone={faHandPointer} tamanho={92} cor={cores.preto} style={{ filter: "drop-shadow(0 0 0 #fff) drop-shadow(3px 3px 0 #fff) drop-shadow(-3px -3px 0 #fff)" }} />
      </div>
    </>
  );
};

// ------------------------------------------------------------ telas (dentro do celular, 600 x 1130)
const LARG = 600;
const ALT = 1130;

const BarraApp: React.FC<{ sistema: string; icone: string; cabecalho: string }> = ({ sistema, icone, cabecalho }) => (
  <div style={{ backgroundColor: cores.preto, padding: "58px 34px 26px", display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ width: 66, height: 66, borderRadius: 18, backgroundColor: cores.amareloVivo, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icone icone={ic(icone)} tamanho={38} cor={cores.preto} />
    </div>
    <div>
      <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 34, lineHeight: 1, color: cores.amareloVivo }}>{sistema}</div>
      <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 22, color: cores.branco, opacity: 0.8 }}>{cabecalho}</div>
    </div>
  </div>
);

const card: React.CSSProperties = { backgroundColor: cores.branco, borderRadius: 20, boxShadow: "0 8px 24px rgba(0,0,0,.08)" };

const TelaLista: React.FC<{ tela: Extract<Tela, { tipo: "lista" }>; sistema: string; icone: string }> = ({ tela, sistema, icone }) => {
  const f = useCurrentFrame();
  const toqueEm = (k: number) => 34 + k * 22;
  const contagem = tela.toques.filter((_, k) => f >= toqueEm(k)).length;
  const rodape = prog(f, toqueEm(tela.toques.length - 1) + 12, 12);
  const colX = [34, 316];
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <BarraApp sistema={sistema} icone={icone} cabecalho={tela.cabecalho} />
      <div style={{ position: "relative", padding: 34, display: "flex", flexWrap: "wrap", gap: 18 }}>
        {tela.itens.slice(0, 6).map((it, i) => {
          const entra = prog(f, 4 + i * 4, 12);
          const k = tela.toques.indexOf(i);
          const bate = k >= 0 ? decai(f, toqueEm(k), 5) : 0;
          const marcado = k >= 0 && f >= toqueEm(k);
          return (
            <div
              key={i}
              style={{
                ...card,
                width: 248,
                padding: 18,
                opacity: entra,
                transform: `translateY(${(1 - entra) * 60}px) scale(${1 + bate * 0.08})`,
                outline: marcado ? `4px solid ${cores.amarelo}` : "none",
              }}
            >
              <div style={{ height: 120, borderRadius: 14, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icone icone={ic(it.icone)} tamanho={70} cor={cores.amareloVivo} />
              </div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 28, lineHeight: 1.05, color: cores.tinta, marginTop: 12 }}>{it.nome}</div>
              <div style={{ fontFamily: fontes.texto, fontSize: 19, color: cores.cinza500, marginTop: 2 }}>{it.detalhe}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 28, color: cores.ouro }}>{it.preco}</div>
                <div style={{ width: 46, height: 46, ...pill, backgroundColor: marcado ? cores.preto : cores.amarelo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icone icone={marcado ? faCheck : faPlus} tamanho={24} cor={marcado ? cores.amareloVivo : cores.preto} />
                </div>
              </div>
            </div>
          );
        })}
        {tela.toques.map((i, k) => (
          <Dedo key={k} em={toqueEm(k)} x={colX[i % 2] + 216} y={34 + Math.floor(i / 2) * 300 + 250} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: 40,
          transform: `translateY(${(1 - rodape) * 200}px)`,
          backgroundColor: cores.amarelo,
          borderRadius: 999,
          padding: "26px 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 28,
          color: cores.preto,
          boxShadow: "0 10px 30px rgba(217,182,7,.45)",
        }}
      >
        <span>{tela.rodape}</span>
        <span style={{ backgroundColor: cores.preto, color: cores.amareloVivo, ...pill, padding: "4px 18px" }}>{contagem}</span>
      </div>
    </AbsoluteFill>
  );
};

const TelaAgenda: React.FC<{ tela: Extract<Tela, { tipo: "agenda" }>; sistema: string; icone: string }> = ({ tela, sistema, icone }) => {
  const f = useCurrentFrame();
  const colW = (LARG - 34 * 2 - 92) / tela.colunas.length;
  const linhaH = 118;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <BarraApp sistema={sistema} icone={icone} cabecalho={tela.cabecalho} />
      <div style={{ display: "flex", gap: 10, padding: "24px 34px 8px" }}>
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
          <div
            key={d}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              ...pill,
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: 20,
              backgroundColor: i === 5 ? cores.preto : cores.branco,
              color: i === 5 ? cores.amareloVivo : cores.cinza700,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", margin: "10px 34px", height: 92 + tela.horarios.length * linhaH }}>
        {tela.colunas.map((c, j) => (
          <div key={c} style={{ position: "absolute", left: 92 + j * colW, width: colW - 10, top: 0, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto", ...pill, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icone icone={faScissors} tamanho={26} cor={cores.amareloVivo} />
            </div>
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 20, color: cores.tinta, marginTop: 4 }}>{c}</div>
          </div>
        ))}
        {tela.horarios.map((h, i) => (
          <div key={h} style={{ position: "absolute", left: 0, right: 0, top: 96 + i * linhaH, height: linhaH - 12, borderTop: `2px solid ${cores.borda}` }}>
            <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 22, color: cores.cinza500, paddingTop: 8 }}>{h}</div>
          </div>
        ))}
        {tela.reservas.map((r, k) => {
          const em = 14 + k * 9;
          const p = prog(f, em, 10);
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 92 + r.coluna * colW,
                width: colW - 10,
                top: 104 + r.linha * linhaH,
                height: linhaH - 24,
                borderRadius: 16,
                backgroundColor: k % 3 === 2 ? cores.preto : cores.amarelo,
                color: k % 3 === 2 ? cores.amareloVivo : cores.preto,
                padding: "10px 12px",
                fontFamily: fontes.texto,
                fontWeight: 600,
                fontSize: 20,
                lineHeight: 1.2,
                opacity: p,
                transform: `scale(${0.4 + 0.6 * p}) translateY(${(1 - p) * 30}px)`,
                boxShadow: `0 0 ${decai(f, em, 6) * 40}px rgba(255,228,0,.9)`,
              }}
            >
              <Icone icone={faCheck} tamanho={18} cor={k % 3 === 2 ? cores.amareloVivo : cores.preto} /> {r.cliente}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 40, ...card, padding: "20px 26px", display: "flex", alignItems: "center", gap: 16, opacity: prog(f, 70, 10) }}>
        <Icone icone={faWhatsapp} tamanho={40} cor={cores.ouro} />
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 24, color: cores.tinta }}>Lembrete enviado ao cliente</div>
      </div>
    </AbsoluteFill>
  );
};

const TelaBusca: React.FC<{ tela: Extract<Tela, { tipo: "busca" }>; sistema: string; icone: string }> = ({ tela, sistema, icone }) => {
  const f = useCurrentFrame();
  const letras = Math.floor(interpolate(f, [6, 40], [0, tela.pesquisa.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const total = Math.round(interpolate(f, [44, 70], [0, tela.total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <BarraApp sistema={sistema} icone={icone} cabecalho={tela.cabecalho} />
      <div style={{ padding: "26px 34px 0" }}>
        <div style={{ ...card, ...pill, padding: "20px 26px", display: "flex", alignItems: "center", gap: 16 }}>
          <Icone icone={faMagnifyingGlass} tamanho={30} cor={cores.ouro} />
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 26, color: cores.tinta }}>
            {tela.pesquisa.slice(0, letras)}
            <span style={{ opacity: f % 16 < 8 ? 1 : 0, color: cores.ouro }}>|</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
          {tela.filtros.map((t, i) => {
            const liga = f >= 22 + i * 6;
            return (
              <div
                key={t}
                style={{
                  ...pill,
                  padding: "10px 20px",
                  fontFamily: fontes.texto,
                  fontWeight: 600,
                  fontSize: 21,
                  backgroundColor: liga ? cores.preto : cores.branco,
                  color: liga ? cores.amareloVivo : cores.cinza700,
                  transform: `scale(${1 + decai(f, 22 + i * 6, 4) * 0.15})`,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 30, color: cores.tinta, marginTop: 20 }}>
          <span style={{ color: cores.ouro }}>{total}</span> imóveis encontrados
        </div>
        {tela.resultados.slice(0, 3).map((r, i) => {
          const p = prog(f, 50 + i * 8, 12);
          return (
            <div key={i} style={{ ...card, marginTop: 16, display: "flex", gap: 18, padding: 14, opacity: p, transform: `translateX(${(1 - p) * 300}px)` }}>
              <div style={{ width: 150, height: 130, borderRadius: 14, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icone icone={ic(r.icone)} tamanho={64} cor={cores.amareloVivo} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 27, lineHeight: 1.05, color: cores.tinta }}>{r.nome}</div>
                <div style={{ fontFamily: fontes.texto, fontSize: 19, color: cores.cinza500, marginTop: 4 }}>{r.detalhe}</div>
                <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 28, color: cores.ouro, marginTop: 6 }}>{r.preco}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const formata = (v: number, casas = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

const TelaPainel: React.FC<{ tela: Extract<Tela, { tipo: "painel" }>; sistema: string; icone: string }> = ({ tela, sistema, icone }) => {
  const f = useCurrentFrame();
  const conta = prog(f, 6, 50);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <BarraApp sistema={sistema} icone={icone} cabecalho={tela.cabecalho} />
      <div style={{ padding: "26px 34px 0" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {tela.kpis.slice(0, 2).map((k, i) => (
            <div key={i} style={{ ...card, flex: 1, padding: "20px 22px", backgroundColor: i === 0 ? cores.preto : cores.branco }}>
              <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 19, letterSpacing: "0.08em", color: i === 0 ? cores.branco : cores.cinza500 }}>{k.rotulo.toUpperCase()}</div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 50, lineHeight: 1.1, color: i === 0 ? cores.amareloVivo : cores.tinta }}>
                {k.prefixo ?? ""}
                {formata(k.valor * conta, k.casas ?? 0)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, marginTop: 16, padding: "22px 22px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 200 }}>
            {tela.barras.map((b, i) => {
              const p = prog(f, 14 + i * 4, 16);
              const ultima = i === tela.barras.length - 1;
              return <div key={i} style={{ flex: 1, height: `${b * p * 100}%`, borderRadius: 10, backgroundColor: ultima ? cores.amarelo : cores.preto }} />;
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {tela.rotulos.map((r, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: fontes.texto, fontSize: 17, color: cores.cinza500 }}>
                {r}
              </div>
            ))}
          </div>
        </div>
        {tela.feed.slice(0, 3).map((it, i) => {
          const em = 40 + i * 14;
          const p = prog(f, em, 10);
          return (
            <div key={i} style={{ ...card, marginTop: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateY(${(1 - p) * -40}px)` }}>
              <div style={{ width: 54, height: 54, ...pill, backgroundColor: cores.amarelo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icone icone={ic(it.icone)} tamanho={28} cor={cores.preto} />
              </div>
              <div style={{ flex: 1, fontFamily: fontes.texto, fontWeight: 600, fontSize: 22, color: cores.tinta }}>{it.texto}</div>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 26, color: cores.ouro }}>{it.valor}</div>
              {f < em + 30 && <div style={{ position: "absolute", right: 8, top: -10, ...pill, backgroundColor: cores.preto, color: cores.amareloVivo, fontFamily: fontes.texto, fontWeight: 600, fontSize: 15, padding: "2px 12px" }}>NOVO</div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TelaImagem: React.FC<{ tela: Extract<Tela, { tipo: "imagem" }> }> = ({ tela }) => {
  const f = useCurrentFrame();
  // print rola de cima para baixo dentro do celular
  const y = interpolate(f, [10, 110], [0, -1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: cores.branco, overflow: "hidden" }}>
      <Img src={staticFile(tela.arquivo)} style={{ width: "100%", position: "absolute", top: 0, transform: `translateY(calc(${y} * (100% - ${ALT}px)))` }} />
    </AbsoluteFill>
  );
};

const Celular: React.FC<{ children: React.ReactNode; escala?: number; rot?: number }> = ({ children, escala = 1, rot = 0 }) => (
  <div style={{ width: LARG + 32, height: ALT + 32, borderRadius: 84, backgroundColor: cores.tinta, padding: 16, boxShadow: "0 40px 90px rgba(0,0,0,.5)", transform: `scale(${escala}) rotate(${rot}deg)` }}>
    <div style={{ position: "relative", width: LARG, height: ALT, borderRadius: 68, overflow: "hidden" }}>
      {children}
      <div style={{ position: "absolute", top: 16, left: "50%", width: 170, height: 36, marginLeft: -85, ...pill, backgroundColor: cores.preto }} />
    </div>
  </div>
);

// ------------------------------------------------------------ cenas
const Gancho: React.FC<ReelsSistemaProps> = ({ gancho, nicho, icone }) => {
  const f = useCurrentFrame();
  const bate = Math.max(decai(f, 0), decai(f, 30), decai(f, 52));
  const titulo: React.CSSProperties = { fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 0.98, color: cores.branco };
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Listras cor={cores.ouro} opacidade={0.18} />
      <div style={{ position: "absolute", right: -90, top: 150, transform: `scale(${1 + bate * 0.08}) rotate(${-10 + Math.sin(f / 8) * 3}deg)` }}>
        <Icone icone={ic(icone)} tamanho={720} cor={cores.amareloVivo} />
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 80px 320px", gap: 6 }}>
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: cores.amareloVivo,
            color: cores.preto,
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: 36,
            letterSpacing: "0.16em",
            padding: "12px 28px",
            ...pill,
            marginBottom: 26,
          }}
        >
          {nicho}
        </div>
        <div style={titulo}>{gancho[0]}</div>
        <div style={titulo}>{gancho[1]}</div>
        <div style={{ ...titulo, color: cores.amareloVivo }}>{gancho[2]}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Apresenta: React.FC<ReelsSistemaProps> = ({ sistema, icone, slogan, legendaApresenta }) => {
  const f = useCurrentFrame();
  const entra = prog(f, 0, 12);
  const letras = sistema.split("");
  return (
    <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, clipPath: `circle(${entra * 150}% at 50% 50%)` }}>
      <Letreiro texto={`${sistema.toUpperCase()}  •  `} top={170} rot={-6} sentido={1} fundo={cores.preto} cor={cores.amareloVivo} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30, paddingBottom: 160 }}>
        <Pop em={2} de={0.2} style={{ width: 230, height: 230, borderRadius: 56, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(f / 9) * 5}deg)` }}>
          <Icone icone={ic(icone)} tamanho={130} cor={cores.amareloVivo} />
        </Pop>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 38, letterSpacing: "0.18em", color: cores.preto, opacity: prog(f, 6, 8) }}>CONHEÇA O</div>
        <div style={{ display: "flex", fontFamily: fontes.titulo, fontWeight: 800, fontSize: Math.min(168, Math.round(1500 / sistema.length)), lineHeight: 0.9, color: cores.preto }}>
          {letras.map((l, i) => {
            const p = prog(f, 8 + i * 1.6, 10);
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * 20}deg)`, opacity: p }}>
                {l}
              </span>
            );
          })}
        </div>
        <Revela em={26} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 60, lineHeight: 1.05, color: cores.preto, textAlign: "center", padding: "0 70px" }}>
          {slogan}
        </Revela>
      </AbsoluteFill>
      <Letreiro texto={`${sistema.toUpperCase()}  •  `} top={1560} rot={5} sentido={-1} fundo={cores.preto} cor={cores.branco} />
      <Legenda texto={legendaApresenta} em={34} bottom={420} />
    </AbsoluteFill>
  );
};

const CenaTela: React.FC<{ n: number; tela: Tela; sistema: string; icone: string; aviso: string | null }> = ({ n, tela, sistema, icone, aviso }) => {
  const f = useCurrentFrame();
  const entra = prog(f, 0, 14);
  const clara = n === 2;
  const fundo = clara ? cores.offWhite : cores.preto;
  const lado = n % 2 ? 1 : -1;
  const selo = prog(f, 26, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: fundo }}>
      <Listras cor={clara ? cores.borda : cores.ouro} opacidade={clara ? 0.7 : 0.14} velocidade={lado * 5} />
      <Graos cor={clara ? cores.amarelo : cores.ouro} seed={n + 3} />
      {/* progresso 1/3 2/3 3/3 */}
      <div style={{ position: "absolute", top: 100, left: 90, right: 90, display: "flex", gap: 18 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 12, ...pill, backgroundColor: clara ? cores.borda : "rgba(255,255,255,.18)", overflow: "hidden" }}>
            <div style={{ height: "100%", ...pill, backgroundColor: clara ? cores.amarelo : cores.amareloVivo, width: `${i < n ? 100 : i === n ? prog(f, 0, 115) * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 140, left: 80, right: 80 }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 32, letterSpacing: "0.18em", color: clara ? cores.ouro : cores.amareloVivo }}>{`POR DENTRO  ${n}/3`}</div>
        <Revela em={3} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 82, lineHeight: 1, color: clara ? cores.tinta : cores.branco }}>
          {tela.titulo}
        </Revela>
      </div>
      <div
        style={{
          position: "absolute",
          left: (1080 - (LARG + 32)) / 2,
          top: 350,
          transformOrigin: "top left",
          transform: `translateX(${(1 - entra) * lado * 1100}px) translateY(${Math.sin(f / 14) * 8}px) rotate(${(1 - entra) * lado * 12 + Math.sin(f / 20) * 1.2}deg)`,
        }}
      >
        <Celular escala={0.94}>
          {tela.tipo === "lista" && <TelaLista tela={tela} sistema={sistema} icone={icone} />}
          {tela.tipo === "agenda" && <TelaAgenda tela={tela} sistema={sistema} icone={icone} />}
          {tela.tipo === "busca" && <TelaBusca tela={tela} sistema={sistema} icone={icone} />}
          {tela.tipo === "painel" && <TelaPainel tela={tela} sistema={sistema} icone={icone} />}
          {tela.tipo === "imagem" && <TelaImagem tela={tela} />}
        </Celular>
      </div>
      <div
        style={{
          position: "absolute",
          [lado > 0 ? "right" : "left"]: 40,
          top: 470,
          backgroundColor: clara ? cores.preto : cores.amareloVivo,
          color: clara ? cores.amareloVivo : cores.preto,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 40,
          lineHeight: 1,
          padding: "20px 28px",
          borderRadius: 20,
          maxWidth: 330,
          textAlign: "center",
          opacity: selo,
          transform: `scale(${0.5 + selo * 0.5 + decai(f, 26, 6) * 0.15}) rotate(${lado * 6}deg)`,
          boxShadow: "0 20px 50px rgba(0,0,0,.35)",
        }}
      >
        {tela.selo}
      </div>
      <Legenda texto={tela.legenda} em={10} escuro={clara} bottom={110} />
      {aviso && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, textAlign: "center", fontFamily: fontes.texto, fontSize: 22, color: clara ? cores.cinza500 : cores.cinza500 }}>{aviso}</div>
      )}
    </AbsoluteFill>
  );
};

const Combo: React.FC<ReelsSistemaProps> = ({ sistema, icone, combo }) => {
  const f = useCurrentFrame();
  // 0–60: dois cards batem no centro | 60–150: resultado turbinado com gráfico subindo
  const junta = prog(f, 4, 14);
  const resultado = prog(f, 60, 14);
  const linha = prog(f, 66, 50);
  const cardBase: React.CSSProperties = { width: 440, height: 460, borderRadius: 32, padding: 34, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 24px 60px rgba(0,0,0,.35)" };
  const pontos = [0.08, 0.14, 0.12, 0.26, 0.34, 0.5, 0.62, 0.86, 1];
  const W = 860;
  const H = 360;
  const path = pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (pontos.length - 1)) * W} ${H - p * H}`).join(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <Listras cor={cores.ouro} opacidade={0.14} velocidade={8} />
      <div style={{ position: "absolute", top: 120, left: 80, right: 80 }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.18em", color: cores.amareloVivo }}>A COMBINAÇÃO QUE TURBINA</div>
        <Revela em={2} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: cores.branco }}>
          Sistema + marketing
        </Revela>
        <Revela em={8} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1, color: cores.amareloVivo }}>
          = resultado turbinado
        </Revela>
      </div>
      {/* fase 1: os dois cards */}
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, height: 520, opacity: 1 - resultado }}>
        <div style={{ ...cardBase, position: "absolute", left: 60 - (1 - junta) * 700, top: 0, backgroundColor: cores.amareloVivo, transform: `rotate(${-4 + decai(f, 18, 6) * -6}deg)` }}>
          <div style={{ width: 110, height: 110, borderRadius: 28, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icone icone={ic(icone)} tamanho={64} cor={cores.amareloVivo} />
          </div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 26, letterSpacing: "0.14em", color: cores.preto }}>O SISTEMA</div>
          <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 64, lineHeight: 1, color: cores.preto }}>{sistema}</div>
        </div>
        <div style={{ ...cardBase, position: "absolute", right: 60 - (1 - junta) * 700, top: 40, backgroundColor: cores.branco, transform: `rotate(${4 + decai(f, 18, 6) * 6}deg)` }}>
          <div style={{ width: 110, height: 110, borderRadius: 28, backgroundColor: cores.preto, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icone icone={faBullhorn} tamanho={60} cor={cores.amareloVivo} />
          </div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 26, letterSpacing: "0.14em", color: cores.ouro }}>A GESTÃO</div>
          {combo.marketing.map((m, i) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, color: cores.tinta, opacity: prog(f, 22 + i * 6, 8) }}>
              <Icone icone={faCheck} tamanho={26} cor={cores.amarelo} />
              {m}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 540 - 70,
            top: 170,
            width: 140,
            height: 140,
            ...pill,
            backgroundColor: cores.preto,
            border: `8px solid ${cores.amareloVivo}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${f < 18 ? 0 : 1 + decai(f, 18, 5) * 0.6}) rotate(${f * 3}deg)`,
          }}
        >
          <Icone icone={faPlus} tamanho={70} cor={cores.amareloVivo} />
        </div>
      </div>
      {/* fase 2: resultado */}
      {f >= 58 && (
        <div style={{ position: "absolute", top: 620, left: 70, right: 70, opacity: resultado, transform: `scale(${0.8 + 0.2 * resultado})` }}>
          <div style={{ backgroundColor: cores.amareloVivo, borderRadius: 32, padding: "40px 40px 30px", boxShadow: "0 0 80px rgba(255,228,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Icone icone={faRocket} tamanho={70} cor={cores.preto} style={{ transform: `translate(${linha * 20}px, ${-linha * 20}px)` }} />
              <div style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 58, lineHeight: 1, color: cores.preto }}>
                {combo.resultado[0]}
                <br />
                {combo.resultado[1]}
              </div>
            </div>
            <svg width={W} height={H + 20} viewBox={`0 -10 ${W} ${H + 20}`} style={{ marginTop: 20 }}>
              <path d={path} stroke={cores.preto} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linha} />
              {linha > 0.98 && <circle cx={W} cy={0} r={22 + decai(f, 116, 6) * 14} fill={cores.preto} />}
            </svg>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, color: cores.preto }}>
              <Icone icone={faArrowTrendUp} tamanho={34} cor={cores.preto} /> tecnologia + divulgação, juntas
            </div>
          </div>
        </div>
      )}
      <Legenda texto={combo.legenda} em={8} escuro={false} bottom={140} />
    </AbsoluteFill>
  );
};

const Cadastro: React.FC<ReelsSistemaProps> = ({ url, cadastro }) => {
  const f = useCurrentFrame();
  const letras = Math.floor(interpolate(f, [16, 48], [0, url.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const clique = 64;
  const ok = f >= clique + 6;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
      <Listras cor={cores.borda} opacidade={0.8} velocidade={-4} />
      <div style={{ position: "absolute", top: 150, left: 80, right: 80 }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 34, letterSpacing: "0.18em", color: cores.ouro }}>OU, SE PREFERIR</div>
        <Revela em={0} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 112, lineHeight: 1, color: cores.tinta }}>
          {cadastro.pergunta[0]}
        </Revela>
        <Revela em={6} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 112, lineHeight: 1, color: cores.ouro }}>
          {cadastro.pergunta[1]}
        </Revela>
      </div>
      <Pop em={8} de={0.7} style={{ position: "absolute", top: 700, left: 70, right: 70, ...card, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.18)" }}>
        <div style={{ backgroundColor: cores.preto, padding: "22px 26px", display: "flex", alignItems: "center", gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 22, height: 22, ...pill, backgroundColor: i === 0 ? cores.amareloVivo : cores.cinza700 }} />
          ))}
          <div style={{ flex: 1, marginLeft: 14, backgroundColor: cores.tinta, ...pill, padding: "14px 24px", display: "flex", alignItems: "center", gap: 14 }}>
            <Icone icone={faLock} tamanho={26} cor={cores.amareloVivo} />
            <span style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 36, color: cores.branco }}>
              {url.slice(0, letras)}
              <span style={{ opacity: letras < url.length && f % 14 < 7 ? 1 : 0, color: cores.amareloVivo }}>|</span>
            </span>
          </div>
        </div>
        <div style={{ position: "relative", padding: "50px 46px 56px", display: "flex", flexDirection: "column", gap: 22 }}>
          {["Nome do seu negócio", "Seu WhatsApp"].map((c, i) => (
            <div key={c} style={{ border: `3px solid ${cores.borda}`, borderRadius: 18, padding: "20px 24px", fontFamily: fontes.texto, fontSize: 30, color: cores.cinza500, opacity: prog(f, 44 + i * 5, 8) }}>
              {c}
            </div>
          ))}
          <div
            style={{
              alignSelf: "stretch",
              textAlign: "center",
              backgroundColor: ok ? cores.preto : cores.amarelo,
              color: ok ? cores.amareloVivo : cores.preto,
              ...pill,
              padding: "26px 0",
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: 40,
              opacity: prog(f, 54, 8),
              transform: `scale(${f >= clique && f < clique + 5 ? 0.94 : 1 + decai(f, clique + 6, 6) * 0.06})`,
              boxShadow: "0 10px 30px rgba(217,182,7,.45)",
            }}
          >
            {ok ? (
              <span>
                <Icone icone={faCheck} tamanho={36} cor={cores.amareloVivo} /> Pronto, agora é com você
              </span>
            ) : (
              cadastro.botao
            )}
          </div>
          <Dedo em={clique} x={780} y={390} />
        </div>
      </Pop>
      <Legenda texto={cadastro.legenda} em={14} escuro bottom={170} />
    </AbsoluteFill>
  );
};

const Chamada: React.FC<ReelsSistemaProps> = ({ convite, cta, arroba, url }) => {
  const f = useCurrentFrame();
  const brilho = Math.exp(-(f % 15) / 4);
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", gap: 48, padding: "0 80px 140px" }}>
      <Listras cor={cores.ouro} opacidade={0.12} velocidade={3} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
        const p = prog(f, k * 15, 30);
        return <div key={k} style={{ position: "absolute", width: 300 + p * 1300, height: 300 + p * 1300, ...pill, border: `4px solid ${cores.ouro}`, opacity: f < k * 15 ? 0 : (1 - p) * 0.45 }} />;
      })}
      <Pop em={0} de={0.8}>
        <Img src={staticFile("logo-full.png")} style={{ width: 840 }} />
      </Pop>
      <Revela em={8} style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 66, lineHeight: 1.1, color: cores.branco, textAlign: "center" }}>
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
          fontSize: 56,
          padding: "32px 66px",
          ...pill,
          boxShadow: `0 0 ${30 + brilho * 50}px rgba(255,228,0,${0.35 + brilho * 0.35})`,
        }}
      >
        <Icone icone={faWhatsapp} tamanho={66} cor={cores.preto} />
        {cta}
      </Pop>
      <Pop em={26} style={{ display: "flex", alignItems: "center", gap: 18, border: `3px solid ${cores.amareloVivo}`, ...pill, padding: "18px 40px", fontFamily: fontes.texto, fontWeight: 600, fontSize: 42, color: cores.branco }}>
        <Icone icone={faGlobe} tamanho={42} cor={cores.amareloVivo} />
        {url}
      </Pop>
      <Revela em={34} style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 40, color: cores.amareloVivo }}>
        {arroba}
      </Revela>
    </AbsoluteFill>
  );
};

export const ReelsSistema: React.FC<ReelsSistemaProps> = (props) => {
  const f = useCurrentFrame();
  const t = ultimo(f);
  const tremor = decai(f, t, 4);
  const flash = f < 2 ? 0 : decai(f, t, 2.5); // quadro 0 limpo: vira a capa
  const dx = (random(`x${f}`) - 0.5) * 30 * tremor;
  const dy = (random(`y${f}`) - 0.5) * 30 * tremor;
  const volume = (q: number) => interpolate(q, [0, SISTEMA_DURACAO - 40, SISTEMA_DURACAO], [1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      {props.trilha && <Audio src={staticFile(props.trilha)} volume={volume} />}
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1.03 + tremor * 0.02})` }}>
        <Sequence durationInFrames={75}>
          <Gancho {...props} />
        </Sequence>
        <Sequence from={75} durationInFrames={90}>
          <Apresenta {...props} />
        </Sequence>
        {props.telas.map((tela, i) => (
          <Sequence key={i} from={165 + i * 120} durationInFrames={120}>
            <CenaTela n={i + 1} tela={tela} sistema={props.sistema} icone={props.icone} aviso={props.aviso} />
          </Sequence>
        ))}
        <Sequence from={525} durationInFrames={150}>
          <Combo {...props} />
        </Sequence>
        <Sequence from={675} durationInFrames={105}>
          <Cadastro {...props} />
        </Sequence>
        <Sequence from={780}>
          <Chamada {...props} />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: cores.branco, opacity: flash * 0.35, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ padrão: SuperMenu SP
export const reelsSistemaPadrao: ReelsSistemaProps = {
  sistema: "SuperMenu SP",
  icone: "burger",
  nicho: "PARA RESTAURANTES E DELIVERY",
  gancho: ["Ainda paga", "taxa de app para", "vender o seu lanche?"],
  slogan: "Seu cardápio, sua marca, seus clientes.",
  legendaApresenta: "Seu canal próprio de pedidos, sem taxa por venda.",
  telas: [
    {
      tipo: "lista",
      titulo: "Cardápio digital próprio",
      selo: "Pedido direto, sem app",
      legenda: "O cliente escolhe pelo celular e faz o pedido em poucos toques.",
      cabecalho: "Cardápio",
      itens: [
        { nome: "X-Bacon da Casa", detalhe: "Pão brioche, 180 g", preco: "R$ 32,90", icone: "burger" },
        { nome: "Pizza Calabresa", detalhe: "Grande, 8 fatias", preco: "R$ 54,00", icone: "pizza" },
        { nome: "Batata Rústica", detalhe: "Porção 400 g", preco: "R$ 24,90", icone: "prato" },
        { nome: "Suco Natural", detalhe: "500 ml", preco: "R$ 9,90", icone: "bebida" },
        { nome: "Combo Família", detalhe: "2 lanches + porção", preco: "R$ 79,90", icone: "talheres" },
        { nome: "Entrega", detalhe: "Na sua região", preco: "Grátis", icone: "moto" },
      ],
      toques: [0, 2, 3],
      rodape: "Fazer pedido  R$ 67,70",
    },
    {
      tipo: "painel",
      titulo: "Pedidos no painel",
      selo: "Tudo num lugar só",
      legenda: "Cada pedido chega no painel. Você acompanha a operação em tempo real.",
      cabecalho: "Painel de pedidos",
      kpis: [
        { rotulo: "Pedidos hoje", valor: 48 },
        { rotulo: "Ticket médio", valor: 41.5, prefixo: "R$ ", casas: 2 },
      ],
      barras: [0.35, 0.42, 0.38, 0.55, 0.62, 0.84, 1],
      rotulos: ["S", "T", "Q", "Q", "S", "S", "D"],
      feed: [
        { texto: "Pedido #1048  Mesa / retirada", valor: "R$ 67,70", icone: "burger" },
        { texto: "Pedido #1049  Entrega", valor: "R$ 54,00", icone: "moto" },
        { texto: "Pedido #1050  Entrega", valor: "R$ 79,90", icone: "moto" },
      ],
    },
    {
      tipo: "painel",
      titulo: "Faturamento sem taxa",
      selo: "O lucro fica com você",
      legenda: "Gestão de pedidos e faturamento, com o cliente direto com você.",
      cabecalho: "Faturamento",
      kpis: [
        { rotulo: "Taxa de app", valor: 0, prefixo: "R$ " },
        { rotulo: "Clientes diretos", valor: 312 },
      ],
      barras: [0.3, 0.38, 0.46, 0.5, 0.66, 0.78, 1],
      rotulos: ["Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      feed: [
        { texto: "Cliente voltou a pedir", valor: "3ª vez", icone: "usuario" },
        { texto: "Pedido pelo link do Instagram", valor: "R$ 41,80", icone: "instagram" },
        { texto: "Avaliação recebida", valor: "5,0", icone: "estrela" },
      ],
    },
  ],
  aviso: "Telas ilustrativas",
  combo: {
    marketing: ["Posts e Reels", "Anúncios locais", "Calendário fixo"],
    resultado: ["Mais gente pedindo", "direto com você"],
    legenda: "Com a nossa gestão de marketing, o sistema ganha clientes todos os dias.",
  },
  url: "supermenusp.com.br",
  cadastro: {
    pergunta: ["Quer só", "o sistema?"],
    botao: "Cadastre-se",
    legenda: "Acesse o site, faça o seu cadastro e conheça por dentro.",
  },
  convite: "Sistema + marketing: a gente monta com você, com um café.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
  trilha: null,
};
