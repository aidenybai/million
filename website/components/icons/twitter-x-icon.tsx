export function TwitterXIcon() {
  return (
    <>
      <a
        target="_blank"
        href="https://twitter.com/milliondotjs"
        aria-label="Million.js twitter"
        rel="nofollow noreferrer"
        className="p-[0.5rem]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="feather feather-twitter transition duration-500 ease-in-out hover:fill-[#6f42c1]"
        >
          <path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z" />
        </svg>
      </a>
      <a
        href="https://github.com/sponsors/aidenybai"
        target="_blank"
        className="hidden sm:block"
      >
        <iframe
          src="https://github.com/sponsors/aidenybai/button"
          title="Sponsor aidenybai"
          height="32"
          width="114"
          className="rounded-md border-0 dark:invert invert-0"
        ></iframe>
      </a>
    </>
  );
}
