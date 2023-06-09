import { About } from './about';
import { CTA } from './cta';
import { Hero } from './hero';
import { FAQ } from './faq';

export function Home() {
  return (
    <main className="space-y-40 mb-40">
      <Hero />
      <About />
      <FAQ />
      <CTA />
    </main>
  );
}
