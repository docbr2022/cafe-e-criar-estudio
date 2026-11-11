import { Composition, Still } from "remotion";
import { FeedPost, feedPostPadrao } from "./FeedPost";
import { NOTEBOOK_DURACAO, NOTEBOOK_FPS, ReelsNotebook, reelsNotebookPadrao } from "./ReelsNotebook";
import { DURACAO, FPS, Reels, reelsPadrao } from "./Reels";

export const Root: React.FC = () => (
  <>
    <Still id="FeedPost" component={FeedPost} width={1080} height={1350} defaultProps={feedPostPadrao} />
    <Composition id="Reels" component={Reels} width={1080} height={1920} fps={FPS} durationInFrames={DURACAO} defaultProps={reelsPadrao} />
    <Composition id="ReelsNotebook" component={ReelsNotebook} width={1080} height={1920} fps={NOTEBOOK_FPS} durationInFrames={NOTEBOOK_DURACAO} defaultProps={reelsNotebookPadrao} />
  </>
);
