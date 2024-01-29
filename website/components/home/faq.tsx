import Image from 'next/image';
import Link from 'next/link';
import { Disclosure, Transition } from '@headlessui/react';
import { useTranslations } from 'hooks/use-translations';
import { Container } from './container';

export function FAQ() {
  const { faqs } = useTranslations();

  return (
    <div id="faq">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="text-center lg:w-5/12 lg:pl-12 lg:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white md:text-3xl lg:text-4xl">
              {faqs.frequently}
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {faqs.description}
            </p>
          </div>
          <div className="lg:w-7/12">
            <Disclosures />
          </div>
        </div>
      </Container>
    </div>
  );
}

export function Disclosures({ full = false }) {
  const { faqs } = useTranslations();
  const faq = [
    {
      question: <>{faqs.fast}</>,
      answer: (
        <>
          {faqs.novelApproach}{' '}
          <Link
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="/blog/virtual-dom"
          >
            {faqs.virtualDom}
          </Link>{' '}
          {faqs.makeItHappen}{' '}
          <Link
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="/blog/behind-the-block"
          >
            {faqs.block}
          </Link>
          .
        </>
      ),
    },
    {
      question: (
        <>
          {faqs.compare}{' '}
          <code
            className="nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10"
            dir="ltr"
            data-language="jsx"
            data-theme="default"
          >
            <span className="line">{faqs.JSFramework}</span>
          </code>
        </>
      ),
      answer: (
        <>
          {faqs.depends}{' '}
          <a
            href="https://krausest.github.io/js-framework-benchmark/current.html"
            target="_blank"
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
          >
            {faqs.benchmark}
          </a>
          . {faqs.useCase}
        </>
      ),
    },
    {
      question: <>{faqs.doesItWork}</>,
      answer: (
        <>
          {faqs.probably}{' '}
          <Link
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="/docs/install"
          >
            {faqs.guide}
          </Link>
          .
        </>
      ),
    },
    {
      question: <>{faqs.limitations}</>,
      answer: (
        <>
          {faqs.viewList}{' '}
          <Link
            className="nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="/docs/manual-mode/block#rules-of-blocks"
          >
            {faqs.rulesOfBlocks}
          </Link>
          . {faqs.importantNote}
        </>
      ),
    },
    {
      question: <>{faqs.isItMemo}</>,
      answer: (
        <>
          {faqs.memoization}
          <Link
            className="nx-text-primary-600 px-1 nx-underline nx-decoration-from-font [text-underline-position:from-font]"
            href="/blog/virtual-dom"
          >
            {faqs.backInBlock}
          </Link>
          {faqs.learnMore}
        </>
      ),
    },
    {
      question: <>{faqs.logo}</>,
      answer: (
        <>
          {faqs.he} <b>{faqs.milTheLion}</b> {faqs.friendlyMascot} (
          <i>
            {faqs.nobite} <b>{faqs.byte}</b>
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
  return (
    <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {faq.map((item, i) => (
        <Disclosure
          as="div"
          key={String(i)}
          className={`mx-auto text-lg ${full ? '' : 'max-w-2xl'}`}
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full items-start justify-between py-6 text-left text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  <svg
                    className={`arrow-down h-6 w-6 transform duration-300 ${
                      open ? 'rotate-180' : 'rotate-0'
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
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel
                  className={`pr-12 duration-300 ease-in-out ${
                    open ? '' : 'hidden'
                  }`}
                >
                  <p className="pb-6 text-base text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
