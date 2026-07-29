import type { AuthError } from 'src/api/schema';

type ValidationFn = (value: string) => string | null;

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  validate: ValidationFn;
}

/**
 * 创建共享的 auth 表单状态管理。
 *
 * 封装校验、loading、服务器错误处理，
 * Login 和 Register 复用此逻辑以减少重复代码。
 *
 * 注意：此文件为 .svelte.ts，使用 $state rune 确保 Svelte 5 响应式。
 */
export function createAuthForm(fields: FormField[]) {
  let values = $state(
    Object.fromEntries(fields.map(f => [f.key, ''])) as Record<string, string>,
  );
  let errors = $state(
    Object.fromEntries(fields.map(f => [f.key, null])) as Record<
      string,
      string | null
    >,
  );
  let serverError = $state<string | null>(null);
  let loading = $state(false);

  let onSubmit: (values: Record<string, string>) => Promise<void>;

  function validateAll(): boolean {
    let valid = true;
    for (const field of fields) {
      const err = field.validate(values[field.key]);
      errors[field.key] = err;
      if (err) valid = false;
    }
    return valid;
  }

  async function handleSubmit() {
    serverError = null;

    if (!validateAll()) return;

    loading = true;
    try {
      await onSubmit(values);
      serverError = null;
    } catch (e) {
      if (e instanceof Error && (e as AuthError).type) {
        serverError = e.message;
      } else {
        serverError = 'Unknown error, please try again';
      }
    } finally {
      loading = false;
    }
  }

  return {
    /** 字段定义 */
    fields,
    /** 表单字段值 (reactive $state) */
    get values() {
      return values;
    },
    /** 字段校验错误 (reactive $state) */
    get errors() {
      return errors;
    },
    /** 服务端错误 (reactive $state) */
    get serverError() {
      return serverError;
    },
    /** 提交中 (reactive $state) */
    get loading() {
      return loading;
    },
    /**
     * 绑定提交回调。
     * 回调在校验通过后执行，应返回 Promise。
     */
    bindSubmit(fn: typeof onSubmit) {
      onSubmit = fn;
    },
    handleSubmit,
  };
}
