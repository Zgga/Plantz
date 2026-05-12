<script lang="ts">
  import { MapPin, AlertCircle, Sparkles, Leaf, Moon } from 'lucide-svelte';
  import type { Plant } from '$lib/types';
  import { getStatusLabel } from '$lib/utils';

  let { plant }: { plant: Plant & { main_photo_url?: string; species_name?: string } } = $props();

  const statusConfig = {
    new:     { class: 'badge-new',     icon: Sparkles,     label: 'Nouvelle' },
    ok:      { class: 'badge-ok',      icon: Leaf,         label: 'Saine' },
    alert:   { class: 'badge-alert',   icon: AlertCircle,  label: 'Alerte' },
    dormant: { class: 'badge-dormant', icon: Moon,         label: 'Dormante' }
  };

  const cfg = $derived(statusConfig[plant.status] ?? statusConfig.ok);
  const StatusIcon = $derived(cfg.icon);
</script>

<a
  href={`/plants/${plant.id}`}
  class="card group flex flex-col cursor-pointer hover:border-surface-3/80 hover:bg-surface-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-green"
>
  <!-- Photo -->
  <div class="relative aspect-[4/3] bg-surface-2 overflow-hidden">
    {#if plant.main_photo_url}
      <img
        src={plant.main_photo_url}
        alt={plant.nickname}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <Leaf class="w-12 h-12 text-surface-3" />
      </div>
    {/if}

    <!-- Status badge overlay -->
    <div class="absolute top-2 right-2">
      <span class={cfg.class}>
        <StatusIcon class="w-3 h-3" />
        {cfg.label}
      </span>
    </div>
  </div>

  <!-- Info -->
  <div class="flex flex-col gap-1 p-3">
    <h3 class="font-medium text-sm text-gray-100 truncate leading-tight">
      {plant.nickname}
    </h3>

    {#if plant.species_name}
      <p class="text-xs text-gray-500 italic truncate">{plant.species_name}</p>
    {:else if plant.species_id}
      <p class="text-xs text-gray-500 italic truncate">{plant.species_id.replace(/-/g, ' ')}</p>
    {:else}
      <p class="text-xs text-gray-600 italic">Espèce inconnue</p>
    {/if}

    {#if plant.location}
      <div class="flex items-center gap-1 mt-0.5">
        <MapPin class="w-3 h-3 text-gray-500 flex-shrink-0" />
        <span class="text-xs text-gray-500 truncate">{plant.location}</span>
      </div>
    {/if}

    {#if plant.tags.length > 0}
      <div class="flex flex-wrap gap-1 mt-1">
        {#each plant.tags.slice(0, 3) as tag}
          <span class="text-xs bg-surface-3 text-gray-400 px-1.5 py-0.5 rounded">{tag}</span>
        {/each}
        {#if plant.tags.length > 3}
          <span class="text-xs text-gray-600">+{plant.tags.length - 3}</span>
        {/if}
      </div>
    {/if}
  </div>
</a>
