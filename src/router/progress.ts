const ANIMATION_DURATION = 300;
let interval: number | undefined;

export const createProgressBar = (color: string): HTMLElement => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = `.million-progress-bar {
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    height: 2px;
    background: ${color};
    z-index: 2147483647;
    transition:
      width ${ANIMATION_DURATION}ms ease-out,
      opacity ${ANIMATION_DURATION / 2}ms ${ANIMATION_DURATION / 2}ms ease-in;
    transform: translate3d(0, 0, 0);
  }`;
  document.head.insertBefore(style, document.head.firstChild);

  const el = document.createElement('div');
  el.className = 'million-progress-bar';

  return el;
};

export const startTrickle = (el: HTMLElement): void => {
  const htmlEl = document.documentElement;
  let value = 0;
  el.style.width = '0';
  el.style.opacity = '1';
  htmlEl.insertBefore(el, document.body);
  interval = window.setInterval(() => {
    requestAnimationFrame(() => {
      value += Math.random() / 100;
      el.style.width = `${10 + value * 90}%`;
    });
  }, ANIMATION_DURATION);
};

export const stopTrickle = (el: HTMLElement): void => {
  const htmlEl = document.documentElement;
  clearInterval(interval);
  interval = undefined;
  el.style.width = '100%';
  el.style.opacity = '0';
  setTimeout(() => {
    if (htmlEl.contains(el)) {
      htmlEl.removeChild(el);
    }
  }, ANIMATION_DURATION * 1.5);
};
