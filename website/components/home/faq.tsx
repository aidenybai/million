import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from './container';

const faq = [
  {
    question: <>How is it fast?</>,
    answer: (
      <>
        We use a novel approach to the virtual DOM called the block virtual DOM.
        You can read more on what the block virtual DOM is with{' '}
        <Link
          className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
          href="/blog/virtual-dom"
        >
          Virtual DOM: Back in Block
        </Link>{' '}
        and how we make it happen in React with{' '}
        <Link
          className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
          href="/blog/behind-the-block"
        >
          Behind the block()
        </Link>
        .
      </>
    ),
  },
  {
    question: (
      <>
        How does it compare to{' '}
        <code
          className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
          dir="ltr"
          data-language="jsx"
          data-theme="default"
        >
          <span className="line">[insert fast JS framework]</span>
        </code>
      </>
    ),
    answer: (
      <>
        Depends on what you're asking. If you're asking about performance, you
        can view a subjective truth with the{' '}
        <a
          href="https://krausest.github.io/js-framework-benchmark/current.html"
          target="_blank"
          className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
        >
          JS Framework Benchmark
        </a>
        . If you're asking about features, it depends. Million.js' main use case
        is for optimizing UI / data heavy React applications. Ultimately you
        should be choosing the framework that works best for you, your team, and
        your project.
      </>
    ),
  },
  {
    question: <> Does it work with Preact, Next.js, etc.?</>,
    answer: (
      <>
        If it uses React or Preact, then probably. You can reference the full
        list of supported tools on the{' '}
        <Link
          className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
          href="/docs/install"
        >
          Installation Guide
        </Link>
        .
      </>
    ),
  },
  {
    question: <>What are the limitations?</>,
    answer: (
      <>
        You can view the list of current limitations in the{' '}
        <Link
          className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
          href="/docs/rules"
        >
          Rules of Block
        </Link>
        . We are actively working on removing these limitations. It's also
        important to note that your application may not need Million.js – if
        your app is not UI heavy, you may not see much performance improvement.
      </>
    ),
  },
  {
    question: <>What is the logo supposed to be?</>,
    answer: (
      <>
        He's <b>Mil the Lion!</b> He's the friendly mascot of the Million.js
        project. (
        <i>
          don't worry, he doesn't bite, but he will <b>byte!</b>
        </i>
        )
        <Image
          src="./lion.svg"
          width={300}
          height={200}
          className="mt-5"
          alt="Mil the lion"
        />
      </>
    ),
  },
];

export function FAQ() {
  const [active, setActive] = useState<number[]>([]);

  return (
    <div className="mt-32" id="faq">
      <Container>
        <div className="mt-32 flex flex-col gap-12 lg:flex-row">
          <div className="text-center lg:w-5/12 lg:pl-12 lg:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white md:text-3xl lg:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              You can find more specific information about the library by
              digging into the documentation and reading our blog articles.
            </p>
          </div>
          <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800 lg:w-7/12">
            {faq.map((item, i) => (
              <div key={i}>
                <dl className="faq mx-auto max-w-2xl">
                  <dt className="text-lg">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between py-6 text-left text-gray-400"
                      aria-controls="faq-5"
                      data-active="false"
                      onClick={() => {
                        if (active.includes(i)) {
                          active.splice(active.indexOf(i), 1);
                        } else active.push(i);
                        setActive([...active]);
                      }}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <svg
                          className={`arrow-down h-6 w-6 transform duration-300 ${
                            active.includes(i) ? 'rotate-180' : 'rotate-0'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          ></path>
                        </svg>
                      </span>
                    </button>
                  </dt>
                  <dd
                    className={`${
                      active.includes(i) ? '' : 'hidden'
                    } pr-12 duration-300 ease-in-out`}
                  >
                    <p className="pb-6 text-base text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </p>
                  </dd>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
