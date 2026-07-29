<script lang="ts">
  import { FolderStorageManager } from 'src/storage/folders';
  import { FolderManager } from 'src/folders/manager';
  import { FeatureManager } from 'src/features/manager';
  import Head from './Head.svelte';
  import './folder.css';

  let {
    id,
    title = '',
    width,
    class: className = '',
    children,
  }: {
    id: string;
    title?: string;
    width?: number;
    class?: string;
    children?: import('svelte').Snippet;
  } = $props();

  const HEAD_H = 40;
  const fm = FeatureManager.getInstance();
  const fpm = FolderStorageManager.getInstance();
  const fi = FolderManager.getInstance().getFolderById(id);

  let headVisible = $state(fm.getFeatureById('click-ui')?.enabled ?? false);

  function syncHead() {
    headVisible = fm.getFeatureById('click-ui')?.enabled ?? false;
  }

  // wrapper 位置 = folder 左上角，由 Head+draggable 管理
  let wrapperPos = $state(fpm.getPosition(id) ?? { x: 100, y: 100 });

  fi?.onPositionChange(pos => {
    wrapperPos = { x: pos.x, y: pos.y - HEAD_H };
  });

  // head 跟 ClickUI 同显隐 — 用定时轮询避免事件时序问题
  let syncTimer = setInterval(syncHead, 300);
</script>

<div
  data-folder-id={id}
  class="folder {className}"
  class:head-hidden={!headVisible}
  style:transform="translate({wrapperPos.x}px,{wrapperPos.y}px)"
  style:width={width != null ? width + 'px' : undefined}
>
  <Head {id} x0={wrapperPos.x} y0={wrapperPos.y}>
    {title}
  </Head>
  <div class="container">
    {@render children?.()}
  </div>
</div>

<style>
  .head-hidden :global(.head) {
    visibility: hidden;
    pointer-events: none;
  }
</style>
