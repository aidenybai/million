import { NextResponse } from 'next/server';
// import { withLocales } from 'nextra/locales';

// export const middleware = (request: NextRequest) => {
//   const newRequestObject = {
//     ...request,
//     url: new URL('/docs', request.url),
//   };

//   return withLocales((request: NextRequest) => {
//     return NextResponse.rewrite(new URL('/docs', request.url));
//   })(newRequestObject);
// };

// // This function can be marked `async` if using `await` inside

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/docs/:path*',
// };

import { locales } from 'nextra/locales';

export const middleware = (request) => {
  const { nextUrl } = request;

  if (nextUrl.pathname.startsWith('/ai')) {
    // The middleware must not handle dynamic routes.
    return;
  }

  return locales(request);
};
