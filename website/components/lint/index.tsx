import Cases from './cases';
import Intro from './intro';
import Join from './join';

export default function Home() {
  return (
    <>
      <main
        className={`relative flex min-h-screen flex-col items-center justify-start overflow-x-hidden leading-normal space-y-[1.5rem] pt-16 mb-32`}
      >
        <Intro />
        <Cases />
        <Join />
      </main>
    </>
  );
}
