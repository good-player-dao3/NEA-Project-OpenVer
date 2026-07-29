<script lang="ts">
  import { onMount } from 'svelte';
  import Folder from './Folder.svelte';
  import { ConfigManager } from 'src/storage/config';
  import { ToastManager } from 'src/utils/toast';
  import Plus from 'lucide-svelte/icons/plus';
  import Save from 'lucide-svelte/icons/save';
  import Download from 'lucide-svelte/icons/download';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import '../entries/entry.css';

  const cm = ConfigManager.getInstance();
  const toast = ToastManager.getInstance();

  let profiles = $state<string[]>([]);
  let currentProfile = $state(cm.getCurrentProfile());
  let adding = $state(false);
  let newName = $state('');
  let dragOver = $state(false);
  let confirmDelete = $state<string | null>(null);

  onMount(() => {
    profiles = cm.getProfiles();
  });

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    cm.saveProfile(name);
    newName = '';
    adding = false;
    refresh();
  }

  function handleAddCancel() {
    newName = '';
    adding = false;
  }

  function handleLoad(name: string) {
    if (name === currentProfile) return;
    cm.loadProfile(name);
    refresh();
  }

  function handleExport(name: string) {
    const config = cm.exportConfig();
    config.profileName = name;
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.show(`"${name}" exported`, 'success');
  }

  function handleDeleteClick(e: Event, name: string) {
    e.stopPropagation();
    if (confirmDelete !== name) {
      confirmDelete = name;
      return;
    }
    cm.deleteProfile(name);
    confirmDelete = null;
    refresh();
  }

  function handleDrop(e: DragEvent) {
    dragOver = false;
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (!cm.validateConfig(data)) {
            toast.show(`"${file.name}" invalid config`, 'error');
            return;
          }
          const name = file.name.replace(/\.json$/, '');
          cm.saveProfile(name);
          refresh();
          toast.show(`"${name}" imported`, 'success');
        } catch {
          toast.show(`Failed to parse "${file.name}"`, 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  function refresh() {
    profiles = cm.getProfiles();
    currentProfile = cm.getCurrentProfile();
  }
</script>

<Folder id="config">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="config-inner"
    class:dragover={dragOver}
    role="region"
    ondragover={e => { e.preventDefault(); dragOver = true; }}
    ondragleave={() => { dragOver = false; }}
    ondrop={e => { e.preventDefault(); handleDrop(e); }}
  >
    {#if adding}
      <div class="entry add-row">
        <div class="add-input-wrap">
          <!-- svelte-ignore a11y_autofocus -->
          <input
            type="text"
            class="add-input"
            placeholder="Config name…"
            bind:value={newName}
            onkeydown={e => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') handleAddCancel();
            }}
            autofocus
          />
          <button type="button" class="add-submit" onclick={handleAdd}>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    {:else}
      <button type="button" class="entry" onclick={() => (adding = true)}>
        <Plus size={13} />
        <span style="margin-left: 6px;">Add Config</span>
      </button>
    {/if}

    {#if dragOver}
      <div class="drop-zone">Drop .json to import</div>
    {/if}

    {#if profiles.length === 0}
      <div class="entry" style="opacity: 0.4; cursor: default; justify-content: center;">
        No saved configs
      </div>
    {:else}
      {#each profiles as name}
        {@const active = name === currentProfile}
        <button type="button" class="entry" class:active onclick={() => handleLoad(name)}>
          <span class="profile-name">{name}</span>
          <span class="actions">
            <span
              class="action-btn save-btn"
              onclick={e => { e.stopPropagation(); cm.saveProfile(name); refresh(); }}
              role="button"
              tabindex="0"
              onkeydown={() => {}}
            >
              <Save size={12} />
            </span>
            <span
              class="action-btn export-btn"
              onclick={e => { e.stopPropagation(); handleExport(name); }}
              role="button"
              tabindex="0"
              onkeydown={() => {}}
            >
              <Download size={13} />
            </span>
            <span
              class="action-btn delete-btn"
              class:confirm={confirmDelete === name}
              onclick={e => handleDeleteClick(e, name)}
              role="button"
              tabindex="0"
              onkeydown={() => {}}
            >
              ✕
            </span>
          </span>
        </button>
      {/each}
    {/if}
  </div>
</Folder>

<style>
  .config-inner {
    display: flex;
    flex-direction: column;
    min-height: 40px;
  }

  .config-inner.dragover {
    background: rgba(255, 255, 255, 0.06);
  }

  /* ── Add row ────────────────────────────────── */

  .add-row {
    padding: 0 10px;
    background-color: var(--bg-default);
  }

  .add-input-wrap {
    display: flex;
    align-items: center;
    flex: 1;
    height: 28px;
    background: #1a1a1a;
    border: 1px solid #444;
    border-radius: 3px;
    overflow: hidden;
  }

  .add-input-wrap:focus-within {
    border-color: var(--accent);
  }

  .add-input {
    flex: 1;
    height: 100%;
    padding: 0 8px;
    background: transparent;
    border: none;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    outline: none;
  }

  .add-input::placeholder {
    opacity: 0.4;
  }

  .add-submit {
    flex-shrink: 0;
    width: 28px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-default);
    opacity: 0.5;
    cursor: pointer;
    transition: color 0.12s;
  }

  .add-submit:hover {
    color: #fff;
  }

  /* ── Drop zone ──────────────────────────────── */

  .drop-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    font-size: 11px;
    opacity: 0.5;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
  }

  /* ── Profile rows (Entry 风格) ─────────────── */

  .entry.active {
    background-color: var(--bg-active);
    color: var(--text-on-active);
  }

  .entry.active:hover {
    background-color: var(--bg-active-hover);
    color: var(--text-on-active);
  }

  .profile-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
  }

  .action-btn {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    border-radius: 2px;
    cursor: pointer;
    transition: opacity 0.12s;
  }

  .export-btn {
    opacity: 0.5;
  }

  .export-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
  }

  .save-btn {
    opacity: 0.4;
  }

  .save-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
  }

  .delete-btn {
    opacity: 0.4;
  }

  .delete-btn:hover {
    opacity: 1;
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }

  .delete-btn.confirm {
    opacity: 1;
    background: rgba(248, 113, 113, 0.25);
    color: #f87171;
  }
</style>
