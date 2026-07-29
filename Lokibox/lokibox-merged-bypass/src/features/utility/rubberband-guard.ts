import { FeatureManager } from '../manager';
import { Feature, FeatureBase, type FeatureContext } from '../registry';
import { props } from '../schema';
import { ToastManager } from 'src/utils/toast';

type Sample = {
  time: number;
  x: number;
  y: number;
  z: number;
};

const RISKY_FEATURES = [
  'blink',
  'fake-lag',
  'fly',
  'jet-pack',
  'click-tp',
  'circle-strafe',
  'void-hook',
];

@Feature({
  id: 'rubberband-guard',
  displayName: 'RubberbandGuard',
  folderId: 'utility',
})
export class RubberbandGuardFeature extends FeatureBase<RubberbandGuardFeature> {
  defaultEnabled = true;

  schema = {
    windowMs: props.number('Detection Window (ms)', {
      default: 1200,
      min: 300,
      max: 5000,
      step: 50,
    }),
    excursionDistance: props.number('Excursion Distance', {
      default: 6,
      min: 1,
      max: 50,
      step: 0.5,
    }),
    snapbackDistance: props.number('Snapback Distance', {
      default: 1.4,
      min: 0.2,
      max: 10,
      step: 0.1,
    }),
    cooldownMs: props.number('Cooldown (ms)', {
      default: 2500,
      min: 500,
      max: 15000,
      step: 100,
    }),
    autoPause: props.boolean('Auto Pause Risky Features', true),
  };

  private samples: Sample[] = [];
  private lastTriggerAt = 0;

  onEnable(): void {
    this.samples = [];
    this.lastTriggerAt = 0;
  }

  onDisable(): void {
    this.samples = [];
  }

  onTick(ctx: FeatureContext<RubberbandGuardFeature>): void {
    const self = ctx.core.bodies.getSelfBody();
    if (!self) return;

    const now = Date.now();
    const position = self.position;
    this.samples.push({
      time: now,
      x: position.x,
      y: position.y,
      z: position.z,
    });

    const cutoff = now - ctx.props.windowMs;
    while (this.samples[0]?.time < cutoff) this.samples.shift();
    if (this.samples.length < 6) return;

    const origin = this.samples[0];
    const latest = this.samples[this.samples.length - 1];
    const backDistance = this.distance(latest, origin);
    if (backDistance > ctx.props.snapbackDistance) return;

    let maxExcursion = 0;
    for (const sample of this.samples) {
      maxExcursion = Math.max(maxExcursion, this.distance(sample, origin));
    }
    if (maxExcursion < ctx.props.excursionDistance) return;
    if (now - this.lastTriggerAt < ctx.props.cooldownMs) return;

    this.lastTriggerAt = now;
    this.samples = [];

    const paused = ctx.props.autoPause ? this.pauseRiskyFeatures() : [];
    const suffix =
      paused.length > 0 ? ` Paused: ${paused.join(', ')}.` : '';
    ToastManager.getInstance().show(
      `Server snapback detected (${maxExcursion.toFixed(1)}m).${suffix}`,
      'error',
      5000
    );
  }

  private pauseRiskyFeatures(): string[] {
    const manager = FeatureManager.getInstance();
    const paused: string[] = [];

    for (const id of RISKY_FEATURES) {
      const feature = manager.getFeatureById(id);
      if (!feature?.enabled) continue;
      feature.disable();
      paused.push(feature.meta.displayName);
    }
    return paused;
  }

  private distance(a: Sample, b: Sample): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
