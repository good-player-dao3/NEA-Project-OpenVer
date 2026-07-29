<script lang="ts">
  import { LokiAPI } from 'src/api/api';
  import LoaderCircle from 'lucide-svelte/icons/loader-circle';
  import {
    validatePassword,
    validateUsername,
  } from './validate';
  import { emitAuthorized } from '../auth';
  import { createAuthForm } from './auth-form.svelte';

  type PanelState = 'login' | 'register';

  let state: PanelState = 'login';

  // ── 登录表单 ──────────────────────────────────────────

  const loginForm = createAuthForm([
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Username', validate: validateUsername },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Password', validate: validatePassword },
  ]);

  loginForm.bindSubmit(async values => {
    const api = LokiAPI.getInstance();
    await api.login(values.username, values.password);
    emitAuthorized();
  });

  // ── 注册表单 ──────────────────────────────────────────

  const registerForm = createAuthForm([
    { key: 'username', label: 'Username', type: 'text',     placeholder: 'Username', validate: validateUsername },
    { key: 'password', label: 'Password',   type: 'password', placeholder: 'Password',   validate: validatePassword },
  ]);

  registerForm.bindSubmit(async values => {
    const api = LokiAPI.getInstance();
    await api.register(values.username, values.password);
    emitAuthorized();
  });
</script>

<div class="auth-panel">
  <!-- 标题行：左边标题，右边切换链接 -->
  <div class="header">
    <span class="title">{state === 'login' ? 'Login' : 'Register'} Loki ID</span>
    <span class="switch">
      {#if state === 'login'}
        No account? <button class="link" on:click={() => state = 'register'}>Register</button>
      {:else}
        Already have one? <button class="link" on:click={() => state = 'login'}>Login</button>
      {/if}
    </span>
  </div>

  <div class="body">
    {#if state === 'login'}
      <form class="form" on:submit|preventDefault={loginForm.handleSubmit}>
        {#each loginForm.fields as field}
          <div class="field">
            <label class="label" for="login-{field.key}">{field.label}</label>
            <input
              id="login-{field.key}"
              type={field.type}
              placeholder={field.placeholder}
              bind:value={loginForm.values[field.key]}
              class:error={!!loginForm.errors[field.key]}
            />
            {#if loginForm.errors[field.key]}
              <p class="error">{loginForm.errors[field.key]}</p>
            {/if}
          </div>
        {/each}
        <button type="submit" class="operator" disabled={loginForm.loading}>
          {#if loginForm.loading}<LoaderCircle class="spinner" size={18} />{/if}
          Login
        </button>
        {#if loginForm.serverError}
          <p class="error">{loginForm.serverError}</p>
        {/if}
      </form>
    {:else}
      <form class="form" on:submit|preventDefault={registerForm.handleSubmit}>
        {#each registerForm.fields as field}
          <div class="field">
            <label class="label" for="reg-{field.key}">{field.label}</label>
            <input
              id="reg-{field.key}"
              type={field.type}
              placeholder={field.placeholder}
              bind:value={registerForm.values[field.key]}
              class:error={!!registerForm.errors[field.key]}
            />
            {#if registerForm.errors[field.key]}
              <p class="error">{registerForm.errors[field.key]}</p>
            {/if}
          </div>
        {/each}
        <button type="submit" class="operator" disabled={registerForm.loading}>
          {#if registerForm.loading}<LoaderCircle class="spinner" size={18} />{/if}
          Register
        </button>
        {#if registerForm.serverError}
          <p class="error">{registerForm.serverError}</p>
        {/if}
      </form>
    {/if}
  </div>
</div>

<style>
  .auth-panel {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 280px;
    background-color: #222;
    border: 1px solid #fff1;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    color: #fff;
  }

  /* ── Header ──────────────────────────────────────── */

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 16px 16px 0 16px;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .switch {
    font-size: 11px;
    color: #999;
  }

  button.link {
    background: none;
    border: none;
    color: #8ab4f8;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
  }

  button.link:hover {
    text-decoration: underline;
  }

  /* ── Body ────────────────────────────────────────── */

  .body {
    max-height: 80vh;
    overflow-y: auto;
  }

  .form {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 11px;
    color: #aaa;
  }

  input {
    width: 100%;
    height: 32px;
    background-color: #1a1a1a;
    color: #fff;
    border-radius: 6px;
    border: 1px solid #444;
    padding: 0 10px;
    font-size: 12px;
    box-sizing: border-box;
  }

  input:focus {
    border-color: #8ab4f8;
    outline: none;
  }

  input.error {
    border-color: #c44;
  }

  .operator {
    width: 100%;
    height: 34px;
    border-radius: 6px;
    border: none;
    background-color: #fff;
    color: #222;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
  }

  .operator:hover {
    background-color: #eee;
  }

  .operator:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  p.error {
    color: #c44;
    font-size: 11px;
    margin: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
  }
</style>
