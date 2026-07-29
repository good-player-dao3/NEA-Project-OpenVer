<script lang="ts">
  import { type PropsValues } from 'src/features/schema';

  export let label: string;
  export let prop: PropsValues<any>;
  export let key: string;

  let value = prop[key] as boolean;

  function onChange() {
    prop[key] = value;
  }
</script>

<div class="ntop">
  {label}
  <label class="switch">
    <input type="checkbox" onchange={onChange} bind:checked={value} />
    <span class="slider round"></span>
  </label>
</div>

<style>
  .ntop {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  /* 开关 - 滑块周围的框 */
  .switch {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 12px;
  }

  /* 隐藏默认 HTML 复选框 */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* 滑块 */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #252525;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 10px;
    width: 10px;
    left: 1px;
    bottom: 1px;
    background-color: var(--bg-active);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: var(--accent);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--accent);
  }

  input:checked + .slider:before {
    transform: translateX(18px);
    background-color: var(--bg-default);
  }

  /* 圆角滑块 */
  .slider.round {
    border-radius: 12px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
