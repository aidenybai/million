// The MIT License (MIT)

// Copyright (c) 2017 Sentry

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Taken from https://github.com/getsentry/sentry-wizard/blob/9c2009bd10497e288898ee826143d543e6e89e5f/src/telemetry.ts

import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
  runWithAsyncContext,
  startSpan,
} from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';

export async function withTelemetry<F>(
  options: {
    enabled: boolean;
    integration: string;
    name: string;
  },
  callback: () => F | Promise<F>,
): Promise<F> {
  const { sentryHub, sentryClient } = createSentryInstance(
    options.enabled,
    options.integration,
  );

  makeMain(sentryHub);

  const sentrySession = sentryHub.startSession();
  sentryHub.captureSession();

  try {
    return await startSpan(
      {
        name: options.name,
        status: 'ok',
        op: `${options.name}.flow`,
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      async () => runWithAsyncContext(callback),
    );
  } catch (e) {
    sentryHub.captureException('Error during execution.');
    sentrySession.status = 'crashed';
    throw e;
  } finally {
    sentryHub.endSession();
    await sentryClient.flush(3000);
  }
}

function createSentryInstance(enabled: boolean, integration: string) {
  const client = new NodeClient({
    dsn: 'https://de9a702cad37fec31ace27d9f3976818@o4505682763382784.ingest.sentry.io/4505886741954560',
    enabled,

    environment: `production-${integration}`,

    tracesSampleRate: 1,
    sampleRate: 1,

    integrations: [new Integrations.Http(), new CaptureConsole()],

    stackParser: defaultStackParser,

    beforeSendTransaction: (event) => {
      delete event.server_name; // Server name might contain PII
      return event;
    },

    beforeSend: (event) => {
      event.exception?.values?.forEach((exception) => {
        delete exception.stacktrace;
      });

      delete event.server_name; // Server name might contain PII
      return event;
    },

    transport: makeNodeTransport,

    debug: true,
  });

  const hub = new Hub(client);

  hub.setTag('integration', integration);
  hub.setTag('node', process.version);
  hub.setTag('platform', process.platform);

  return { sentryHub: hub, sentryClient: client };
}

export function traceStep<T>(step: string, callback: () => T): T {
  return startSpan({ name: step, op: 'automatic.step' }, () => callback());
}
