<script lang="ts">
  import { ChevronDown, X } from 'lucide-svelte';
  import type { Species } from '$lib/types';

  interface Props {
    library: Species[];
    value: string;
    onchange: (id: string) => void;
    id?: string;
    placeholder?: string;
  }

  let { library, value, onchange, id = 'species-combobox', placeholder = '— Inconnue / Identifier plus tard —' }: Props = $props();

  function speciesLabel(s: Species) {
    return s.cultivar ? `${s.genus} '${s.cultivar}'` : `${s.genus} ${s.species}`;
  }

  const selected = $derived(library.find((s) => s.id === value) ?? null);

  let query = $state('');
  let open = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);

  const filtered = $derived(
    query.trim()
      ? library.filter((s) => {
          const q = query.toLowerCase();
          return [s.id, s.genus, s.species, s.cultivar ?? '', ...s.common_names]
            .join(' ').toLowerCase().includes(q);
        })
      : library
  );

  function select(s: Species | null) {
    onchange(s?.id ?? '');
    query = '';
    open = false;
  }

  function onInputFocus() {
    open = true;
  }

  function onInputInput(e: Event) {
    query = (e.target as HTMLInputElement).value;
    open = true;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { open = false; query = ''; }
  }

  function onClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      open = false;
      query = '';
    }
  }
</script>

<svelte:window onclick={onClickOutside} />

<div bind:this={containerEl} class="relative" {id}>
  <!-- Trigger / input -->
  <div class="relative">
    <input
      type="text"
      class="input pr-8"
      value={open ? query : (selected ? speciesLabel(selected) : '')}
      placeholder={selected ? '' : placeholder}
      onfocus={onInputFocus}
      oninput={onInputInput}
      onkeydown={onKeydown}
      autocomplete="off"
      spellcheck="false"
    />
    <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
      {#if value}
        <button
          type="button"
          onclick={(e) => { e.stopPropagation(); select(null); }}
          class="p-0.5 text-gray-500 hover:text-gray-300 transition-colors"
          tabindex="-1"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      {/if}
      <ChevronDown class="w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>

  <!-- Dropdown -->
  {#if open}
    <div class="absolute z-50 w-full mt-1 bg-surface-1 border border-surface-3 rounded-lg shadow-xl max-h-60 overflow-y-auto">
      <!-- Clear option -->
      <button
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-surface-2 transition-colors border-b border-surface-3"
        onclick={() => select(null)}
      >
        {placeholder}
      </button>

      {#if filtered.length === 0}
        <div class="px-3 py-4 text-sm text-gray-600 text-center">Aucune espèce trouvée</div>
      {:else}
        {#each filtered as s (s.id)}
          <button
            type="button"
            class={[
              'w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors',
              s.id === value ? 'bg-accent-green/10 text-accent-green' : 'text-gray-200'
            ].join(' ')}
            onclick={() => select(s)}
          >
            <span class="font-medium">{speciesLabel(s)}</span>
            {#if s.common_names.length > 0}
              <span class="text-gray-500 text-xs ml-1">· {s.common_names[0]}</span>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
