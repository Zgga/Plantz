<script lang="ts">
  import { ArrowUpDown, MapPin, Leaf, AlertCircle, Sparkles, Moon } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import type { Plant } from '$lib/types';
  import { formatDate } from '$lib/utils';

  let {
    plants,
    sortField = $bindable('added_at'),
    sortOrder = $bindable('desc')
  }: {
    plants: (Plant & { main_photo_url?: string; species_name?: string })[];
    sortField?: string;
    sortOrder?: string;
  } = $props();

  function toggleSort(field: string) {
    if (sortField === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortOrder = 'asc';
    }
  }

  const statusIcons = {
    new: Sparkles,
    ok: Leaf,
    alert: AlertCircle,
    dormant: Moon
  };

  const statusColors = {
    new: 'text-blue-400',
    ok: 'text-accent-green',
    alert: 'text-accent-red',
    dormant: 'text-gray-500'
  };
</script>

<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-surface-3 text-left">
        <th class="px-4 py-3 w-12"></th>
        <th class="px-4 py-3">
          <button
            class="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wide hover:text-gray-100 transition-colors"
            onclick={() => toggleSort('nickname')}
          >
            Nom
            <ArrowUpDown class="w-3 h-3" />
          </button>
        </th>
        <th class="px-4 py-3 hidden md:table-cell">
          <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Espèce</span>
        </th>
        <th class="px-4 py-3 hidden sm:table-cell">
          <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Emplacement</span>
        </th>
        <th class="px-4 py-3">
          <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Statut</span>
        </th>
        <th class="px-4 py-3 hidden lg:table-cell">
          <button
            class="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wide hover:text-gray-100 transition-colors"
            onclick={() => toggleSort('added_at')}
          >
            Ajoutée le
            <ArrowUpDown class="w-3 h-3" />
          </button>
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-surface-3/50">
      {#each plants as plant (plant.id)}
        {@const StatusIcon = statusIcons[plant.status] ?? Leaf}
        {@const statusColor = statusColors[plant.status] ?? 'text-gray-400'}
        <tr
          class="hover:bg-surface-2 transition-colors cursor-pointer"
          onclick={() => goto(`/plants/${plant.id}`)}
        >
          <!-- Thumbnail -->
          <td class="px-4 py-3">
            <div class="w-8 h-8 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
              {#if plant.main_photo_url}
                <img
                  src={plant.main_photo_url}
                  alt={plant.nickname}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <Leaf class="w-4 h-4 text-gray-600" />
                </div>
              {/if}
            </div>
          </td>

          <!-- Name -->
          <td class="px-4 py-3">
            <a href={`/plants/${plant.id}`} class="font-medium text-gray-100 hover:text-accent-green transition-colors">
              {plant.nickname}
            </a>
          </td>

          <!-- Species -->
          <td class="px-4 py-3 hidden md:table-cell text-gray-400 italic">
            {plant.species_name ?? plant.species_id?.replace(/-/g, ' ') ?? '—'}
          </td>

          <!-- Location -->
          <td class="px-4 py-3 hidden sm:table-cell">
            {#if plant.location}
              <div class="flex items-center gap-1 text-gray-400">
                <MapPin class="w-3 h-3 flex-shrink-0" />
                {plant.location}
              </div>
            {:else}
              <span class="text-gray-600">—</span>
            {/if}
          </td>

          <!-- Status -->
          <td class="px-4 py-3">
            <div class="flex items-center gap-1 {statusColor}">
              <StatusIcon class="w-3.5 h-3.5 flex-shrink-0" />
              <span class="text-xs capitalize hidden sm:inline">{plant.status}</span>
            </div>
          </td>

          <!-- Date -->
          <td class="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
            {formatDate(plant.added_at)}
          </td>
        </tr>
      {/each}

      {#if plants.length === 0}
        <tr>
          <td colspan="6" class="px-4 py-12 text-center text-gray-500">
            Aucune plante trouvée
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
