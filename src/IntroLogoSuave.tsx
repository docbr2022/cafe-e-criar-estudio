import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { usarLayout } from "./IntroLogo";
import { LETREIRO, letrasTitulo, SCRIPT } from "./introLogoLetreiro";
import { pecasSimbolo, SIMBOLO_ALTURA } from "./introLogoSimbolo";
import { cores } from "./marca";

// Variante suave da intro da logomarca, 8 s a 30 fps: o mesmo símbolo 3D e o mesmo letreiro, com linhas finas
// e movimentos lentos. Roteiro: o contorno do símbolo é desenhado a traço fino → as peças 3D pousam sobre o
// desenho → a lâmpada acende com raios de linha fina e um anel que se abre devagar → o símbolo vai para o lugar
// do logotipo → as letras sobem e aparecem → "Marketing Design" é escrito → quadro final parado.
// Sem flash, sem tremor e sem giro. Trilha: the-borderland.mp3 a partir de 3,09 s (o grave entra no ACENDE).
export const SUAVE_FPS = 30;
export const SUAVE_DURACAO = 240;
export const SUAVE_ACENDE = 105;

export type IntroLogoSuaveProps = {
  comTexto: boolean; // false = só o símbolo
};

export const introLogoSuavePadrao: IntroLogoSuaveProps = { comTexto: true };

const PROFUNDIDADE = 16;
const MOVE = [124, 166];
const TRACO = 1.6; // espessura das linhas finas, em px de um vídeo 1080

const leve = Easing.bezier(0.25, 0.1, 0.25, 1);
const meio = Easing.inOut(Easing.sin);
const faixa = (f: number, de: number, ate: number, easing = leve) =>
  interpolate(f, [de, ate], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Ordem do desenho e do pouso: de baixo para cima, com um pouco de acaso.
const ordem = (() => {
  const idx = pecasSimbolo.map((p, i) => ({ p, i }));
  idx.sort((a, b) => a.p.y - b.p.y + (random(`so${a.i}`) - random(`so${b.i}`)) * 50);
  const r = new Array<number>(pecasSimbolo.length);
  idx.forEach(({ i }, k) => (r[i] = k / (idx.length - 1)));
  return r;
})();
const inicioTraco = (i: number) => 4 + ordem[i] * 40;
const inicioPouso = (i: number) => 52 + ordem[i] * 44;

const Simbolo3D: React.FC<{ frame: number }> = ({ frame }) => {
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
      g.translate(-p.x, -p.y, -PROFUNDIDADE / 2);
      return g;
    });
  }, []);
  const materiais = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: cores.amareloVivo, toneMapped: false }),
      new THREE.MeshStandardMaterial({ color: cores.amarelo, metalness: 0.4, roughness: 0.4, emissive: "#3d3200" }),
    ],
    [],
  );

  return (
    <>
      {pecasSimbolo.map((p, i) => {
        // Cada peça desce de perto da câmera e pousa no lugar, crescendo de leve.
        const t = faixa(frame, inicioPouso(i), inicioPouso(i) + 34);
        if (t <= 0) return null;
        const inclina = (random(`si${i}`) - 0.5) * 0.5;
        return (
          <mesh
            key={i}
            geometry={geometrias[i]}
            material={materiais}
            position={[p.x, p.y + (1 - t) * 18, (1 - t) * 160]}
            rotation={[(1 - t) * 0.35, (1 - t) * inclina, 0]}
            scale={mix(0.55, 1, t)}
          />
        );
      })}
    </>
  );
};

// Contorno do símbolo a traço fino, desenhado peça por peça antes das peças 3D pousarem.
const Contorno: React.FC<{ frame: number; cx: number; cy: number; escalaSimbolo: number; traco: number }> = ({
  frame,
  cx,
  cy,
  escalaSimbolo,
  traco,
}) => {
  const { width, height } = useVideoConfig();
  const some = faixa(frame, 92, 116);
  if (some >= 1) return null;
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      <g transform={`translate(${cx} ${cy}) scale(${escalaSimbolo} ${-escalaSimbolo})`}>
        {pecasSimbolo.map((p, i) => {
          const t = faixa(frame, inicioTraco(i), inicioTraco(i) + 34, meio);
          return (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={cores.amareloVivo}
              strokeWidth={(traco * (1 - some)) / escalaSimbolo}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - t}
            />
          );
        })}
      </g>
    </svg>
  );
};

const Fundo: React.FC<{ frame: number; cx: number; cy: number; escala: number }> = ({ frame, cx, cy, escala }) => {
  const { width, height } = useVideoConfig();
  const lado = Math.min(width, height);
  const traco = TRACO * escala;

  // Círculos concêntricos de linha fina, desenhados devagar e girando.
  const circulos = [0.3, 0.42, 0.56].map((r, k) => ({
    r: r * lado,
    t: faixa(frame, 2 + k * 10, 62 + k * 10, meio),
    gira: frame * (k % 2 ? -0.12 : 0.18) + k * 40,
    abre: k === 1 ? 0.82 : 0.94,
  }));
  const recolhe = faixa(frame, MOVE[0] - 4, MOVE[1] + 10, meio);

  // Órbita inclinada com um ponto que percorre a linha.
  const orbita = faixa(frame, 20, 80, meio) * (1 - recolhe);

  // Raios de linha fina no acendimento: crescem para fora e se recolhem.
  const raios = Array.from({ length: 36 }, (_, i) => {
    const ang = (i / 36) * Math.PI * 2;
    const atraso = random(`sr${i}`) * 8;
    const cresce = faixa(frame, SUAVE_ACENDE + atraso, SUAVE_ACENDE + atraso + 26);
    const recua = faixa(frame, SUAVE_ACENDE + atraso + 22, SUAVE_ACENDE + atraso + 52, meio);
    const r0 = lado * (0.2 + 0.36 * recua);
    const r1 = lado * (0.2 + (0.22 + (i % 3) * 0.06) * cresce);
    return { ang, r0, r1: Math.max(r0, r1), vis: cresce > 0 && recua < 1 };
  });
  const anel = faixa(frame, SUAVE_ACENDE, SUAVE_ACENDE + 60, Easing.out(Easing.cubic));
  const anel2 = faixa(frame, SUAVE_ACENDE + 10, SUAVE_ACENDE + 76, Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: cores.preto }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {circulos.map((c, k) =>
          c.t > 0 && recolhe < 1 ? (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={c.r * mix(1, 1.12, recolhe)}
              fill="none"
              stroke={cores.ouro}
              strokeWidth={traco * (1 - recolhe)}
              pathLength={1}
              strokeDasharray={`${c.t * c.abre} 1`}
              transform={`rotate(${c.gira - 90} ${cx} ${cy})`}
            />
          ) : null,
        )}
        {orbita > 0 && (
          <g transform={`translate(${cx} ${cy}) rotate(-18)`}>
            <ellipse
              rx={lado * 0.48}
              ry={lado * 0.13}
              fill="none"
              stroke={cores.ouro}
              strokeWidth={traco}
              pathLength={1}
              strokeDasharray={`${orbita} 1`}
            />
            <circle
              cx={Math.cos(frame / 22) * lado * 0.48}
              cy={Math.sin(frame / 22) * lado * 0.13}
              r={5 * escala * orbita}
              fill={cores.amareloVivo}
            />
          </g>
        )}
        {raios.map((r, i) =>
          r.vis ? (
            <line
              key={i}
              x1={cx + Math.cos(r.ang) * r.r0}
              y1={cy + Math.sin(r.ang) * r.r0}
              x2={cx + Math.cos(r.ang) * r.r1}
              y2={cy + Math.sin(r.ang) * r.r1}
              stroke={i % 4 === 0 ? cores.amareloVivo : cores.ouro}
              strokeWidth={traco}
              strokeLinecap="round"
            />
          ) : null,
        )}
        {anel > 0 && anel < 1 && (
          <circle cx={cx} cy={cy} r={mix(0.2, 0.75, anel) * lado} fill="none" stroke={cores.amareloVivo} strokeWidth={traco * 1.4 * (1 - anel)} />
        )}
        {anel2 > 0 && anel2 < 1 && (
          <circle cx={cx} cy={cy} r={mix(0.2, 0.95, anel2) * lado} fill="none" stroke={cores.ouro} strokeWidth={traco * (1 - anel2)} />
        )}
      </svg>
      <Graos frame={frame} />
    </AbsoluteFill>
  );
};

// Grãos de café em contorno fino subindo devagar depois do acendimento.
const Graos: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const escala = Math.min(width, height) / 1080;
  const surge = faixa(frame, SUAVE_ACENDE, SUAVE_ACENDE + 40);
  if (surge <= 0) return null;
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {Array.from({ length: 16 }, (_, i) => {
        const x = (0.06 + random(`gx${i}`) * 0.88) * width;
        const sobe = (frame - SUAVE_ACENDE) * (0.5 + random(`gv${i}`) * 0.7) * escala;
        const y = (0.1 + random(`gy${i}`) * 0.85) * height - sobe;
        const tam = (12 + random(`gt${i}`) * 14) * escala;
        const rot = random(`gr${i}`) * 360 + frame * (random(`gw${i}`) - 0.5) * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${(tam / 25) * surge})`}>
            <ellipse rx={18} ry={25} fill="none" stroke={cores.ouro} strokeWidth={TRACO * 0.9 * (25 / tam) * escala} />
            <path d="M0 -23 C-8 -11 8 9 0 23" fill="none" stroke={cores.ouro} strokeWidth={TRACO * 0.9 * (25 / tam) * escala} />
          </g>
        );
      })}
    </svg>
  );
};

// Letreiro original: letras sobem e aparecem uma a uma, "Marketing Design" é escrito.
const Letreiro: React.FC<{ frame: number; l: ReturnType<typeof usarLayout> }> = ({ frame, l }) => {
  const { k } = l;
  const altLetra = (LETREIRO.linhaTitulo - LETREIRO.y0) * k;
  const escreve = faixa(frame, 176, 216, meio);
  const scriptY0 = LETREIRO.linhaTitulo + 2;
  return (
    <>
      {letrasTitulo.map((letra, i) => {
        const t = faixa(frame, 142 + i * 3, 142 + i * 3 + 30);
        const w = (letra.x1 - letra.x0) * k;
        return (
          <svg
            key={i}
            width={w}
            height={altLetra}
            viewBox={`${letra.x0} ${LETREIRO.y0} ${letra.x1 - letra.x0} ${LETREIRO.linhaTitulo - LETREIRO.y0}`}
            style={{
              position: "absolute",
              overflow: "visible",
              left: l.blocoX + (letra.x0 - LETREIRO.x0) * k,
              top: l.blocoY,
              opacity: t,
              transform: `translateY(${(1 - t) * altLetra * 0.35}px)`,
            }}
          >
            <path d={letra.d} fill={cores.amareloVivo} fillRule="evenodd" />
          </svg>
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
        }}
      >
        <path d={SCRIPT.d} fill={cores.amareloVivo} fillRule="evenodd" />
      </svg>
    </>
  );
};

export const IntroLogoSuave: React.FC<IntroLogoSuaveProps> = ({ comTexto }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const l = usarLayout(width, height);
  const escala = Math.min(width, height) / 1080;

  const vai = comTexto ? faixa(frame, MOVE[0], MOVE[1], meio) : 0;
  const centro = { x: mix(l.centroInicio.x, l.centroFinal.x, vai), y: mix(l.centroInicio.y, l.centroFinal.y, vai) };
  const altura = mix(l.alturaInicio, comTexto ? l.alturaFinal : l.alturaInicio, vai);
  // Respiro leve no acendimento e um balanço lento que assenta antes do fim.
  const respiro = Math.sin(faixa(frame, SUAVE_ACENDE - 4, SUAVE_ACENDE + 40, meio) * Math.PI) * 0.035;
  const balanco =
    Math.sin((frame - SUAVE_ACENDE) / 30) * 0.16 * faixa(frame, SUAVE_ACENDE, SUAVE_ACENDE + 40, meio) * (1 - faixa(frame, 196, 226, meio));

  const fov = 30;
  const distancia = height / 2 / Math.tan((fov / 2) * (Math.PI / 180));
  const s = (altura / SIMBOLO_ALTURA) * (1 + respiro);
  const centroLampada = { x: l.centroInicio.x, y: l.centroInicio.y - (l.alturaInicio / SIMBOLO_ALTURA) * 30 };

  return (
    <AbsoluteFill>
      <Fundo frame={frame} cx={centroLampada.x} cy={centroLampada.y} escala={escala} />
      <Contorno frame={frame} cx={l.centroInicio.x} cy={l.centroInicio.y} escalaSimbolo={l.alturaInicio / SIMBOLO_ALTURA} traco={TRACO * 1.3 * escala} />
      <ThreeCanvas width={width} height={height} camera={{ fov, position: [0, 0, distancia], near: 10, far: distancia * 6 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[400, 600, 900]} intensity={2.2} />
        <directionalLight position={[-800, -200, 300]} intensity={1.0} color={cores.amareloVivo} />
        <group position={[centro.x - width / 2, height / 2 - centro.y, 0]} rotation={[0, balanco, 0]} scale={s}>
          <Simbolo3D frame={frame} />
        </group>
      </ThreeCanvas>
      {comTexto && <Letreiro frame={frame} l={l} />}
    </AbsoluteFill>
  );
};
