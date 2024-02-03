import { fetch } from 'undici';

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
  }
  catch (error) { 
    //
  }
}
