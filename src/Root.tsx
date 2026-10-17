import { Composition, Still } from "remotion";
import { BOAS_VINDAS_DURACAO, BOAS_VINDAS_FPS, BoasVindas, boasVindasPadrao } from "./BoasVindas";
import { BoasVindasRock, boasVindasRockPadrao, ROCK_DURACAO, ROCK_FPS } from "./BoasVindasRock";
import { FeedPost, feedPostPadrao } from "./FeedPost";
import { DURACAO, FPS, Reels, reelsPadrao } from "./Reels";
import { Carrossel, carrosselPadrao } from "./Carrossel";
import { ERROS_DURACAO, ERROS_FPS, ReelsErros, reelsErrosPadrao } from "./ReelsErros";
import { OFERTA_DURACAO, OFERTA_FPS, OFERTA_PRECO_DURACAO, ReelsOferta, reelsOfertaPadrao } from "./ReelsOferta";

export const Root: React.FC = () => (
  <>
    <Still id="FeedPost" component={FeedPost} width={1080} height={1350} defaultProps={feedPostPadrao} />
    <Composition id="Reels" component={Reels} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO} defaultProps={reelsPadrao} />
    <Composition
      id="ReelsOferta"
      component={ReelsOferta}
      width={1080}
      height={1920}
      fps={OFERTA_FPS}
      durationInFrames={OFERTA_DURACAO}
      defaultProps={reelsOfertaPadrao}
      calculateMetadata={({ props }) => ({ durationInFrames: props.abrirComPreco ? OFERTA_PRECO_DURACAO : OFERTA_DURACAO })}
    />
    <Composition
      id="ReelsErros"
      component={ReelsErros}
      width={1080}
      height={1920}
      fps={ERROS_FPS}
      durationInFrames={ERROS_DURACAO}
      defaultProps={reelsErrosPadrao}
    />
    <Still id="Carrossel" component={Carrossel} width={1080} height={1350} defaultProps={carrosselPadrao} />
    <Composition
      id="BoasVindas"
      component={BoasVindas}
      width={1080}
      height={1920}
      fps={BOAS_VINDAS_FPS}
      durationInFrames={BOAS_VINDAS_DURACAO}
      defaultProps={boasVindasPadrao}
    />
    <Composition
      id="BoasVindasRock"
      component={BoasVindasRock}
      width={1080}
      height={1920}
      fps={ROCK_FPS}
      durationInFrames={ROCK_DURACAO}
      defaultProps={boasVindasRockPadrao}
    />
  </>
);
