<script lang="ts">
  import { Search, BookOpen, Leaf, Droplets, Sun, Wind, Plus } from 'lucide-svelte';
  import { getLightLabel, getWaterLabel, getHumidityLabel, PLANT_CATEGORIES, getCategoryLabel } from '$lib/utils';

  let { data } = $props();
  let search = $state('');
  let categoryFilter = $state('');

  const usedCategories = $derived(
    PLANT_CATEGORIES.filter((cat) => data.library.some((s) => s.categories?.includes(cat.value)))
  );

  const filtered = $derived(
    data.library.filter((s) => {
      if (categoryFilter && !s.categories?.includes(categoryFilter)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return [s.id, s.genus, s.species, s.cultivar, ...s.common_names]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    })
  );

  const lightColors: Record<string, string> = {
    'low': 'text-gray-400',
    'medium': 'text-yellow-400',
    'bright-indirect': 'text-accent-amber',
    'direct-sun': 'text-orange-400'
  };
</script>

<svelte:head>
  <title>Bibliothèque – Plantz</title>
</svelte:head>

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-3 bg-surface-1/50 sticky top-0 z-10">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <input type="search" bind:value={search} placeholder="Rechercher une espèce..." class="input pl-9 h-9 text-sm" />
    </div>
    <span class="text-xs text-gray-500">{filtered.length} espèce{filtered.length > 1 ? 's' : ''}</span>
    <a href="/library/new" class="btn btn-primary h-9 px-3 text-xs">
      <Plus class="w-4 h-4" />
      Ajouter
    </a>
  </div>

  <!-- Category chips -->
  {#if usedCategories.length > 0}
    <div class="flex gap-2 px-4 py-2 border-b border-surface-3/50 overflow-x-auto scrollbar-none">
      <button
        onclick={() => (categoryFilter = '')}
        class={['px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors flex-shrink-0', !categoryFilter ? 'border-accent-green bg-accent-green/15 text-accent-green font-medium' : 'border-surface-3 text-gray-400 hover:border-gray-500'].join(' ')}
      >
        Tout
      </button>
      {#each usedCategories as cat (cat.value)}
        <button
          onclick={() => (categoryFilter = categoryFilter === cat.value ? '' : cat.value)}
          class={['px-3 py-1 rounded-full text-xs border whitespace-nowrap transition-colors flex-shrink-0', categoryFilter === cat.value ? 'border-accent-green bg-accent-green/15 text-accent-green font-medium' : 'border-surface-3 text-gray-400 hover:border-gray-500'].join(' ')}
        >
          {cat.label}
        </button>
      {/each}
    </div>
  {/if}

  <div class="flex-1 overflow-y-auto p-4">
    {#if filtered.length === 0}
      <div class="text-center text-gray-600 py-16">
        <BookOpen class="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Aucune espèce trouvée.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filtered as species (species.id)}
          <a href="/library/{species.id}" class="card p-4 space-y-3 hover:border-accent-green/30 transition-colors block">
            <div>
              {#if species.common_names.length > 0}
                <h3 class="font-semibold text-gray-100">{species.common_names[0]}</h3>
                <p class="text-xs text-gray-400 italic mt-0.5">
                  {species.genus}
                  {#if species.cultivar}
                    <span class="not-italic text-accent-green">'{species.cultivar}'</span>
                  {:else}
                    {species.species}
                  {/if}
                </p>
              {:else}
                <h3 class="font-semibold text-gray-100 italic">
                  {species.genus}
                  {#if species.cultivar}
                    <span class="not-italic text-accent-green">'{species.cultivar}'</span>
                  {:else}
                    {species.species}
                  {/if}
                </h3>
              {/if}
              <p class="text-xs text-gray-600 mt-0.5">{species.family}{species.origin ? ` · ${species.origin}` : ''}</p>
            </div>

            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="flex flex-col items-center gap-1 bg-surface-2 rounded-lg p-2 text-center">
                <Sun class="w-4 h-4 {lightColors[species.care_tips.light] ?? 'text-gray-400'}" />
                <span class="text-gray-500 leading-tight">{species.care_tips.light.replace('-', '​')}</span>
              </div>
              <div class="flex flex-col items-center gap-1 bg-surface-2 rounded-lg p-2 text-center">
                <Droplets class="w-4 h-4 text-blue-400" />
                <span class="text-gray-500 leading-tight line-clamp-2">{species.care_tips.water.replace(/-/g, ' ')}</span>
              </div>
              <div class="flex flex-col items-center gap-1 bg-surface-2 rounded-lg p-2 text-center">
                <Wind class="w-4 h-4 text-cyan-400" />
                <span class="text-gray-500">{species.care_tips.humidity}</span>
              </div>
            </div>

            {#if species.care_tips.temperature_min_celsius !== undefined}
              <p class="text-xs text-gray-500">
                Température : {species.care_tips.temperature_min_celsius}°C – {species.care_tips.temperature_max_celsius}°C
              </p>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
