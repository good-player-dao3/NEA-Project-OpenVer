<script lang="ts">
  import { onMount } from 'svelte';
  import { FriendManager } from 'src/friend/remote-friends';
  import { ToastManager } from 'src/utils/toast';
  import { LokiAPI } from 'src/api/api';
  import type { FriendInfo, FriendRequest, UserSearchResult } from 'src/api/schema';
  import Folder from './Folder.svelte';
  import X from 'lucide-svelte/icons/x';
  import Check from 'lucide-svelte/icons/check';
  import UserPlus from 'lucide-svelte/icons/user-plus';
  import Search from 'lucide-svelte/icons/search';
  import '../entries/entry.css';

  const fm = FriendManager.getInstance();
  const toast = ToastManager.getInstance();
  const api = LokiAPI.getInstance();

  let friends = $state<FriendInfo[]>([]);
  let requests = $state<FriendRequest[]>([]);
  let showRequests = $state(false);
  let query = $state('');
  let adding = $state<Set<string>>(new Set());
  let searchResults = $state<UserSearchResult[]>([]);
  let searching = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout>;

  function refresh() {
    friends = [...fm.getFriends()];
    requests = [...fm.getRequests()];
  }

  async function load() {
    await fm.fetch();
    refresh();
  }

  // ── 搜索：调 API，300ms 防抖 ──────────────────────

  function doSearch(keyword: string) {
    clearTimeout(debounceTimer);
    if (!keyword.trim()) {
      searchResults = [];
      return;
    }
    searching = true;
    debounceTimer = setTimeout(async () => {
      try {
        const resp = await api.searchUsers(keyword.trim());
        if (resp.code === 'OK') {
          const friendUsernames = new Set(friends.map(f => f.username));
          searchResults = resp.data.users.filter(
            u => !friendUsernames.has(u.username),
          );
        }
      } catch {
        searchResults = [];
      } finally {
        searching = false;
      }
    }, 300);
  }

  $effect(() => {
    void query;
    doSearch(query);
  });

  onMount(() => {
    load();
    fm.onChange(refresh);
    fm.onNewRequest(r => {
      toast.show(
        `${r.nickname} (@${r.username}) sent you a friend request`,
        'info',
        4000,
      );
    });
  });

  // ── 操作 ──────────────────────────────────────────

  async function doAccept(requesterUsername: string) {
    await fm.acceptRequest(requesterUsername);
    const req = requests.find(r => r.username === requesterUsername);
    toast.show(
      req ? `Accepted ${req.nickname}'s friend request` : 'Friend request accepted',
      'success',
    );
  }

  async function doReject(requesterUsername: string) {
    const req = requests.find(r => r.username === requesterUsername);
    await fm.rejectRequest(requesterUsername);
    toast.show(
      req ? `Rejected ${req.nickname}'s friend request` : 'Friend request rejected',
      'info',
    );
  }

  async function doRemove(targetUsername: string, e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const f = friends.find(fr => fr.username === targetUsername);
    await fm.removeFriend(targetUsername);
    toast.show(`Removed ${f?.nickname ?? targetUsername}`, 'info');
  }

  async function doSendRequest(targetUsername: string, nickname: string) {
    if (adding.has(targetUsername)) return;
    adding = new Set(adding).add(targetUsername);
    try {
      await fm.addFriend(targetUsername);
      toast.show(`Friend request sent to ${nickname}`, 'success');
    } finally {
      const next = new Set(adding);
      next.delete(targetUsername);
      adding = next;
    }
  }

  function toggleRequests() {
    showRequests = !showRequests;
    if (showRequests) {
      fm.fetchRequests();
    }
  }
</script>

<Folder id="friend">
  <!-- ── 搜索栏 + 申请按钮 ──────────────────────────── -->
  <div class="entry toolbar">
    <div class="search-box">
      <Search size={13} class="search-icon" />
      <input
        type="text"
        class="search-input"
        placeholder="Search players…"
        bind:value={query}
      />
      {#if query}
        <button class="search-clear" onclick={() => (query = '')}>
          <X size={12} />
        </button>
      {/if}
    </div>
    <button
      class="ghost-btn"
      class:has-pending={requests.length > 0}
      onclick={toggleRequests}
    >
      <UserPlus size={14} />
      {#if requests.length > 0}
        <span class="badge">{requests.length}</span>
      {/if}
    </button>
  </div>

  <!-- ── 好友申请面板 ──────────────────────────────── -->
  {#if showRequests}
    {#each requests as r (r.username)}
      <div class="entry request-item">
        <span class="item-name">{r.nickname}</span>
        <span class="item-meta">@{r.username}</span>
        <button
          class="action-btn accept"
          onclick={() => doAccept(r.username)}
        >
          <Check size={13} />
        </button>
        <button
          class="action-btn reject"
          onclick={() => doReject(r.username)}
        >
          <X size={13} />
        </button>
      </div>
    {:else}
      <div class="entry empty-hint">No pending requests</div>
    {/each}
    <div class="section-divider"></div>
  {/if}

  <!-- ── 搜索结果 ──────────────────────────────────── -->
  {#if query}
    {#if searching}
      <div class="entry empty-hint">Searching…</div>
    {:else if searchResults.length > 0}
      {#each searchResults as u (u.username)}
        <div class="entry search-item">
          <span class="item-name">{u.nickname}</span>
          <span class="item-meta">@{u.username}</span>
          <button
            class="action-btn add"
            disabled={adding.has(u.username)}
            onclick={() => doSendRequest(u.username, u.nickname)}
          >
            <UserPlus size={13} />
          </button>
        </div>
      {/each}
    {:else}
      <div class="entry empty-hint">No players found</div>
    {/if}
    <div class="section-divider"></div>
  {/if}

  <!-- ── 好友列表 ──────────────────────────────────── -->
  {#each friends as f (f.username)}
    <div class="entry friend-entry">
      <span class="item-name">{f.nickname}</span>
      <span class="item-meta">@{f.username}</span>
      <button class="action-btn remove" onclick={e => doRemove(f.username, e)}>
        <X size={12} />
      </button>
    </div>
  {:else}
    <div class="entry empty-hint">No friends added</div>
  {/each}
</Folder>

<style>
  /* ── 工具栏 ────────────────────────────────────── */

  .toolbar {
    gap: 6px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 8px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
  }

  .search-box:focus-within {
    border-color: #555;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 12px;
    font-family: 'Poppins', sans-serif;
  }

  .search-input::placeholder {
    color: var(--text-default);
    opacity: 0.4;
  }

  .search-clear {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--text-default);
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s;
  }

  .search-clear:hover {
    opacity: 1;
  }

  /* ── Ghost 按钮 ────────────────────────────────── */

  .ghost-btn {
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 26px;
    padding: 0;
    background: transparent;
    border: 1px solid #333;
    border-radius: 6px;
    color: var(--text-default);
    opacity: 0.5;
    cursor: pointer;
    transition: opacity 0.15s, border-color 0.15s;
  }

  .ghost-btn:hover {
    opacity: 0.75;
    border-color: #555;
  }

  .ghost-btn.has-pending {
    color: #8ab4f8;
    border-color: #8ab4f855;
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 14px;
    padding: 0 4px;
    border-radius: 7px;
    background: #8ab4f8;
    color: #111;
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
  }

  /* ── 条目通用 ──────────────────────────────────── */

  .item-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .item-meta {
    flex-shrink: 0;
    font-size: 11px;
    opacity: 0.5;
  }

  /* ── 请求项 ────────────────────────────────────── */

  .request-item {
    gap: 4px;
    padding-left: 10px;
  }

  /* ── 搜索结果 ──────────────────────────────────── */

  .search-item {
    gap: 4px;
    padding-left: 10px;
  }

  /* ── 好友项 ────────────────────────────────────── */

  .friend-entry {
    gap: 8px;
  }

  .friend-entry:hover .action-btn.remove {
    opacity: 0.6;
  }

  /* ── 操作按钮 ──────────────────────────────────── */

  .action-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s, color 0.15s;
  }

  .search-item:hover .action-btn,
  .request-item .action-btn {
    opacity: 0.55;
  }

  .action-btn:hover {
    opacity: 1 !important;
  }

  .action-btn.accept:hover {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  .action-btn.reject:hover {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }

  .action-btn.add:hover {
    background: rgba(138, 180, 248, 0.2);
    color: #8ab4f8;
  }

  .action-btn.add:disabled {
    opacity: 0.3 !important;
    cursor: not-allowed;
  }

  .action-btn.remove:hover {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }

  /* ── 通用 ──────────────────────────────────────── */

  .section-divider {
    height: 1px;
    background: #fff1;
    margin: 4px 10px;
  }

  .empty-hint {
    justify-content: center;
    opacity: 0.4;
    cursor: default;
    height: 32px;
  }
</style>
