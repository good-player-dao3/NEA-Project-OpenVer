export interface FeaturePropEntrySchema<T> {
  type: 'boolean' | 'number' | 'string' | 'select' | 'range';
  default: T;
  label: string;
}

export interface NumberSchema extends FeaturePropEntrySchema<number> {
  type: 'number';
  default: number;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface BooleanSchema extends FeaturePropEntrySchema<boolean> {
  type: 'boolean';
  default: boolean;
  label: string;
}

export interface RangeSchema
  extends FeaturePropEntrySchema<{ min: number; max: number }> {
  type: 'range';
  defaultMin: number;
  defaultMax: number;
  min: number;
  max: number;
  step: number;
  label: string;
}

export interface SelectSchema<K> extends FeaturePropEntrySchema<K> {
  type: 'select';
  default: K;
  label: string;
  options: SelectEntry<K>[];
}

export interface SelectEntry<K> {
  id: K;
  name: string;
}

/**
 * Schema
 */
export const props = {
  boolean(label: string, def: boolean): BooleanSchema {
    return {
      label,
      type: 'boolean',
      default: def,
    };
  },
  number(
    label: string,
    opt: {
      default: number;
      min?: number;
      max?: number;
      step?: number;
    }
  ): FeaturePropEntrySchema<number> {
    return {
      label,
      type: 'number',
      ...opt,
    };
  },
  select<T>(
    label: string,
    opt: { default: T; options: SelectEntry<T>[] }
  ): FeaturePropEntrySchema<T> {
    return {
      label,
      type: 'select',
      ...opt,
    };
  },
  range(
    label: string,
    opt: {
      defaultMin: number;
      defaultMax: number;
      min: number;
      max: number;
      step?: number;
    }
  ): RangeSchema {
    return {
      label,
      type: 'range',
      default: { min: opt.defaultMin, max: opt.defaultMax },
      defaultMin: opt.defaultMin,
      defaultMax: opt.defaultMax,
      min: opt.min,
      max: opt.max,
      step: opt.step ?? 1,
    };
  },
};

export type FeaturePropSchema = Record<string, FeaturePropEntrySchema<any>>;

export type PropsValues<T extends FeaturePropSchema> = {
  [K in keyof T]: T[K] extends FeaturePropEntrySchema<infer V> ? V : never;
};

export type PropsOf<T> = T extends { schema: infer S }
  ? PropsValues<S & FeaturePropSchema>
  : never;
