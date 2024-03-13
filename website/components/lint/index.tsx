import Intro from './intro';

export default function Home() {
  return (
    <>
      <main
        className={`relative flex min-h-screen flex-col items-center justify-start overflow-x-hidden leading-normal space-y-40 pt-12 mb-32`}
      >
        <Intro />
      </main>
    </>
  );
}
