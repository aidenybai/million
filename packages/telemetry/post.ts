/* eslint-disable */
import { fetch } from 'undici';

if (
  !('markResourceTiming' in performance) ||
  typeof performance['markResourceTiming'] !== 'function'
) {
  performance['markResourceTiming'] = () => {};
}

const MILLION_TELEMETRY_ENDPOINT =
  'https://telemetry.million.dev/api/v1/record';

export const post = async (body: Record<string, any>): Promise<any> => {
  try {
    const response = await fetch(MILLION_TELEMETRY_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ body }),
      headers: { 'content-type': 'application/json' },
    });
    return response;
  } catch (error) {
    //
  }
};
