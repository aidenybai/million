const ANIMATION_DURATION = 300;
let interval: number | undefined;

export const createProgressBar = (): HTMLElement => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = `.million-progress-bar {
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    height: 2px;
    background: #0076ff;
    z-index: 2147483647;
    transition:
      width ${ANIMATION_DURATION}ms ease-out,
      opacity ${ANIMATION_DURATION / 2}ms ${ANIMATION_DURATION / 2}ms ease-in;
    transform: translate3d(0, 0, 0);
  }`;
  document.head.insertBefore(style, document.head.firstChild);

  const el = document.createElement('div');
  el.className = 'million-progress-bar';
  el.style.width = '0';
  el.style.opacity = '1';

  return el;
};

export const startTrickle = (el: HTMLElement): void => {
  let value = 0;
  document.documentElement.insertBefore(el, document.body);
  window.setInterval(() => {
    value += Math.random() / 100;
    requestAnimationFrame(() => {
      el.style.width = `${10 + value * 90}%`;
    });
  }, ANIMATION_DURATION);
};

export const stopTrickle = (el: HTMLElement): void => {
  el.style.opacity = '0';
  el.style.width = '100%';
  setTimeout(() => {
    clearInterval(interval);
    interval = undefined;
    document.documentElement.removeChild(el);
  }, ANIMATION_DURATION * 1.5);
};
