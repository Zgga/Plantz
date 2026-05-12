<script lang="ts">
  import { Search, BookOpen, Leaf, Droplets, Sun, Wind, Plus } from 'lucide-svelte';
  import { getLightLabel, getWaterLabel, getHumidityLabel } from '$lib/utils';

  let { data } = $props();
  let search = $state('');

  const filtered = $derived(
    data.library.filter((s) => {
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
              <h3 class="font-semibold text-gray-100">
                {species.genus}
                {#if species.cultivar}
                  <span class="text-accent-green">'{species.cultivar}'</span>
                {:else}
                  <span class="italic text-gray-300">{species.species}</span>
                {/if}
              </h3>
              {#if species.common_names.length > 0}
                <p class="text-xs text-gray-500 mt-0.5">{species.common_names.join(', ')}</p>
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
