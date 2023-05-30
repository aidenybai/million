import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    const detectDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          detectDarkMode();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    detectDarkMode();

    return () => {
      observer.disconnect();
    };
  }, []);

  return isDarkMode;
};
