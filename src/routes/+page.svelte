<script lang="ts">
  import { Camera, LayoutGrid, List, Search, SlidersHorizontal, X, Plus, Leaf } from 'lucide-svelte';
  import PlantCard from '$lib/components/PlantCard.svelte';
  import PlantList from '$lib/components/PlantList.svelte';
  import type { Plant } from '$lib/types';

  let { data } = $props();

  let view = $state<'grid' | 'list'>('grid');
  let search = $state('');
  let statusFilter = $state('');
  let locationFilter = $state('');
  let sortField = $state('added_at');
  let sortOrder = $state('desc');
  let showFilters = $state(false);
  let isCapturing = $state(false);
  let captureInput: HTMLInputElement;

  type PlantRow = Plant & { main_photo_url?: string };

  const plants = $derived<PlantRow[]>(data.plants ?? []);

  const locations = $derived([...new Set(plants.map((p) => p.location).filter(Boolean) as string[])]);

  const filtered = $derived(
    plants
      .filter((p) => {
        if (statusFilter && p.status !== statusFilter) return false;
        if (locationFilter && p.location !== locationFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const hay = [p.nickname, p.location, p.species_id, ...p.tags].filter(Boolean).join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const av = ((a as Record<string, unknown>)[sortField] as string) ?? '';
        const bv = ((b as Record<string, unknown>)[sortField] as string) ?? '';
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortOrder === 'asc' ? cmp : -cmp;
      })
  );

  const newCount = $derived(plants.filter((p) => p.status === 'new').length);
  const alertCount = $derived(plants.filter((p) => p.status === 'alert').length);

  async function handleQuickSnap(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    isCapturing = true;
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch('/api/plants', { method: 'POST', body: fd });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      isCapturing = false;
      input.value = '';
    }
  }

  function clearFilters() {
    search = '';
    statusFilter = '';
    locationFilter = '';
  }

  const hasActiveFilters = $derived(!!(search || statusFilter || locationFilter));
</script>

<svelte:head>
  <title>Ma Collection – Plantz</title>
</svelte:head>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-3 bg-surface-1/50 backdrop-blur sticky top-0 z-10">
    <!-- Search -->
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <input
        type="search"
        placeholder="Rechercher..."
        bind:value={search}
        class="input pl-9 h-9 text-sm"
      />
    </div>

    <!-- Filter toggle -->
    <button
      onclick={() => (showFilters = !showFilters)}
      class={['btn', showFilters || hasActiveFilters ? 'btn-primary' : 'btn-ghost', 'h-9 px-3'].join(' ')}
      aria-label="Filtres"
    >
      <SlidersHorizontal class="w-4 h-4" />
      {#if hasActiveFilters}
        <span class="text-xs">{[statusFilter, locationFilter, search].filter(Boolean).length}</span>
      {/if}
    </button>

    <!-- View toggle -->
    <div class="flex rounded-lg border border-surface-3 overflow-hidden">
      <button
        onclick={() => (view = 'grid')}
        class={['px-3 py-2 transition-colors', view === 'grid' ? 'bg-surface-3 text-gray-100' : 'text-gray-500 hover:text-gray-300'].join(' ')}
        aria-label="Vue grille"
      >
        <LayoutGrid class="w-4 h-4" />
      </button>
      <button
        onclick={() => (view = 'list')}
        class={['px-3 py-2 transition-colors', view === 'list' ? 'bg-surface-3 text-gray-100' : 'text-gray-500 hover:text-gray-300'].join(' ')}
        aria-label="Vue liste"
      >
        <List class="w-4 h-4" />
      </button>
    </div>

    <!-- Add plant -->
    <a href="/plants/new" class="btn btn-primary h-9 px-3 hidden sm:inline-flex">
      <Plus class="w-4 h-4" />
      <span class="hidden md:inline">Ajouter</span>
    </a>
  </div>

  <!-- Filter bar -->
  {#if showFilters}
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-surface-3 bg-surface-1/30">
      <select bind:value={statusFilter} class="select h-8 text-xs w-auto min-w-[120px]">
        <option value="">Tous les statuts</option>
        <option value="new">Nouvelle</option>
        <option value="ok">Saine</option>
        <option value="alert">En alerte</option>
        <option value="dormant">En dormance</option>
      </select>

      <select bind:value={locationFilter} class="select h-8 text-xs w-auto min-w-[120px]">
        <option value="">Tous les emplacements</option>
        {#each locations as loc}
          <option value={loc}>{loc}</option>
        {/each}
      </select>

      <select bind:value={sortField} class="select h-8 text-xs w-auto min-w-[120px]">
        <option value="added_at">Date d'ajout</option>
        <option value="nickname">Nom</option>
        <option value="status">Statut</option>
      </select>

      <button
        onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
        class="btn btn-ghost h-8 px-2 text-xs"
      >
        {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
      </button>

      {#if hasActiveFilters}
        <button onclick={clearFilters} class="btn btn-ghost h-8 px-2 text-xs text-accent-red">
          <X class="w-3 h-3" />
          Effacer
        </button>
      {/if}
    </div>
  {/if}

  <!-- Stats bar -->
  {#if plants.length > 0}
    <div class="flex items-center gap-4 px-4 py-2 text-xs text-gray-500 border-b border-surface-3/30">
      <span>{filtered.length} / {plants.length} plante{plants.length > 1 ? 's' : ''}</span>
      {#if newCount > 0}
        <span class="text-blue-400">{newCount} nouvelle{newCount > 1 ? 's' : ''}</span>
      {/if}
      {#if alertCount > 0}
        <span class="text-accent-red">{alertCount} en alerte</span>
      {/if}
    </div>
  {/if}

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-4">
    {#if plants.length === 0}
      <!-- Empty state -->
      <div class="flex flex-col items-center justify-center h-full gap-6 text-center py-20">
        <div class="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center">
          <Leaf class="w-10 h-10 text-surface-3" />
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-200 mb-2">Votre collection est vide</h2>
          <p class="text-gray-500 text-sm max-w-xs">
            Ajoutez votre première plante en prenant une photo ou en saisissant manuellement ses informations.
          </p>
        </div>
        <div class="flex gap-3">
          <label class="btn btn-primary cursor-pointer">
            <Camera class="w-4 h-4" />
            Photo rapide
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onchange={handleQuickSnap}
              disabled={isCapturing}
            />
          </label>
          <a href="/plants/new" class="btn btn-ghost">
            <Plus class="w-4 h-4" />
            Ajouter manuellement
          </a>
        </div>
      </div>
    {:else if view === 'grid'}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {#each filtered as plant (plant.id)}
          <PlantCard {plant} />
        {/each}
      </div>
      {#if filtered.length === 0}
        <div class="text-center text-gray-500 py-16">
          <p>Aucune plante ne correspond aux filtres actifs.</p>
          <button onclick={clearFilters} class="btn btn-ghost mt-3 text-sm">Effacer les filtres</button>
        </div>
      {/if}
    {:else}
      <div class="card">
        <PlantList plants={filtered} bind:sortField bind:sortOrder />
      </div>
    {/if}
  </div>
</div>

<!-- FAB – Quick Snap (mobile) -->
<div class="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
  <a
    href="/plants/new"
    class="w-12 h-12 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center text-gray-400 hover:text-gray-100 hover:bg-surface-3 transition-colors shadow-lg"
    aria-label="Ajouter manuellement"
  >
    <Plus class="w-5 h-5" />
  </a>
  <label
    class={['w-14 h-14 rounded-full bg-accent-green flex items-center justify-center shadow-lg shadow-accent-green/25 cursor-pointer transition-all', isCapturing ? 'opacity-70 animate-pulse' : 'hover:bg-accent-green-dim active:scale-95'].join(' ')}
    aria-label="Capture rapide"
  >
    <Camera class="w-6 h-6 text-black" />
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onchange={handleQuickSnap}
      disabled={isCapturing}
    />
  </label>
</div>
