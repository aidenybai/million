import { Callout } from 'nextra-theme-docs';

export function AutomaticModeWarning() {
  return (
    <div suppressHydrationWarning>
      {typeof window !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (window.localStorage as any).mode === '0' ? (
        <Callout type="warning">
          It looks like you're currently using Automatic mode. This means your
          code will be automatically optimized. You still may proceed, but note
          that it teaches the manual API.
        </Callout>
      ) : null}
    </div>
  );
}
