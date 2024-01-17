import { fetch } from 'undici';

const MILLION_TELEMETRY_ENDPOINT =
  'https://telemetry.million.dev/api/v1/record';

export const post = (body: Record<string, any>): Promise<any> => {
  return fetch(MILLION_TELEMETRY_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ body }),
    headers: { 'content-type': 'application/json' },
  });
}
