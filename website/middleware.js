import { locales } from 'nextra/locales';
import {  NextResponse } from 'next/server';

export const middleware = (request) => {
//   const { nextUrl } = request;

  // The middleware must not handle dynamic routes.
  if (nextUrl.pathname.startsWith('/ai')) {
    return;
  }

// return locales(request)
};

