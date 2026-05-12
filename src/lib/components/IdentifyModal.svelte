<script lang="ts">
  import { X, Sparkles, Check, RefreshCw, Loader } from 'lucide-svelte';

  interface PlantNetCandidate {
    scientificName: string;
    genus: string;
    commonNames: string[];
    score: number;
  }

  interface ClaudeIdentification {
    genus: string;
    species: string;
    common_names: string[];
    confidence: number;
    family: string;
    notes?: string;
  }

  interface Props {
    plantId: string;
    photoFilename: string;
    onApply: (speciesId: string, confidence: number, source: 'plantnet' | 'claude', commonNames: string[], nickname: string) => void;
    onClose: () => void;
  }

  let { plantId, photoFilename, onApply, onClose }: Props = $props();

  type Phase = 'loading' | 'results' | 'refining' | 'picking-name' | 'applying' | 'error';

  let phase = $state<Phase>('loading');
  let candidates = $state<PlantNetCandidate[]>([]);
  let needsRefinement = $state(false);
  let claudeResult = $state<ClaudeIdentification | null>(null);
  let selected = $state<{ name: string; genus: string; species: string; commonNames: string[]; score: number; source: 'plantnet' | 'claude' } | null>(null);
  let chosenNickname = $state('');
  let errorMsg = $state('');

  const nameOptions = $derived((): string[] => {
    if (!selected) return [];
    const scientific = `${selected.genus} ${selected.species}`.trim();
    const all = [...selected.commonNames, scientific];
    return [...new Set(all.filter(Boolean))];
  });

  async function runIdentify() {
    phase = 'loading';
    errorMsg = '';
    try {
      const res = await fetch(`/api/plants/${plantId}/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: photoFilename })
      });
      const data = await res.json();
      candidates = data.candidates ?? [];
      needsRefinement = data.needs_refinement ?? true;
      phase = 'results';
    } catch {
      errorMsg = 'Erreur réseau lors de l\'identification.';
      phase = 'error';
    }
  }

  async function runRefine() {
    phase = 'refining';
    errorMsg = '';
    try {
      const res = await fetch(`/api/plants/${plantId}/identify/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: photoFilename })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Erreur serveur ${res.status}`);
      }
      const data = await res.json();
      claudeResult = data.result;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Erreur IA inconnue.';
    }
    phase = 'results';
  }

  function startPickName() {
    if (!selected) return;
    chosenNickname = nameOptions()[0] ?? '';
    phase = 'picking-name';
  }

  async function applyWithName() {
    if (!selected) return;
    phase = 'applying';
    try {
      const res = await fetch('/api/library/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genus: selected.genus,
          species: selected.species,
          common_names: selected.commonNames,
          family: '',
          enrich: true
        })
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      onApply(data.id, Math.round(selected.score * 100), selected.source, selected.commonNames, chosenNickname || nameOptions()[0] || '');
    } catch {
      errorMsg = 'Erreur lors de l\'application.';
      phase = 'error';
    }
  }

  function scoreColor(score: number): string {
    if (score >= 0.7) return 'bg-emerald-500/20 text-emerald-400';
    if (score >= 0.4) return 'bg-amber-500/20 text-amber-400';
    return 'bg-red-500/20 text-red-400';
  }

  function scoreLabel(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  $effect(() => {
    runIdentify();
  });
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
  role="dialog"
  aria-modal="true"
>
  <div class="bg-surface-1 border border-surface-3 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-surface-3 flex-shrink-0">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-accent-green" />
        Identification de la plante
      </h2>
      <button onclick={onClose} class="p-1.5 rounded-lg text-gray-400 hover:bg-surface-3 hover:text-gray-100">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#if phase === 'loading'}
        <div class="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
          <Loader class="w-6 h-6 animate-spin" />
          <p class="text-sm">Identification en cours…</p>
        </div>

      {:else if phase === 'error'}
        <div class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
        <button onclick={runIdentify} class="btn btn-ghost h-8 px-3 text-xs w-full">
          <RefreshCw class="w-3 h-3" />
          Réessayer
        </button>

      {:else if phase === 'refining'}
        <div class="flex flex-col items-center justify-center py-10 gap-3 text-purple-400">
          <Loader class="w-6 h-6 animate-spin" />
          <p class="text-sm">Analyse IA en cours…</p>
        </div>

      {:else if phase === 'applying'}
        <div class="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
          <Loader class="w-6 h-6 animate-spin" />
          <p class="text-sm">Application en cours…</p>
        </div>

      {:else if phase === 'picking-name'}
        <div class="space-y-3">
          <p class="text-xs text-gray-400">Quel nom utiliser comme surnom pour cette plante ?</p>
          <div class="flex flex-wrap gap-2">
            {#each nameOptions() as name (name)}
              <button
                onclick={() => (chosenNickname = name)}
                class={['px-3 py-1.5 rounded-full text-sm border transition-colors', chosenNickname === name ? 'border-accent-green bg-accent-green/15 text-accent-green font-medium' : 'border-surface-3 text-gray-300 hover:border-gray-500'].join(' ')}
              >
                {name}
              </button>
            {/each}
          </div>
          <div class="pt-1">
            <label class="text-xs text-gray-500 block mb-1">Ou saisir un nom personnalisé</label>
            <input
              bind:value={chosenNickname}
              class="input h-8 text-sm"
              placeholder="ex: Ma petite Polly"
            />
          </div>
        </div>

      {:else}
        <!-- Claude result (prepended) -->
        {#if claudeResult}
          {@const score = claudeResult.confidence / 100}
          {@const isSelected = selected?.source === 'claude'}
          <button
            class={['w-full text-left rounded-lg border px-3 py-2.5 transition-colors', isSelected ? 'border-accent-green bg-accent-green/10' : 'border-surface-3 bg-surface-2 hover:border-surface-3 hover:bg-surface-3'].join(' ')}
            onclick={() => selected = {
              name: `${claudeResult!.genus} ${claudeResult!.species}`,
              genus: claudeResult!.genus,
              species: claudeResult!.species,
              commonNames: claudeResult!.common_names,
              score,
              source: 'claude'
            }}
          >
            <div class="flex items-center gap-2">
              <span class={['text-xs font-mono font-semibold px-1.5 py-0.5 rounded', scoreColor(score)].join(' ')}>
                {scoreLabel(score)}
              </span>
              <span class="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">IA</span>
              <span class="text-sm font-medium text-gray-100 italic">{claudeResult.genus} {claudeResult.species}</span>
              {#if isSelected}<Check class="w-3.5 h-3.5 text-accent-green ml-auto" />{/if}
            </div>
            {#if claudeResult.common_names.length > 0}
              <p class="text-xs text-gray-500 mt-0.5 pl-0.5">{claudeResult.common_names.slice(0, 2).join(', ')}</p>
            {/if}
          </button>
        {/if}

        <!-- PlantNet candidates -->
        {#if candidates.length > 0}
          {#if claudeResult}
            <p class="text-xs text-gray-600 pt-1">Suggestions PlantNet</p>
          {/if}
          {#each candidates as c (c.scientificName)}
            {@const isSelected = selected?.source === 'plantnet' && selected.name === c.scientificName}
            <button
              class={['w-full text-left rounded-lg border px-3 py-2.5 transition-colors', isSelected ? 'border-accent-green bg-accent-green/10' : 'border-surface-3 bg-surface-2 hover:bg-surface-3'].join(' ')}
              onclick={() => selected = {
                name: c.scientificName,
                genus: c.genus,
                species: c.scientificName.replace(c.genus, '').trim(),
                commonNames: c.commonNames,
                score: c.score,
                source: 'plantnet'
              }}
            >
              <div class="flex items-center gap-2">
                <span class={['text-xs font-mono font-semibold px-1.5 py-0.5 rounded', scoreColor(c.score)].join(' ')}>
                  {scoreLabel(c.score)}
                </span>
                <span class="text-sm font-medium text-gray-100 italic">{c.scientificName}</span>
                {#if isSelected}<Check class="w-3.5 h-3.5 text-accent-green ml-auto" />{/if}
              </div>
              {#if c.commonNames.length > 0}
                <p class="text-xs text-gray-500 mt-0.5 pl-0.5">{c.commonNames.slice(0, 2).join(', ')}</p>
              {/if}
            </button>
          {/each}
        {:else if !claudeResult}
          <p class="text-sm text-gray-500 text-center py-6">Aucun résultat PlantNet. Essayez la précision IA.</p>
        {/if}

        <!-- Refine button -->
        {#if needsRefinement && !claudeResult}
          <div class="pt-1">
            <button onclick={runRefine} class="btn btn-ghost h-8 px-3 text-xs w-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              <Sparkles class="w-3.5 h-3.5" />
              Préciser avec l'IA
            </button>
          </div>
        {/if}

        {#if errorMsg}
          <p class="text-xs text-red-400">{errorMsg}</p>
        {/if}
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex gap-2 justify-end px-4 py-3 border-t border-surface-3 flex-shrink-0">
      {#if phase === 'picking-name'}
        <button onclick={() => (phase = 'results')} class="btn btn-ghost h-8 px-3 text-xs">Retour</button>
        <button
          onclick={applyWithName}
          disabled={!chosenNickname.trim()}
          class="btn btn-primary h-8 px-3 text-xs"
        >
          <Check class="w-3 h-3" />
          Confirmer
        </button>
      {:else}
        <button onclick={onClose} class="btn btn-ghost h-8 px-3 text-xs">Annuler</button>
        <button
          onclick={startPickName}
          disabled={!selected || phase === 'applying' || phase === 'loading'}
          class="btn btn-primary h-8 px-3 text-xs"
        >
          <Check class="w-3 h-3" />
          Appliquer
        </button>
      {/if}
    </div>
  </div>
</div>
