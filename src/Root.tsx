import { Composition, Still } from "remotion";
import { FeedPost, feedPostPadrao } from "./FeedPost";
import { INTRO_DURACAO, INTRO_FPS, IntroLogo, introLogoPadrao } from "./IntroLogo";
import { DURACAO, FPS, Reels, reelsPadrao } from "./Reels";

export const Root: React.FC = () => (
  <>
    <Still id="FeedPost" component={FeedPost} width={1080} height={1350} defaultProps={feedPostPadrao} />
    <Composition id="Reels" component={Reels} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO} defaultProps={reelsPadrao} />
    <Composition id="IntroLogo" component={IntroLogo} width={1080} height={1920} fps={INTRO_FPS} durationInFrames={INTRO_DURACAO} defaultProps={introLogoPadrao} />
    <Composition id="IntroLogoHorizontal" component={IntroLogo} width={1920} height={1080} fps={INTRO_FPS} durationInFrames={INTRO_DURACAO} defaultProps={introLogoPadrao} />
    <Composition id="IntroLogoQuadrado" component={IntroLogo} width={1080} height={1080} fps={INTRO_FPS} durationInFrames={INTRO_DURACAO} defaultProps={introLogoPadrao} />
  </>
);
