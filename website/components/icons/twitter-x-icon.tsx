import GitHubButton from 'react-github-btn';

export function TwitterXIcon() {
  return (
    <>
      <a
        style={{ padding: '0.5rem' }}
        target="_blank"
        href="https://twitter.com/milliondotjs"
        aria-label="Million.js twitter"
        rel="nofollow noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="feather feather-twitter"
        >
          <path d="M16.99 0H20.298L13.071 8.26L21.573 19.5H14.916L9.702 12.683L3.736 19.5H0.426L8.156 10.665L0 0H6.826L11.539 6.231L16.99 0ZM15.829 17.52H17.662L5.83 1.876H3.863L15.829 17.52Z"></path>
        </svg>
        <style jsx>
          {`
            svg {
              transition: fill 0.5s ease;
            }

            svg:hover,
            svg:focus {
              fill: #6f42c1;
            }
          `}
        </style>
      </a>
    </>
  );
}
