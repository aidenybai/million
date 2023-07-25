import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export const CarbonAds = () => {
  const router = useRouter();

  useEffect(() => {
    const isCarbonExist = document.querySelector('#carbonads');

    if (isCarbonExist) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (window as any)._carbonads.refresh();
      return;
    }

    const script = document.createElement('script');
    script.src =
      '//cdn.carbonads.com/carbon.js?serve=CEAI427W&placement=millionjsorg';
    script.id = '_carbonads_js';
    script.async = true;

    document.querySelectorAll('#carbon-container')[0].appendChild(script);
  }, [router.asPath]);

  return <div id="carbon-container" className="flex justify-center my-2"></div>;
};
