import { About } from './about';
import { CTA } from './cta';
import { Hero } from './hero';
import { Showcase } from './showcase';

export function Home(): JSX.Element {
  return (
    <main className="space-y-40 mb-40">
      <Hero />
      <About />
      <Showcase />
      <CTA />
    </main>
  );
}
