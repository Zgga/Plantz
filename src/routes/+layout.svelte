<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { Leaf, BookOpen, Settings, Menu, X, Sun, Moon } from 'lucide-svelte';

  let sidebarOpen = $state(false);
  let darkMode = $state(true);

  function toggleDark() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
  }

  const navItems = [
    { href: '/', label: 'Ma Collection', icon: Leaf },
    { href: '/library', label: 'Bibliothèque', icon: BookOpen },
    { href: '/settings', label: 'Paramètres', icon: Settings }
  ];

  let { children } = $props();
</script>

<div class="flex h-dvh overflow-hidden bg-surface text-gray-100">
  <!-- Sidebar overlay on mobile -->
  {#if sidebarOpen}
    <button
      class="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
      onclick={() => (sidebarOpen = false)}
      aria-label="Fermer le menu"
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside
    class={[
      'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-surface-1 border-r border-surface-3 transition-transform duration-200 lg:relative lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ].join(' ')}
  >
    <div class="flex items-center gap-2 px-5 py-4 border-b border-surface-3">
      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-green/20">
        <Leaf class="w-4 h-4 text-accent-green" />
      </div>
      <span class="text-lg font-semibold tracking-tight">Plantz</span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
      {#each navItems as item}
        {@const isActive = $page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/')}
        {@const NavIcon = item.icon}
        <a
          href={item.href}
          class={[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-accent-green/15 text-accent-green'
              : 'text-gray-400 hover:bg-surface-3 hover:text-gray-100'
          ].join(' ')}
          onclick={() => (sidebarOpen = false)}
        >
          <NavIcon class="w-4 h-4 flex-shrink-0" />
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="px-4 py-3 border-t border-surface-3">
      <button
        onclick={toggleDark}
        aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
      >
        {#if darkMode}
          <Sun class="w-4 h-4" />
          <span>Mode clair</span>
        {:else}
          <Moon class="w-4 h-4" />
          <span>Mode sombre</span>
        {/if}
      </button>
    </div>
  </aside>

  <!-- Main area -->
  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <header class="flex items-center gap-3 px-4 py-3 border-b border-surface-3 bg-surface-1 lg:hidden">
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="p-1.5 rounded-lg text-gray-400 hover:bg-surface-3 hover:text-gray-100 transition-colors"
        aria-label="Menu"
      >
        {#if sidebarOpen}
          <X class="w-5 h-5" />
        {:else}
          <Menu class="w-5 h-5" />
        {/if}
      </button>
      <div class="flex items-center gap-2">
        <Leaf class="w-4 h-4 text-accent-green" />
        <span class="font-semibold">Plantz</span>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto scrollbar-thin">
      {@render children()}
    </main>
  </div>
</div>
