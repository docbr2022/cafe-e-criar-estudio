import { Composition, Still } from "remotion";
import { FeedPost, feedPostPadrao } from "./FeedPost";
import { DURACAO, FPS, Reels, reelsPadrao } from "./Reels";

export const Root: React.FC = () => (
  <>
    <Still id="FeedPost" component={FeedPost} width={1080} height={1350} defaultProps={feedPostPadrao} />
    <Composition id="Reels" component={Reels} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO} defaultProps={reelsPadrao} />
  </>
);
