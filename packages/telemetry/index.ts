import { randomBytes } from 'node:crypto';
import {
  cyan,
} from 'kleur/colors';
import { isCI } from './utils/is-ci';
import { GlobalConfig } from './config';
import { post } from './post';
import { getProjectInfo, type ProjectInfo } from './project-info';
import { getSystemInfo, type SystemInfo } from './system-info';

export interface TelemetryEvent {
  event: string;
  payload: Record<string, any>;
}

export class MillionTelemetry {
  private _anonymousSessionId: string | undefined;
  private _anonymousProjectInfo: ProjectInfo | undefined;
  private config = new GlobalConfig({ name: 'million' });
  private isCI = isCI;
  private alreadyShowedImprovement = false;

  constructor(private TELEMETRY_DISABLED = false) {
    this.TELEMETRY_DISABLED = TELEMETRY_DISABLED;
  }

  private getConfigWithFallback<T>(key: string, getValue: () => T): T {
    const currentValue = this.config.get(key);
    if (currentValue !== undefined) {
      return currentValue;
    }
    const newValue = getValue();
    this.config.set(key, newValue);
    return newValue;
  }

  private get enabled(): boolean {
    return this.getConfigWithFallback('telemetry_enabled', () => true);
  }

  private get anonymousId(): string {
    return this.getConfigWithFallback('telemetry_anonymousId', () =>
      randomBytes(16).toString('hex'),
    );
  }

  get anonymousSessionId(): string {
    this._anonymousSessionId =
      this._anonymousSessionId || randomBytes(16).toString('hex');
    return this._anonymousSessionId;
  }

  private get anonymousProjectInfo(): ProjectInfo {
    this._anonymousProjectInfo =
      this._anonymousProjectInfo || getProjectInfo(this.isCI);
    return this._anonymousProjectInfo;
  }

  private get isDisabled(): boolean {
    if (this.TELEMETRY_DISABLED) {
      return true;
    }
    return !this.enabled;
  }

  setEnabled(value: boolean): void {
    this.config.set('telemetry_enabled', value);
  }

  clear(): void {
    this.config.clear();
  }

  showWrapped() {
    if (this.alreadyShowedImprovement) return;
    this.alreadyShowedImprovement = true;
    // eslint-disable-next-line no-console
    console.log(
      `    - Wrapped: ${cyan(
        `https://telemetry.million.dev/wrapped/${this.anonymousSessionId}`,
      )}`
    );
  }


  record({ event, payload }: TelemetryEvent): Promise<void> {
    if (this.isDisabled) {
      return Promise.resolve();
    }

    const meta: { system: SystemInfo; project: ProjectInfo } = {
      system: getSystemInfo(),
      project: this.anonymousProjectInfo,
    };

    if (event === 'improvement') {
      this.showWrapped();
    }

    return post({
      event,
      anonymousId: meta.system.isCI
        ? this.anonymousId
        : `CI.${meta.system.ciName || 'UNKNOWN'}`,
      anonymousSessionId: this.anonymousSessionId,
      payload,
      meta,
    });
  }
}
