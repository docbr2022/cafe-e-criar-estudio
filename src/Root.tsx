import { Composition, Still } from "remotion";
import { TESTE_DURACAO, TESTE_FPS, TesteEdicao } from "./TesteEdicao";
import { ABAS_DURACAO, ABAS_FPS, ReelsAbas, reelsAbasPadrao } from "./ReelsAbas";
import { CADERNO_DURACAO, CADERNO_FPS, ReelsCaderno, reelsCadernoPadrao } from "./ReelsCaderno";
import { COMANDA_DURACAO, COMANDA_FPS, ReelsComanda, reelsComandaPadrao } from "./ReelsComanda";
import { CONVERSA_FPS, conversaDuracao, ReelsConversa, reelsConversaPadrao } from "./ReelsConversa";
import { CUPOM_DURACAO, CUPOM_FPS, ReelsCupom, reelsCupomPadrao } from "./ReelsCupom";
import { BOAS_VINDAS_DURACAO, BOAS_VINDAS_FPS, BoasVindas, boasVindasPadrao } from "./BoasVindas";
import { BoasVindasRock, boasVindasRockPadrao, ROCK_DURACAO, ROCK_FPS } from "./BoasVindasRock";
import { FeedPost, feedPostPadrao } from "./FeedPost";
import { DURACAO, FPS, Reels, reelsPadrao } from "./Reels";
import { Carrossel, carrosselPadrao } from "./Carrossel";
import { ESTILOS_DURACAO, ESTILOS_FPS, ReelsEstilos, reelsEstilosPadrao } from "./ReelsEstilos";
import { ReelsWG, reelsWGPadrao, WG_DURACAO, WG_FPS } from "./ReelsWG";
import { MATRIZ_DURACAO, MATRIZ_FPS, ReelsMatriz, reelsMatrizPadrao } from "./ReelsMatriz";
import { MARCA_DURACAO, MARCA_FPS, ReelsMarca, reelsMarcaPadrao } from "./ReelsMarca";
import { ERROS_DURACAO, ERROS_FPS, ReelsErros, reelsErrosPadrao } from "./ReelsErros";
import { PERGUNTAS_DURACAO, PERGUNTAS_FPS, ReelsPerguntas, reelsPerguntasPadrao } from "./ReelsPerguntas";
import { ReelsSistema, reelsSistemaPadrao, SISTEMA_DURACAO, SISTEMA_FPS } from "./ReelsSistema";
import { OFERTA_ABERTURA_DURACAO, OFERTA_DURACAO, OFERTA_FPS, OFERTA_PRECO_DURACAO, ReelsOferta, reelsOfertaPadrao } from "./ReelsOferta";

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
      calculateMetadata={({ props }) => ({ durationInFrames: props.abertura ? OFERTA_ABERTURA_DURACAO : props.abrirComPreco ? OFERTA_PRECO_DURACAO : OFERTA_DURACAO })}
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
    <Composition
      id="ReelsMarca"
      component={ReelsMarca}
      width={1080}
      height={1920}
      fps={MARCA_FPS}
      durationInFrames={MARCA_DURACAO}
      defaultProps={reelsMarcaPadrao}
    />
    <Composition
      id="ReelsMatriz"
      component={ReelsMatriz}
      width={1080}
      height={1920}
      fps={MATRIZ_FPS}
      durationInFrames={MATRIZ_DURACAO}
      defaultProps={reelsMatrizPadrao}
    />
    <Composition id="ReelsWG" component={ReelsWG} width={1080} height={1920} fps={WG_FPS} durationInFrames={WG_DURACAO} defaultProps={reelsWGPadrao} />
    <Composition
      id="ReelsEstilos"
      component={ReelsEstilos}
      width={1080}
      height={1920}
      fps={ESTILOS_FPS}
      durationInFrames={ESTILOS_DURACAO}
      defaultProps={reelsEstilosPadrao}
    />
    <Composition
      id="ReelsPerguntas"
      component={ReelsPerguntas}
      width={1080}
      height={1920}
      fps={PERGUNTAS_FPS}
      durationInFrames={PERGUNTAS_DURACAO}
      defaultProps={reelsPerguntasPadrao}
      calculateMetadata={({ props }) => ({ durationInFrames: 60 + props.perguntas.length * 120 + 120 })}
    />
    <Composition
      id="ReelsSistema"
      component={ReelsSistema}
      width={1080}
      height={1920}
      fps={SISTEMA_FPS}
      durationInFrames={SISTEMA_DURACAO}
      defaultProps={reelsSistemaPadrao}
    />
    <Composition id="ReelsCupom" component={ReelsCupom} width={1080} height={1920} fps={CUPOM_FPS} durationInFrames={CUPOM_DURACAO} defaultProps={reelsCupomPadrao} />
    <Composition id="ReelsConversa" component={ReelsConversa} width={1080} height={1920} fps={CONVERSA_FPS} durationInFrames={conversaDuracao(4)} defaultProps={reelsConversaPadrao} calculateMetadata={({ props }) => ({ durationInFrames: conversaDuracao(props.perguntas.length) })} />
    <Composition id="ReelsComanda" component={ReelsComanda} width={1080} height={1920} fps={COMANDA_FPS} durationInFrames={COMANDA_DURACAO} defaultProps={reelsComandaPadrao} />
    <Composition id="ReelsCaderno" component={ReelsCaderno} width={1080} height={1920} fps={CADERNO_FPS} durationInFrames={CADERNO_DURACAO} defaultProps={reelsCadernoPadrao} />
    <Composition id="TesteEdicao" component={TesteEdicao} width={1080} height={1920} fps={TESTE_FPS} durationInFrames={TESTE_DURACAO} />
    <Composition id="ReelsAbas" component={ReelsAbas} width={1080} height={1920} fps={ABAS_FPS} durationInFrames={ABAS_DURACAO} defaultProps={reelsAbasPadrao} />
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
