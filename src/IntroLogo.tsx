import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { pecasSimbolo, SIMBOLO_ALTURA, SIMBOLO_LARGURA } from "./introLogoSimbolo";
import { LETREIRO, letrasTitulo, SCRIPT } from "./introLogoLetreiro";
import { cores } from "./marca";

// Intro animada da logomarca, 7 s a 30 fps, peça reutilizável (abertura de Reels, vídeos e apresentações).
// O símbolo é 3D de verdade: cada grão, o cérebro e a base da lâmpada são extrudados a partir do vetor do logo.
// Roteiro: os grãos voam e se encaixam girando → a lâmpada acende no impacto → o símbolo vai para o lugar do
// logotipo → "Café e Criar" vira letra a letra → "Marketing Design" é escrito → giro final e quadro limpo.
// O mesmo componente monta a versão em pé (9:16, quadrada) e a deitada (16:9) a partir do tamanho do vídeo.
// Sem trilha no render; trilha aplicada com ffmpeg (the-borderland.mp3 a partir de 10,275 s cai a batida no IMPACTO).
export const INTRO_FPS = 30;
export const INTRO_DURACAO = 210;
export const INTRO_IMPACTO = 78;

export type IntroLogoProps = {
  comTexto: boolean; // false = só o símbolo (para marca d'água ou abertura curta)
  giroFinal: boolean; // giro de 360° do símbolo antes do quadro final
};

export const introLogoPadrao: IntroLogoProps = { comTexto: true, giroFinal: true };

const PROFUNDIDADE = 16;
const MOVE = [96, 126];

const suave = Easing.bezier(0.16, 1, 0.3, 1);
const meio = Easing.inOut(Easing.cubic);
const faixa = (f: number, de: number, ate: number, easing = suave) =>
  interpolate(f, [de, ate], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Posições na tela (px, origem no canto superior esquerdo) para cada formato.
// O letreiro é desenhado na escala k sobre as coordenadas do logo-full.png.
const LARGURA_LETREIRO = LETREIRO.x1 - LETREIRO.x0;
const ALTURA_LETREIRO = LETREIRO.y1 - LETREIRO.y0;
const usarLayout = (width: number, height: number) => {
  const deitado = width > height * 1.2;
  if (deitado) {
    const u = height / 1080;
    const alturaFinal = 470 * u;
    const larguraSimbolo = (alturaFinal * SIMBOLO_LARGURA) / SIMBOLO_ALTURA;
    const k = 1.9 * u;
    const vao = 70 * u;
    const inicioX = (width - (larguraSimbolo + vao + LARGURA_LETREIRO * k)) / 2;
    return {
      deitado,
      centroInicio: { x: width / 2, y: height / 2 },
      alturaInicio: 720 * u,
      centroFinal: { x: inicioX + larguraSimbolo / 2, y: height / 2 },
      alturaFinal,
      k,
      blocoX: inicioX + larguraSimbolo + vao,
      blocoY: height / 2 - (ALTURA_LETREIRO * k) / 2,
    };
  }
  const u = width / 1080;
  const alturaFinal = Math.min(560 * u, height * 0.42);
  const k = 1.3 * u;
  const vao = 60 * u;
  const topo = (height - (alturaFinal + vao + ALTURA_LETREIRO * k)) / 2;
  return {
    deitado,
    centroInicio: { x: width / 2, y: height / 2 },
    alturaInicio: Math.min(820 * u, height * 0.6),
    centroFinal: { x: width / 2, y: topo + alturaFinal / 2 },
    alturaFinal,
    k,
    blocoX: (width - LARGURA_LETREIRO * k) / 2,
    blocoY: topo + alturaFinal + vao,
  };
};

// Ponto de partida de cada peça: espalhadas numa casca 3D em volta do símbolo, giradas.
const partida = (i: number, tipo: string) => {
  const ang = random(`ang${i}`) * Math.PI * 2;
  const raio = tipo === "grao" ? 380 + random(`r${i}`) * 420 : 0;
  return {
    x: Math.cos(ang) * raio,
    y: Math.sin(ang) * raio + (tipo === "base" ? -420 : 0),
    z: tipo === "cerebro" ? -1600 : tipo === "base" ? 0 : -900 + random(`z${i}`) * 1300,
    rx: (random(`rx${i}`) - 0.5) * Math.PI * 4,
    ry: (random(`ry${i}`) - 0.5) * Math.PI * 4 + (tipo === "cerebro" ? Math.PI * 2 : 0),
    rz: (random(`rz${i}`) - 0.5) * Math.PI * 3,
  };
};

// Ordem de chegada: grãos de baixo para cima, cérebro em seguida, base por último fecha a lâmpada.
const chegadas = (() => {
  const graos = pecasSimbolo.map((p, i) => ({ p, i })).filter(({ p }) => p.tipo === "grao");
  graos.sort((a, b) => a.p.y - b.p.y + (random(`o${a.i}`) - random(`o${b.i}`)) * 40);
  const ordem = new Map<number, number>();
  graos.forEach(({ i }, k) => ordem.set(i, 8 + k * 1.15));
  return pecasSimbolo.map((p, i) => (p.tipo === "grao" ? ordem.get(i)! : p.tipo === "cerebro" ? 34 + (p.x > 40 ? 0 : 4) : 50));
})();
const DURACAO_VOO = 30;

const Simbolo: React.FC<{ frame: number }> = ({ frame }) => {
  const geometrias = useMemo(() => {
    const loader = new SVGLoader();
    return pecasSimbolo.map((p) => {
      const svg = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${p.d}"/></svg>`);
      const formas = svg.paths.flatMap((caminho) => SVGLoader.createShapes(caminho));
      const g = new THREE.ExtrudeGeometry(formas, {
        depth: PROFUNDIDADE,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 2.2,
        bevelSize: 0.7,
        bevelSegments: 3,
      });
      // Origem de cada peça no próprio centro, para girar em torno de si durante o voo.
      g.translate(-p.x, -p.y, -PROFUNDIDADE / 2);
      return g;
    });
  }, []);

  // Frente e verso no amarelo vivo exato da marca; laterais em ouro iluminado dão o volume.
  const materiais = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: cores.amareloVivo, toneMapped: false }),
      new THREE.MeshStandardMaterial({ color: cores.amarelo, metalness: 0.45, roughness: 0.32, emissive: "#3d3200" }),
    ],
    [],
  );

  return (
    <>
      {pecasSimbolo.map((p, i) => {
        const s = partida(i, p.tipo);
        const t = faixa(frame, chegadas[i], chegadas[i] + DURACAO_VOO);
        const surge = faixa(frame, chegadas[i], chegadas[i] + 8, Easing.out(Easing.quad));
        return (
          <mesh
            key={i}
            geometry={geometrias[i]}
            material={materiais}
            position={[mix(p.x + s.x, p.x, t), mix(p.y + s.y, p.y, t), mix(s.z, 0, t)]}
            rotation={[s.rx * (1 - t), s.ry * (1 - t), s.rz * (1 - t)]}
            scale={Math.max(0.001, surge)}
          />
        );
      })}
    </>
  );
};

// Grão de café chapado (2D) para partículas de fundo.
const Grao: React.FC<{ tamanho: number; cor: string }> = ({ tamanho, cor }) => (
  <svg width={tamanho} height={tamanho * 1.35} viewBox="0 0 40 54">
    <ellipse cx="20" cy="27" rx="18" ry="25" fill={cor} />
    <path d="M20 4 C12 16 28 36 20 50" stroke={cores.preto} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Fundo: React.FC<{ frame: number; cx: number; cy: number; escala: number }> = ({ frame, cx, cy, escala }) => {
  const { width, height } = useVideoConfig();
  const diag = Math.hypot(width, height);
  const batidas = [54, 60, 66, 72];
  const pulso = batidas.reduce((acc, b) => acc + Math.exp(-Math.max(0, frame - b) / 3) * (frame >= b ? 1 : 0), 0);

  // Linhas de velocidade convergindo para o centro antes do impacto.
  const linhas = Array.from({ length: 28 }, (_, i) => {
    const ang = (i / 28) * Math.PI * 2 + random(`la${i}`) * 0.2;
    const ciclo = (frame * (0.045 + random(`lv${i}`) * 0.03) + random(`lf${i}`)) % 1;
    const r1 = diag * (1 - ciclo) * 0.75;
    const r2 = r1 + diag * 0.12 * (1 - ciclo);
    const vis = interpolate(frame, [0, 6, INTRO_IMPACTO - 6, INTRO_IMPACTO], [0, 1, 1, 0], { extrapolateRight: "clamp" });
    return { ang, r1, r2, w: (2 + random(`lw${i}`) * 3) * escala * vis };
  });

  // Raios e onda de choque do acendimento.
  const pos = frame - INTRO_IMPACTO;
  const raiosAbre = faixa(frame, INTRO_IMPACTO, INTRO_IMPACTO + 10);
  const raiosFecha = faixa(frame, INTRO_IMPACTO + 8, INTRO_IMPACTO + 34, meio);
  const larguraRaio = (1 - raiosFecha) * 0.07;
  const onda = faixa(frame, INTRO_IMPACTO, INTRO_IMPACTO + 26, Easing.out(Easing.cubic));
  const onda2 = faixa(frame, INTRO_IMPACTO + 4, INTRO_IMPACTO + 34, Easing.out(Easing.cubic));
  const aneis = [0.34, 0.5, 0.68].map((r, k) => ({
    r: r * Math.min(width, height) * (1 + pulso * 0.04 * (k + 1)),
    w: (2 + pulso * 3) * escala,
  }));
  const vistaAneis = interpolate(frame, [10, 30, INTRO_IMPACTO, MOVE[1]], [0, 1, 1, 0.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {linhas.map((l, i) => (
          <line
            key={i}
            x1={cx + Math.cos(l.ang) * l.r1}
            y1={cy + Math.sin(l.ang) * l.r1}
            x2={cx + Math.cos(l.ang) * l.r2}
            y2={cy + Math.sin(l.ang) * l.r2}
            stroke={i % 3 === 0 ? cores.amareloVivo : cores.ouro}
            strokeWidth={l.w}
            strokeLinecap="round"
          />
        ))}
        {vistaAneis > 0.01 &&
          aneis.map((a, k) => (
            <circle key={k} cx={cx} cy={cy} r={a.r * (0.6 + 0.4 * vistaAneis)} fill="none" stroke={cores.ouro} strokeWidth={a.w * vistaAneis} />
          ))}
        {pos >= 0 && raiosFecha < 1 && (
          <g transform={`translate(${cx} ${cy}) rotate(${pos * 0.9})`}>
            {Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2;
              const comp = diag * (0.25 + 0.5 * raiosAbre) * (i % 2 ? 0.7 : 1);
              const w = larguraRaio * (i % 2 ? 0.6 : 1);
              return (
                <path
                  key={i}
                  d={`M0 0 L${Math.cos(a - w) * comp} ${Math.sin(a - w) * comp} L${Math.cos(a + w) * comp} ${Math.sin(a + w) * comp} Z`}
                  fill={i % 2 ? cores.ouro : cores.amareloVivo}
                />
              );
            })}
          </g>
        )}
        {pos >= 0 && onda < 1 && (
          <circle cx={cx} cy={cy} r={onda * diag * 0.6} fill="none" stroke={cores.amareloVivo} strokeWidth={(1 - onda) * 40 * escala} />
        )}
        {pos >= 4 && onda2 < 1 && (
          <circle cx={cx} cy={cy} r={onda2 * diag * 0.5} fill="none" stroke={cores.ouro} strokeWidth={(1 - onda2) * 22 * escala} />
        )}
      </svg>
      <Particulas frame={frame} />
    </AbsoluteFill>
  );
};

// Grãos flutuando em profundidade depois do acendimento.
const Particulas: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const escala = Math.min(width, height) / 1080;
  const sai = faixa(frame, INTRO_IMPACTO, INTRO_IMPACTO + 30);
  return (
    <>
      {Array.from({ length: 22 }, (_, i) => {
        const prof = 0.4 + random(`pp${i}`) * 0.6;
        const ang = random(`pa${i}`) * Math.PI * 2;
        const dist = (0.25 + random(`pd${i}`) * 0.6) * Math.max(width, height) * 0.6 * sai;
        const deriva = (frame - INTRO_IMPACTO) * prof * 0.6 * escala;
        const x = width / 2 + Math.cos(ang) * dist + Math.cos(ang) * deriva;
        const y = height / 2 + Math.sin(ang) * dist + Math.sin(ang) * deriva - deriva * 0.3;
        const tam = (14 + prof * 26) * escala * sai;
        if (tam < 0.5) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) rotate(${random(`pr${i}`) * 360 + frame * (random(`pv${i}`) - 0.5) * 4}deg)`,
            }}
          >
            <Grao tamanho={tam} cor={prof > 0.75 ? cores.amarelo : cores.ouro} />
          </div>
        );
      })}
    </>
  );
};

// Letreiro com as letras originais do logotipo: "Café e Criar" vira letra a letra, "Marketing Design" é escrito.
const Titulo: React.FC<{ frame: number; l: ReturnType<typeof usarLayout> }> = ({ frame, l }) => {
  const { k } = l;
  const altLetra = (LETREIRO.linhaTitulo - LETREIRO.y0) * k;
  const onda = (i: number) => (frame >= 166 && frame <= 200 ? Math.max(0, -Math.sin(((frame - 166 - i * 1.5) / 18) * Math.PI)) : 0);
  const escreve = faixa(frame, 132, 166, meio);
  const scriptY0 = LETREIRO.linhaTitulo + 2;
  return (
    <>
      {letrasTitulo.map((letra, i) => {
        const t = faixa(frame, 104 + i * 2.4, 104 + i * 2.4 + 20);
        const w = (letra.x1 - letra.x0) * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l.blocoX + (letra.x0 - LETREIRO.x0) * k,
              top: l.blocoY,
              width: w,
              height: altLetra,
              perspective: altLetra * 8,
              opacity: interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            <svg
              width={w}
              height={altLetra}
              viewBox={`${letra.x0} ${LETREIRO.y0} ${letra.x1 - letra.x0} ${LETREIRO.linhaTitulo - LETREIRO.y0}`}
              style={{
                overflow: "visible",
                transformOrigin: "50% 100%",
                transform: `translateY(${(1 - t) * altLetra * 0.6 - onda(i) * altLetra * 0.12}px) rotateX(${(1 - t) * -95}deg) scale(${mix(1.5, 1, t)})`,
              }}
            >
              <path d={letra.d} fill={cores.amareloVivo} fillRule="evenodd" />
            </svg>
          </div>
        );
      })}
      <svg
        width={(SCRIPT.x1 - SCRIPT.x0) * k}
        height={(LETREIRO.y1 - scriptY0) * k}
        viewBox={`${SCRIPT.x0} ${scriptY0} ${SCRIPT.x1 - SCRIPT.x0} ${LETREIRO.y1 - scriptY0}`}
        style={{
          position: "absolute",
          overflow: "visible",
          left: l.blocoX + (SCRIPT.x0 - LETREIRO.x0) * k,
          top: l.blocoY + (scriptY0 - LETREIRO.y0) * k,
          clipPath: `inset(-20% ${(1 - escreve) * 100}% -20% 0)`,
          transform: `translateX(${(1 - escreve) * 40 * k}px)`,
        }}
      >
        <path d={SCRIPT.d} fill={cores.amareloVivo} fillRule="evenodd" />
      </svg>
    </>
  );
};

export const IntroLogo: React.FC<IntroLogoProps> = ({ comTexto, giroFinal }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const l = usarLayout(width, height);
  const escala = Math.min(width, height) / 1080;

  // Movimento do símbolo inteiro: entra girando, para no impacto, vai para o lugar do logotipo e balança.
  const vai = comTexto ? faixa(frame, MOVE[0], MOVE[1], meio) : 0;
  const centro = { x: mix(l.centroInicio.x, l.centroFinal.x, vai), y: mix(l.centroInicio.y, l.centroFinal.y, vai) };
  const altura = mix(l.alturaInicio, comTexto ? l.alturaFinal : l.alturaInicio, vai);
  const pos = frame - INTRO_IMPACTO;
  const chute = pos >= 0 ? Math.exp(-pos / 7) * Math.cos(pos / 2.2) * 0.07 : 0;
  const tremor = pos >= 0 ? Math.exp(-pos / 5) * 10 * escala : 0;
  const balanco = Math.sin((frame - INTRO_IMPACTO) / 22) * 0.22 * faixa(frame, INTRO_IMPACTO + 4, INTRO_IMPACTO + 40, meio);
  const giro = giroFinal ? faixa(frame, 166, 198, meio) * Math.PI * 2 : 0;
  const entradaY = interpolate(frame, [0, INTRO_IMPACTO], [-Math.PI * 1.6, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const entradaX = interpolate(frame, [0, INTRO_IMPACTO], [0.5, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const ry = entradaY + balanco * (1 - faixa(frame, 160, 170, meio)) + giro;

  // Câmera calibrada para 1 unidade = 1 px no plano z = 0.
  const fov = 30;
  const distancia = height / 2 / Math.tan((fov / 2) * (Math.PI / 180));
  const s = (altura / SIMBOLO_ALTURA) * (1 + chute);

  // Raios saem do centro da lâmpada (não do centro do símbolo).
  const centroLampada = { x: l.centroInicio.x, y: l.centroInicio.y - (l.alturaInicio / SIMBOLO_ALTURA) * 30 };

  return (
    <AbsoluteFill>
      <Fundo frame={frame} cx={centroLampada.x} cy={centroLampada.y} escala={escala} />
      <AbsoluteFill style={{ transform: `translate(${Math.sin(frame * 2.1) * tremor}px, ${Math.cos(frame * 1.7) * tremor}px)` }}>
        <ThreeCanvas width={width} height={height} camera={{ fov, position: [0, 0, distancia], near: 10, far: distancia * 6 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[400, 600, 900]} intensity={2.4} />
          <directionalLight position={[-800, -200, 300]} intensity={1.2} color={cores.amareloVivo} />
          <group position={[centro.x - width / 2, height / 2 - centro.y, 0]} rotation={[entradaX, ry, 0]} scale={s}>
            <Simbolo frame={frame} />
          </group>
        </ThreeCanvas>
      </AbsoluteFill>
      {comTexto && <Titulo frame={frame} l={l} />}
      {pos >= 0 && pos < 5 && (
        <AbsoluteFill style={{ backgroundColor: cores.amareloVivo, opacity: interpolate(pos, [0, 1, 4], [1, 0.85, 0], { extrapolateRight: "clamp" }) }} />
      )}
    </AbsoluteFill>
  );
};
