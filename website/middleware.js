import { locales } from 'nextra/locales';

export const middleware = (request) => {
  const { nextUrl } = request;

  // The middleware must not handle dynamic routes.
  // if (nextUrl.pathname.startsWith('/ai')) {
  //   return;
  // }

  return locales(request);
};
