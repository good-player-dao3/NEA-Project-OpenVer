<script lang="ts">
  import { FeatureManager } from 'src/features/manager';

  const fm = FeatureManager.getInstance();

  let list = $state<string[]>([]);
  let sorted = $derived([...list].sort((a, b) => b.length - a.length || a.localeCompare(b)));

  fm.onEveryEnable(f => {
    if (f.base.showInCategoryList ?? true) {
      list = [...list, f.meta.displayName];
    }
  });
  fm.onEveryDisable(f => {
    list = list.filter(n => n !== f.meta.displayName);
  });

  $effect(() => {
    const init: string[] = [];
    for (const fi of fm.getAllFeatures()) {
      if (fi.enabled && (fi.base.showInCategoryList ?? true)) {
        init.push(fi.meta.displayName);
      }
    }
    list = init;
  });
</script>

<div class="category">
  {#each sorted as name, i (name)}
    <span class="tag" style="animation-delay: {i * 0.12}s">
      {name}
    </span>
  {/each}
</div>

<style>
  .category {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    padding: 8px 12px;
  }

  .tag {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.4px;
    white-space: nowrap;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));

    background: linear-gradient(
      90deg,
      #ffffff,
      #67e8f9,
      #c4b5fd,
      #fde68a,
      #ffffff
    );
    background-size: 300% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    animation: flow 4s linear infinite;
  }

  @keyframes flow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }
</style>
