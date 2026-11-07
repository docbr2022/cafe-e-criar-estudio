import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fontes } from "./marca";
import { Icone } from "./ReelsOferta";
import { LogoCor, temas } from "./ReelsCupom";

// Reels "conversa", ~20 s a 30 fps. Conceito próprio: uma conversa de chat que rola sozinha.
// O cliente pergunta, a agência digita e responde; no fim a própria conversa vira a chamada.
export const CONVERSA_FPS = 30;
const INTRO = 40; // quadros antes da primeira pergunta "chegar"
const BLOCO = 105; // pergunta (0) → digitando (14) → resposta (40) → leitura
const FIM = 120;
export const conversaDuracao = (n: number) => INTRO + n * BLOCO + FIM;

export type ReelsConversaProps = {
  tema: keyof typeof temas;
  titulo: string[]; // a última linha fica no destaque
  contato: string;
  status: string;
  perguntas: { pergunta: string; porque: string }[];
  fechamento: string;
  cta: string;
  arroba: string;
};

export const reelsConversaPadrao: ReelsConversaProps = {
  tema: "roxo",
  titulo: ["4 perguntas antes", "de contratar", "uma agência"],
  contato: "Café e Criar",
  status: "online agora",
  perguntas: [
    { pergunta: "Vocês já atenderam um negócio como o meu?", porque: "Quem conhece o seu mercado erra menos e chega antes no resultado." },
    { pergunta: "O que exatamente está incluso?", porque: "Quantos posts, quais redes, quem escreve. Combinado claro evita surpresa." },
    { pergunta: "Como vamos medir o resultado?", porque: "Alcance, mensagens, vendas. Sem número combinado, ninguém sabe se funcionou." },
    { pergunta: "Quem vai falar comigo no dia a dia?", porque: "Você precisa saber com quem conversar quando surgir uma dúvida." },
  ],
  fechamento: "Pode fazer as 4 para nós também. A resposta vem com um café.",
  cta: "Chame no WhatsApp",
  arroba: "@cafeecriar",
};

const suave = Easing.bezier(0.16, 1, 0.3, 1);
const p = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

const FONTE = 52;
const LINHA = 68;
const LARG_TEXTO = 760;
// Altura estimada de um balão (para a rolagem acompanhar a última mensagem).
const alturaBalao = (texto: string, tam = FONTE) => {
  const porLinha = Math.floor(LARG_TEXTO / (tam * 0.56));
  const linhas = Math.ceil(texto.length / porLinha);
  return linhas * (LINHA * (tam / FONTE)) + 64;
};
const GAP = 28;

type Msg = { de: "cliente" | "agencia" | "digitando" | "cta"; texto: string; em: number; ate?: number; n?: number };

export const ReelsConversa: React.FC<ReelsConversaProps> = ({ tema, titulo, contato, status, perguntas, fechamento, cta, arroba }) => {
  const f = useCurrentFrame();
  const t = temas[tema] ?? temas.roxo;

  // Roteiro das mensagens.
  const msgs: Msg[] = [];
  perguntas.forEach((q, i) => {
    const b = INTRO + i * BLOCO;
    msgs.push({ de: "cliente", texto: q.pergunta, em: i === 0 ? 0 : b, n: i + 1 });
    msgs.push({ de: "digitando", texto: "", em: i === 0 ? 0 : b + 14, ate: b + 40 });
    msgs.push({ de: "agencia", texto: q.porque, em: b + 40 });
  });
  const bFim = INTRO + perguntas.length * BLOCO;
  msgs.push({ de: "digitando", texto: "", em: bFim, ate: bFim + 22 });
  msgs.push({ de: "agencia", texto: fechamento, em: bFim + 22 });
  msgs.push({ de: "cta", texto: cta, em: bFim + 40 });

  // Quais estão visíveis e onde ficam.
  const visiveis = msgs.filter((m) => f >= m.em && (m.ate === undefined || f < m.ate));
  let y = 0;
  const posicoes = visiveis.map((m) => {
    const h = m.de === "digitando" ? 100 : m.de === "cta" ? 150 : alturaBalao(m.texto);
    const pos = { m, y, h };
    y += h + GAP;
    return pos;
  });
  const alturaJanela = 930;
  // Rolagem: suaviza a mudança de altura total do conteúdo.
  const alvo = Math.max(0, y - alturaJanela + 40);
  const ultimo = visiveis[visiveis.length - 1];
  const yAntes = posicoes.length ? posicoes[posicoes.length - 1].y : 0;
  const anterior = Math.max(0, yAntes - GAP - alturaJanela + 40);
  const k = ultimo ? p(f, ultimo.em, 12) : 1;
  const rolagem = anterior + (alvo - anterior) * k;

  return (
    <AbsoluteFill style={{ backgroundColor: t.fundo }}>
      {/* bolhas decorativas no fundo */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 520 - i * 120,
            height: 420 - i * 100,
            borderRadius: 999,
            borderBottomLeftRadius: 40,
            backgroundColor: t.fundoEscuro,
            opacity: 0.35,
            left: [-160, 760, 620][i],
            top: [1500, 120, 1700][i] + Math.sin(f / 30 + i) * 20,
          }}
        />
      ))}
      {/* título fixo no alto: legível no quadro 0 e dentro do recorte 3:4 */}
      <div style={{ position: "absolute", left: 70, right: 40, top: 250 }}>
        {titulo.map((l, i) => (
          <div key={i} style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 96, lineHeight: 1.0, color: i === titulo.length - 1 ? t.destaque : t.texto }}>
            {l}
          </div>
        ))}
      </div>
      {/* janela do chat */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 580, height: 1130, borderRadius: 56, backgroundColor: "#F4F0FF", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.30)" }}>
        <div style={{ height: 150, backgroundColor: t.fundoEscuro, display: "flex", alignItems: "center", gap: 26, padding: "0 40px" }}>
          <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: t.fundo, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoCor arquivo="logo-mark.png" cor={t.destaque} largura={70} proporcao={1} />
          </div>
          <div>
            <div style={{ fontFamily: fontes.titulo, fontWeight: 700, fontSize: 46, color: "#fff", lineHeight: 1.1 }}>{contato}</div>
            <div style={{ fontFamily: fontes.texto, fontSize: 30, color: t.destaque }}>{status}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 36, right: 36, top: 180, height: alturaJanela, overflow: "hidden" }}>
          <div style={{ position: "relative", transform: `translateY(${-rolagem}px)` }}>
            {posicoes.map(({ m, y: py, h }, i) => {
              const entra = m.em === 0 ? 1 : p(f, m.em, 10);
              const direita = m.de === "cliente";
              const base: React.CSSProperties = {
                position: "absolute",
                top: py,
                [direita ? "right" : "left"]: 0,
                maxWidth: 860,
                transform: `translateY(${(1 - entra) * 40}px) scale(${0.9 + 0.1 * entra})`,
                transformOrigin: direita ? "right bottom" : "left bottom",
                opacity: entra,
              };
              if (m.de === "digitando")
                return (
                  <div key={i} style={{ ...base, backgroundColor: t.fundo, borderRadius: 40, borderBottomLeftRadius: 8, padding: "34px 40px", display: "flex", gap: 14 }}>
                    {[0, 1, 2].map((d) => (
                      <div key={d} style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: "#fff", opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f / 3.5 - d)) }} />
                    ))}
                  </div>
                );
              if (m.de === "cta")
                return (
                  <div
                    key={i}
                    style={{
                      ...base,
                      left: 0,
                      right: 0,
                      maxWidth: undefined,
                      height: h,
                      backgroundColor: t.destaque,
                      borderRadius: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 22,
                      fontFamily: fontes.texto,
                      fontWeight: 600,
                      fontSize: 52,
                      color: "#111",
                    }}
                  >
                    <Icone icone={faWhatsapp} tamanho={62} cor="#111" />
                    {m.texto}
                  </div>
                );
              return (
                <div
                  key={i}
                  style={{
                    ...base,
                    backgroundColor: direita ? "#FFFFFF" : t.fundo,
                    color: direita ? "#111" : "#fff",
                    borderRadius: 40,
                    [direita ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 8,
                    padding: "28px 38px 30px",
                    fontFamily: direita ? fontes.titulo : fontes.texto,
                    fontWeight: direita ? 700 : 500,
                    fontSize: FONTE,
                    lineHeight: `${LINHA}px`,
                    boxShadow: direita ? "0 8px 24px rgba(40,10,90,.10)" : undefined,
                  }}
                >
                  {m.n && <span style={{ color: t.fundo, marginRight: 12 }}>{m.n}.</span>}
                  {m.texto}
                  {direita && (
                    <span style={{ marginLeft: 14, display: "inline-block", verticalAlign: "middle" }}>
                      <Icone icone={faCheckDouble} tamanho={30} cor={f > m.em + 12 ? t.fundo : "#bbb"} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1730, textAlign: "center", fontFamily: fontes.texto, fontWeight: 500, fontSize: 38, color: t.destaque, opacity: p(f, bFim + 40, 10) }}>
        {arroba}
      </div>
    </AbsoluteFill>
  );
};
