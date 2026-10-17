import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight, faBookmark } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Titulo } from "./FeedPost";
import { cores, fontes } from "./marca";
import { Icone } from "./ReelsOferta";

// Carrossel 4:5 (1080×1350). Uma composição só; `slide` escolhe a lâmina (0 = capa, último = chamada).
// Renderizar cada lâmina com --props='{"slide": N}' ou pelo script de render.
export type ItemCarrossel = { titulo: string; texto: string };

export type CarrosselProps = {
  slide: number;
  kicker: string;
  titulo: string;
  destaque: string;
  apoio: string;
  itens: ItemCarrossel[];
  fechamento: { titulo: string; destaque: string; texto: string; cta: string; salve: string };
  arroba: string;
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

const Capa: React.FC<CarrosselProps & { total: number }> = ({ kicker, titulo, destaque, apoio, arroba, total }) => (
  <AbsoluteFill style={{ backgroundColor: cores.preto }}>
    <div
      style={{
        position: "absolute",
        right: -140,
        top: -60,
        fontFamily: fontes.titulo,
        fontWeight: 800,
        fontSize: 860,
        lineHeight: 1,
        color: cores.amareloVivo,
        opacity: 0.95,
        transform: "rotate(-6deg)",
      }}
    >
      5
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

const Sinal: React.FC<{ n: number; item: ItemCarrossel; total: number; arroba: string }> = ({ n, item, total, arroba }) => {
  const escuro = n % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: escuro ? cores.preto : cores.offWhite }}>
      <div style={{ position: "absolute", left: 96, top: 110, fontFamily: fontes.texto, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: escuro ? cores.amareloVivo : cores.ouro }}>
        {`SINAL ${n} DE 5`}
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

export const Carrossel: React.FC<CarrosselProps> = (props) => {
  const total = props.itens.length + 2;
  if (props.slide <= 0) return <Capa {...props} total={total} />;
  if (props.slide >= total - 1) return <Fechamento {...props} total={total} />;
  return <Sinal n={props.slide} item={props.itens[props.slide - 1]} total={total} arroba={props.arroba} />;
};
