import { LazyMotion, domAnimation } from 'framer-motion';
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
    <LazyMotion features={domAnimation}>
      <Slideshow
        frames={[...staticAnalysisFrames, ...blockVDomFrames]}
        descriptions={[...staticAnalysisDescriptions, ...blockVDomDescriptions]}
      />
    </LazyMotion>
  );
};
