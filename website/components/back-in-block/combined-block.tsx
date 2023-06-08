import { Slideshow } from './slideshow';
import {
  frames as staticAnalysisFrames,
  descriptions as staticAnalysisDescriptions,
} from './static-analysis';
import {
  frames as blockVDomFrames,
  descriptions as blockVDomDescriptions,
} from './block-vdom';

export const CombinedBlockExample = () => {
  return (
    <Slideshow
      frames={[...staticAnalysisFrames, ...blockVDomFrames]}
      descriptions={[...staticAnalysisDescriptions, ...blockVDomDescriptions]}
    />
  );
};
