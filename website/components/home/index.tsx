import { About } from './about';
import { Community } from './community';
import { CTA } from './cta';
import { FAQ } from './faq';
import { Hero } from './hero';
import { Showcase } from './showcase';

export function Home() {
  return (
    <main className="space-y-40 mb-40">
      <Hero />
      <About />
      <Showcase />
      <Community />
      <CTA />
    </main>
  );
}
