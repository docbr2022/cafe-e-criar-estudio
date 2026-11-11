import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowPointer,
  faArrowRight,
  faBookmark,
  faCalendarCheck,
  faCheck,
  faHeart,
  faHouse,
  faLock,
  faMagnifyingGlass,
  faMoon,
  faRobot,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Titulo } from "./FeedPost";
import { cores, fontes } from "./marca";
import { Icone } from "./ReelsOferta";

// Carrossel 4:5 (1080×1350). Uma composição só; `slide` escolhe a lâmina (0 = capa, último = chamada).
// Renderizar cada lâmina com --props='{"slide": N}' ou pelo script de render.
// `slug` e `icone` só são usados no estilo "navegador".
export type ItemCarrossel = { titulo: string; texto: string; slug?: string; icone?: string };

export type CarrosselProps = {
  slide: number;
  kicker: string;
  titulo: string;
  destaque: string;
  apoio: string;
  itens: ItemCarrossel[];
  fechamento: { titulo: string; destaque: string; texto: string; cta: string; salve: string };
  arroba: string;
  // Rótulo das lâminas internas ("SINAL 1 DE 5", "PERGUNTA 1 DE 5").
  rotulo?: string;
  // Texto gigante da capa; padrão = número de itens.
  numeroCapa?: string;
  // "numero" (padrão): capa preta com número gigante. "lista": capa e lâminas claras, em formato de checklist de papel.
  // "navegador": cada lâmina é uma janela de navegador que vai carregando o site (tema roxo, fundo claro).
  estilo?: "numero" | "lista" | "navegador";
  // Endereço mostrado na barra do navegador (estilo "navegador").
  dominio?: string;
};

export const carrosselPadrao: CarrosselProps = {
  slide: 0,
  kicker: "CHECKLIST RÁPIDO",
  titulo: "5 sinais de que seu Instagram afasta clientes",
  destaque: "afasta clientes",
  apoio: "Arraste e confira quantos você tem.",
  itens: [
    { titulo: "A bio não diz o que você faz", texto: "Quem chega precisa entender em 3 segundos o que você vende, para quem e onde." },
    { titulo: "O último post tem mais de 15 dias", texto: "Perfil parado parece empresa fechada. Constância vale mais do que volume." },
    { titulo: "Cada post tem uma cara", texto: "Sem cores, fontes e estilo fixos, ninguém reconhece a sua marca no feed." },
    { titulo: "Ninguém vê quem está por trás", texto: "Rosto, bastidor e história geram confiança. Gente compra de gente." },
    { titulo: "Falar com você dá trabalho", texto: "Se o cliente precisa procurar o contato, ele desiste. Deixe o WhatsApp a um toque." },
  ],
  fechamento: {
    titulo: "Reconheceu 2 ou mais?",
    destaque: "2 ou mais?",
    texto: "A gente arruma o seu perfil com você. Venha tomar um café conosco.",
    cta: "Chame no WhatsApp",
    salve: "Salve para revisar depois",
  },
  arroba: "@cafeecriar",
};

const Rodape: React.FC<{ atual: number; total: number; escuro: boolean; arroba: string; seta: boolean }> = ({ atual, total, escuro, arroba, seta }) => (
  <div style={{ position: "absolute", left: 96, right: 96, bottom: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 28, color: escuro ? cores.amareloVivo : cores.cinza500 }}>{arroba}</div>
    <div style={{ display: "flex", gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === atual ? 44 : 14,
            height: 14,
            borderRadius: 99,
            backgroundColor: i === atual ? (escuro ? cores.amareloVivo : cores.amarelo) : escuro ? "rgba(255,255,255,.25)" : cores.borda,
          }}
        />
      ))}
    </div>
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 999,
        backgroundColor: seta ? (escuro ? cores.amareloVivo : cores.preto) : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {seta && <Icone icone={faArrowRight} tamanho={34} cor={escuro ? cores.preto : cores.amareloVivo} />}
    </div>
  </div>
);

const Capa: React.FC<CarrosselProps & { total: number }> = ({ kicker, titulo, destaque, apoio, arroba, total, itens, numeroCapa }) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    <div
      style={{
        position: "absolute",
        right: (numeroCapa ?? String(itens.length)).length > 1 ? -20 : -140,
        top: -60,
        fontFamily: fontes.titulo,
        fontWeight: 800,
        fontSize: (numeroCapa ?? String(itens.length)).length > 1 ? 600 : 860,
        lineHeight: 1,
        color: cores.amareloVivo,
        opacity: 0.95,
        transform: "rotate(-6deg)",
      }}
    >
      {numeroCapa ?? itens.length}
    </div>
    <div style={{ position: "absolute", left: 96, top: 90 }}>
      <Img src={staticFile("logo-mark.png")} style={{ width: 170 }} />
    </div>
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 220, display: "flex", flexDirection: "column", gap: 30 }}>
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: cores.amareloVivo,
          color: cores.preto,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.18em",
          padding: "10px 26px",
          borderRadius: 999,
        }}
      >
        {kicker}
      </div>
      <Titulo
        titulo={titulo}
        destaque={destaque}
        cor={cores.amareloVivo}
        style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 112, lineHeight: 1, color: cores.branco }}
      />
      <div style={{ fontFamily: fontes.texto, fontSize: 36, color: cores.branco, opacity: 0.85 }}>{apoio}</div>
    </div>
    <Rodape atual={0} total={total} escuro arroba={arroba} seta />
  </AbsoluteFill>
);

const Sinal: React.FC<{ n: number; item: ItemCarrossel; total: number; arroba: string; rotulo: string }> = ({ n, item, total, arroba, rotulo }) => {
  const escuro = n % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: escuro ? cores.preto : cores.offWhite }}>
      <div style={{ position: "absolute", left: 96, top: 110, fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: escuro ? cores.amareloVivo : cores.ouro }}>
        {`${rotulo} ${n} DE ${total - 2}`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 170,
          fontFamily: fontes.titulo,
          fontWeight: 800,
          fontSize: 440,
          lineHeight: 1,
          color: escuro ? cores.amareloVivo : cores.amarelo,
        }}
      >
        {`0${n}`}
      </div>
      <div style={{ position: "absolute", left: 96, right: 96, top: 660, display: "flex", flexDirection: "column", gap: 34 }}>
        <h1 style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: escuro ? cores.branco : cores.tinta }}>{item.titulo}</h1>
        <div
          style={{
            backgroundColor: escuro ? "#151515" : cores.branco,
            borderRadius: 20,
            padding: "34px 40px",
            fontFamily: fontes.texto,
            fontSize: 36,
            lineHeight: 1.5,
            color: escuro ? cores.branco : cores.cinza700,
            boxShadow: escuro ? undefined : "0 12px 34px rgba(0,0,0,.07)",
          }}
        >
          {item.texto}
        </div>
      </div>
      <Rodape atual={n} total={total} escuro={escuro} arroba={arroba} seta />
    </AbsoluteFill>
  );
};

const Fechamento: React.FC<CarrosselProps & { total: number }> = ({ fechamento, arroba, total }) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto, alignItems: "center", justifyContent: "center", padding: "0 96px 120px", gap: 46 }}>
    <Img src={staticFile("logo-full.png")} style={{ width: 720 }} />
    <Titulo
      titulo={fechamento.titulo}
      destaque={fechamento.destaque}
      cor={cores.amareloVivo}
      style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1, color: cores.branco, textAlign: "center" }}
    />
    <div style={{ fontFamily: fontes.texto, fontSize: 38, lineHeight: 1.5, color: cores.branco, textAlign: "center", opacity: 0.9 }}>{fechamento.texto}</div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        backgroundColor: cores.amareloVivo,
        color: cores.preto,
        fontFamily: fontes.texto,
        fontWeight: 600,
        fontSize: 46,
        padding: "28px 60px",
        borderRadius: 999,
        boxShadow: "0 0 50px rgba(255,228,0,.45)",
      }}
    >
      <Icone icone={faWhatsapp} tamanho={56} cor={cores.preto} />
      {fechamento.cta}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: fontes.texto, fontWeight: 500, fontSize: 34, color: cores.amareloVivo }}>
      <Icone icone={faBookmark} tamanho={34} cor={cores.amareloVivo} />
      {fechamento.salve}
    </div>
    <Rodape atual={total - 1} total={total} escuro arroba={arroba} seta={false} />
  </AbsoluteFill>
);

// ---- Estilo "lista": fundo claro, caixas de seleção, sem número gigante ----
const Caixa: React.FC<{ marcada: boolean; tam: number }> = ({ marcada, tam }) => (
  <div
    style={{
      flex: "0 0 auto",
      width: tam,
      height: tam,
      borderRadius: tam * 0.24,
      backgroundColor: marcada ? cores.amarelo : cores.branco,
      border: marcada ? "none" : `${Math.max(3, tam * 0.06)}px solid ${"#c9c9c9"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {marcada && <Icone icone={faCheck} tamanho={tam * 0.6} cor={cores.preto} />}
  </div>
);

const Marcador: React.FC<{ titulo: string; destaque: string; style: React.CSSProperties }> = ({ titulo, destaque, style }) => {
  const i = destaque ? titulo.indexOf(destaque) : -1;
  if (i < 0) return <h1 style={style}>{titulo}</h1>;
  return (
    <h1 style={style}>
      {titulo.slice(0, i)}
      <span style={{ backgroundColor: cores.amarelo, padding: "0 14px", borderRadius: 12, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{destaque}</span>
      {titulo.slice(i + destaque.length)}
    </h1>
  );
};

const CapaLista: React.FC<CarrosselProps & { total: number }> = ({ kicker, titulo, destaque, apoio, arroba, total, itens }) => (
  <AbsoluteFill style={{ backgroundColor: cores.offWhite }}>
    <div style={{ position: "absolute", left: 96, right: 96, top: 90, display: "flex", flexDirection: "column", gap: 26 }}>
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: cores.preto,
          color: cores.amareloVivo,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.18em",
          padding: "10px 26px",
          borderRadius: 999,
        }}
      >
        {kicker}
      </div>
      <Marcador titulo={titulo} destaque={destaque} style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 92, lineHeight: 1.16, color: cores.tinta }} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 580,
        backgroundColor: cores.branco,
        borderRadius: 20,
        padding: "40px 46px",
        boxShadow: "0 18px 44px rgba(0,0,0,.10)",
        transform: "rotate(-2deg)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {itens.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, paddingBottom: i < itens.length - 1 ? 24 : 0, borderBottom: i < itens.length - 1 ? `2px solid ${cores.borda}` : "none" }}>
          <Caixa marcada={i < 2} tam={52} />
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 34, color: i < 2 ? cores.cinza500 : cores.tinta, textDecoration: i < 2 ? "line-through" : "none" }}>{it.titulo}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 166, fontFamily: fontes.texto, fontSize: 32, color: cores.cinza700 }}>{apoio}</div>
    <Rodape atual={0} total={total} escuro={false} arroba={arroba} seta />
  </AbsoluteFill>
);

const ItemLista: React.FC<{ n: number; item: ItemCarrossel; itens: ItemCarrossel[]; total: number; arroba: string; rotulo: string }> = ({ n, item, itens, total, arroba, rotulo }) => {
  const branco = n % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: branco ? cores.branco : cores.offWhite }}>
      <div style={{ position: "absolute", left: 96, top: 110, fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: cores.ouro }}>
        {`${rotulo} ${n} DE ${total - 2}`}
      </div>
      <div style={{ position: "absolute", left: 96, top: 200 }}>
        <Caixa marcada tam={240} />
      </div>
      <div style={{ position: "absolute", left: 96, right: 96, top: 540, display: "flex", flexDirection: "column", gap: 40 }}>
        <h1 style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 108, lineHeight: 1.02, color: cores.tinta }}>{item.titulo}</h1>
        <div style={{ fontFamily: fontes.texto, fontSize: 42, lineHeight: 1.5, color: cores.cinza700, borderLeft: `8px solid ${cores.amarelo}`, paddingLeft: 32 }}>{item.texto}</div>
      </div>
      <div style={{ position: "absolute", left: 96, right: 96, bottom: 180, display: "flex", gap: 16, alignItems: "center" }}>
        {itens.map((_, i) => (
          <Caixa key={i} marcada={i < n} tam={44} />
        ))}
        <div style={{ marginLeft: 12, fontFamily: fontes.texto, fontWeight: 500, fontSize: 28, color: cores.cinza500 }}>{`${n} de ${itens.length} conferidos`}</div>
      </div>
      <Rodape atual={n} total={total} escuro={false} arroba={arroba} seta />
    </AbsoluteFill>
  );
};

// ---- Estilo "navegador": o site vai carregando lâmina a lâmina (tema roxo) ----
const nav = {
  fundo: "#F3F0FA",
  branco: "#FFFFFF",
  roxo: "#5B2BD9",
  roxoEscuro: "#1B1036",
  roxoNoite: "#120A26",
  lilas: "#E4DCFA",
  tinta: "#1A1530",
  cinza: "#5E5873",
  borda: "#DCD4F0",
};

const iconesNav: Record<string, IconDefinition> = {
  casa: faHouse,
  lupa: faMagnifyingGlass,
  robo: faRobot,
  lua: faMoon,
  coracao: faHeart,
};

// Logo recolorida por máscara (a marca é flexível desde 07/11/2026).
const LogoCor: React.FC<{ arquivo: string; largura: number; proporcao: number; cor: string }> = ({ arquivo, largura, proporcao, cor }) => (
  <div
    style={{
      width: largura,
      height: largura / proporcao,
      backgroundColor: cor,
      WebkitMaskImage: `url(${staticFile(arquivo)})`,
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
    }}
  />
);

const Janela: React.FC<{
  url: string;
  carregado: number;
  escuro?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ url, carregado, escuro = false, style, children }) => (
  <div
    style={{
      position: "absolute",
      backgroundColor: escuro ? nav.roxoEscuro : nav.branco,
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: escuro ? "0 30px 80px rgba(0,0,0,.45)" : "0 26px 70px rgba(43,20,110,.16)",
      border: escuro ? "2px solid #34245F" : `2px solid ${nav.borda}`,
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    <div style={{ height: 86, display: "flex", alignItems: "center", gap: 14, padding: "0 30px", backgroundColor: escuro ? "#24174A" : "#F7F5FC" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: c }} />
      ))}
      <div
        style={{
          marginLeft: 18,
          flex: 1,
          height: 50,
          borderRadius: 99,
          backgroundColor: escuro ? "#120A26" : nav.branco,
          border: escuro ? "none" : `2px solid ${nav.borda}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 24px",
          fontFamily: fontes.texto,
          fontWeight: 500,
          fontSize: 25,
          color: escuro ? "#C9BDF2" : nav.cinza,
        }}
      >
        <Icone icone={faLock} tamanho={20} cor={escuro ? "#C9BDF2" : nav.roxo} />
        {url}
      </div>
    </div>
    <div style={{ height: 8, backgroundColor: escuro ? "#2E2058" : nav.lilas }}>
      <div style={{ width: `${Math.round(carregado * 100)}%`, height: "100%", backgroundColor: escuro ? cores.amareloVivo : nav.roxo, borderRadius: "0 99px 99px 0" }} />
    </div>
    <div style={{ position: "relative", flex: 1 }}>{children}</div>
  </div>
);

const RodapeNav: React.FC<{ atual: number; total: number; escuro: boolean; arroba: string; seta: boolean }> = ({ atual, total, escuro, arroba, seta }) => (
  <div style={{ position: "absolute", left: 90, right: 90, bottom: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 28, color: escuro ? "#C9BDF2" : nav.cinza }}>{arroba}</div>
    <div style={{ display: "flex", gap: 10 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === atual ? 44 : 14,
            height: 14,
            borderRadius: 99,
            backgroundColor: i === atual ? (escuro ? cores.amareloVivo : nav.roxo) : escuro ? "rgba(255,255,255,.22)" : nav.borda,
          }}
        />
      ))}
    </div>
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 999,
        backgroundColor: seta ? (escuro ? cores.amareloVivo : nav.roxo) : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {seta && <Icone icone={faArrowRight} tamanho={34} cor={escuro ? nav.roxoEscuro : nav.branco} />}
    </div>
  </div>
);

const Linha: React.FC<{ w: number | string; h?: number; cor?: string; style?: React.CSSProperties }> = ({ w, h = 18, cor = nav.lilas, style }) => (
  <div style={{ width: w, height: h, borderRadius: 99, backgroundColor: cor, ...style }} />
);

const CapaNav: React.FC<CarrosselProps & { total: number }> = ({ kicker, titulo, destaque, apoio, arroba, total, dominio }) => {
  const i = destaque ? titulo.indexOf(destaque) : -1;
  return (
    <AbsoluteFill style={{ backgroundColor: nav.fundo }}>
      {/* grade de pontos ao fundo */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${nav.borda} 3px, transparent 3px)`, backgroundSize: "44px 44px", opacity: 0.7 }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 84, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              backgroundColor: nav.roxo,
              color: nav.branco,
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "0.16em",
              padding: "10px 26px",
              borderRadius: 999,
            }}
          >
            {kicker}
          </div>
          <LogoCor arquivo="logo-mark.png" largura={140} proporcao={1} cor={nav.roxo} />
        </div>
        <h1 style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 104, lineHeight: 1.04, color: nav.tinta }}>
          {i < 0 ? (
            titulo
          ) : (
            <>
              {titulo.slice(0, i)}
              <span style={{ color: nav.roxo }}>{destaque}</span>
              {titulo.slice(i + destaque.length)}
            </>
          )}
        </h1>
        <div style={{ fontFamily: fontes.texto, fontSize: 34, color: nav.cinza }}>{apoio}</div>
      </div>
      <Janela url={dominio ?? "suaempresa.com.br"} carregado={0.12} style={{ left: 110, right: 70, top: 700, height: 500, transform: "rotate(-3deg)" }}>
        <div style={{ position: "absolute", inset: 0, padding: "34px 44px", display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 54, height: 54, borderRadius: 99, backgroundColor: nav.roxo }} />
            <Linha w={170} />
            <div style={{ flex: 1 }} />
            <Linha w={80} h={14} />
            <Linha w={80} h={14} />
            <Linha w={80} h={14} />
          </div>
          <Linha w={560} h={40} cor="#CFC2F5" style={{ marginTop: 14, flexShrink: 0 }} />
          <Linha w={400} h={40} cor="#CFC2F5" style={{ flexShrink: 0 }} />
                    <div
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              backgroundColor: cores.amareloVivo,
              borderRadius: 99,
              padding: "16px 36px",
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: 26,
              color: nav.roxoEscuro,
            }}
          >
            Agendar diagnóstico
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ flex: 1, height: 96, borderRadius: 18, backgroundColor: nav.fundo, border: `2px solid ${nav.borda}` }} />
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 330, top: 330, transform: "rotate(-8deg)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.25))" }}>
          <Icone icone={faArrowPointer} tamanho={64} cor={nav.tinta} />
        </div>
      </Janela>
      <RodapeNav atual={0} total={total} escuro={false} arroba={arroba} seta />
    </AbsoluteFill>
  );
};

const MotivoNav: React.FC<CarrosselProps & { n: number; total: number }> = ({ n, total, itens, arroba, rotulo, dominio }) => {
  const item = itens[n - 1];
  const escuro = n % 2 === 0;
  const carregado = n / (itens.length + 1);
  const url = `${dominio ?? "suaempresa.com.br"}/${item.slug ?? `motivo-${n}`}`;
  return (
    <AbsoluteFill style={{ backgroundColor: escuro ? nav.roxoNoite : nav.fundo }}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 92, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: escuro ? cores.amareloVivo : nav.roxo }}>
          {`${rotulo ?? "MOTIVO"} ${n} DE ${itens.length}`}
        </div>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 26, color: escuro ? "#C9BDF2" : nav.cinza }}>{`carregando ${Math.round(carregado * 100)}%`}</div>
      </div>
      <Janela url={url} carregado={carregado} escuro={escuro} style={{ left: 70, right: 70, top: 170, bottom: 190 }}>
        <div style={{ position: "absolute", inset: 0, padding: "64px 60px", display: "flex", flexDirection: "column", gap: 38 }}>
          <div
            style={{
              width: 150,
              height: 150,
              flexShrink: 0,
              borderRadius: 40,
              backgroundColor: escuro ? cores.amareloVivo : nav.roxo,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icone icone={iconesNav[item.icone ?? "casa"] ?? faHouse} tamanho={78} cor={escuro ? nav.roxoEscuro : nav.branco} />
          </div>
          <h1 style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1.04, color: escuro ? nav.branco : nav.tinta }}>{item.titulo}</h1>
          <div style={{ fontFamily: fontes.texto, fontSize: 42, lineHeight: 1.5, color: escuro ? "#D9D1F5" : nav.cinza }}>{item.texto}</div>
        </div>
      </Janela>
      <RodapeNav atual={n} total={total} escuro={escuro} arroba={arroba} seta />
    </AbsoluteFill>
  );
};

const FechamentoNav: React.FC<CarrosselProps & { total: number }> = ({ fechamento, arroba, total, dominio }) => {
  const i = fechamento.destaque ? fechamento.titulo.indexOf(fechamento.destaque) : -1;
  return (
    <AbsoluteFill style={{ backgroundColor: nav.roxoEscuro }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(91,43,217,.55), transparent 62%)" }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 92, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.16em", color: cores.amareloVivo }}>SITE PRONTO</div>
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 26, color: "#C9BDF2" }}>carregado 100%</div>
      </div>
      <Janela url={`${dominio ?? "suaempresa.com.br"}/diagnostico`} carregado={1} escuro style={{ left: 70, right: 70, top: 170, bottom: 190 }}>
        <div style={{ position: "absolute", inset: 0, padding: "56px 56px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 34 }}>
          <LogoCor arquivo="logo-full.png" largura={520} proporcao={848 / 224} cor={nav.branco} />
          <h1 style={{ margin: 0, fontFamily: fontes.titulo, fontWeight: 800, fontSize: 88, lineHeight: 1.04, color: nav.branco }}>
            {i < 0 ? (
              fechamento.titulo
            ) : (
              <>
                {fechamento.titulo.slice(0, i)}
                <span style={{ color: cores.amareloVivo }}>{fechamento.destaque}</span>
                {fechamento.titulo.slice(i + fechamento.destaque.length)}
              </>
            )}
          </h1>
          <div style={{ fontFamily: fontes.texto, fontSize: 34, lineHeight: 1.5, color: "#D9D1F5" }}>{fechamento.texto}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              backgroundColor: cores.amareloVivo,
              color: nav.roxoEscuro,
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: 42,
              padding: "26px 54px",
              borderRadius: 999,
              boxShadow: "0 0 50px rgba(255,228,0,.35)",
            }}
          >
            <Icone icone={faCalendarCheck} tamanho={46} cor={nav.roxoEscuro} />
            {fechamento.cta}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: fontes.texto, fontWeight: 500, fontSize: 30, color: "#C9BDF2" }}>
            <Icone icone={faWhatsapp} tamanho={34} cor="#C9BDF2" />
            Chame no WhatsApp ou no direct
          </div>
        </div>
      </Janela>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: fontes.texto, fontWeight: 500, fontSize: 28, color: cores.amareloVivo }}>
        <Icone icone={faBookmark} tamanho={28} cor={cores.amareloVivo} />
        {fechamento.salve}
      </div>
      <RodapeNav atual={total - 1} total={total} escuro arroba={arroba} seta={false} />
    </AbsoluteFill>
  );
};

export const Carrossel: React.FC<CarrosselProps> = (props) => {
  const total = props.itens.length + 2;
  if (props.estilo === "navegador") {
    if (props.slide <= 0) return <CapaNav {...props} total={total} />;
    if (props.slide >= total - 1) return <FechamentoNav {...props} total={total} />;
    return <MotivoNav {...props} n={props.slide} total={total} />;
  }
  if (props.estilo === "lista") {
    if (props.slide <= 0) return <CapaLista {...props} total={total} />;
    if (props.slide < total - 1)
      return <ItemLista n={props.slide} item={props.itens[props.slide - 1]} itens={props.itens} total={total} arroba={props.arroba} rotulo={props.rotulo ?? "ITEM"} />;
  }
  if (props.slide <= 0) return <Capa {...props} total={total} />;
  if (props.slide >= total - 1) return <Fechamento {...props} total={total} />;
  return <Sinal n={props.slide} item={props.itens[props.slide - 1]} total={total} arroba={props.arroba} rotulo={props.rotulo ?? "SINAL"} />;
};
