<script lang="ts">
  import { ArrowLeft, Edit3, Save, X, Trash2 } from 'lucide-svelte';
  import type { PageData } from './$types';
  import type { Species } from '$lib/types';

  let { data }: { data: PageData } = $props();

  let editing = $state(false);
  let saving = $state(false);
  let deleting = $state(false);
  let draft = $state<Species>({ ...data.species });

  function startEdit() {
    draft = { ...data.species };
    editing = true;
  }
  function cancelEdit() { editing = false; }

  async function save() {
    saving = true;
    try {
      const res = await fetch(`/api/library/${data.species.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      saving = false;
    }
  }

  async function deleteSpecies() {
    if (!confirm(`Supprimer "${data.species.genus} ${data.species.species}" de la bibliothèque ?`)) return;
    deleting = true;
    const res = await fetch(`/api/library/${data.species.id}`, { method: 'DELETE' });
    if (res.ok) window.location.href = '/library';
    else deleting = false;
  }

  function speciesTitle(s: Species) {
    return s.cultivar ? `${s.genus} '${s.cultivar}'` : `${s.genus} ${s.species}`;
  }
</script>

<svelte:head>
  <title>{speciesTitle(data.species)} – Bibliothèque – Plantz</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
  <!-- Header -->
  <div class="flex items-start gap-3">
    <a href="/library" class="btn btn-ghost p-2 mt-1 flex-shrink-0">
      <ArrowLeft class="w-4 h-4" />
    </a>
    <div class="flex-1 min-w-0">
      <h1 class="text-2xl font-bold text-gray-100">
        {speciesTitle(editing ? draft : data.species)}
      </h1>
      {#if data.species.common_names.length > 0}
        <p class="text-sm text-gray-500 mt-0.5">{data.species.common_names.join(', ')}</p>
      {/if}
    </div>
    <div class="flex gap-2 flex-shrink-0">
      {#if editing}
        <button onclick={cancelEdit} class="btn btn-ghost p-2" disabled={saving}><X class="w-4 h-4" /></button>
        <button onclick={save} class="btn btn-primary p-2" disabled={saving}><Save class="w-4 h-4" /></button>
      {:else}
        <button onclick={startEdit} class="btn btn-ghost p-2"><Edit3 class="w-4 h-4" /></button>
        <button onclick={deleteSpecies} class="btn btn-danger p-2" disabled={deleting}><Trash2 class="w-4 h-4" /></button>
      {/if}
    </div>
  </div>

  <!-- Identification -->
  <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
    <h2 class="text-sm font-semibold text-gray-300">Identification botanique</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#if editing}
        <div>
          <label class="label" for="genus">Genre</label>
          <input id="genus" bind:value={draft.genus} class="input" />
        </div>
        <div>
          <label class="label" for="sp">Espèce</label>
          <input id="sp" bind:value={draft.species} class="input" />
        </div>
        <div>
          <label class="label" for="cultivar">Cultivar</label>
          <input id="cultivar" bind:value={draft.cultivar} class="input" placeholder="Optionnel" />
        </div>
        <div>
          <label class="label" for="family">Famille</label>
          <input id="family" bind:value={draft.family} class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="common-names">Noms communs</label>
          <input
            id="common-names"
            value={draft.common_names.join(', ')}
            oninput={(e) => draft.common_names = (e.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)}
            class="input"
            placeholder="séparés par des virgules"
          />
        </div>
        <div>
          <label class="label" for="origin">Origine</label>
          <input id="origin" bind:value={draft.origin} class="input" placeholder="Optionnel" />
        </div>
      {:else}
        <div><span class="label block">Genre</span><p class="text-sm text-gray-200 italic">{data.species.genus}</p></div>
        <div><span class="label block">Espèce</span><p class="text-sm text-gray-200 italic">{data.species.species}</p></div>
        {#if data.species.cultivar}
          <div><span class="label block">Cultivar</span><p class="text-sm text-gray-200">'{data.species.cultivar}'</p></div>
        {/if}
        <div><span class="label block">Famille</span><p class="text-sm text-gray-200">{data.species.family}</p></div>
        {#if data.species.common_names.length > 0}
          <div class="sm:col-span-2"><span class="label block">Noms communs</span><p class="text-sm text-gray-200">{data.species.common_names.join(', ')}</p></div>
        {/if}
        {#if data.species.origin}
          <div><span class="label block">Origine</span><p class="text-sm text-gray-200">{data.species.origin}</p></div>
        {/if}
        <div><span class="label block">ID</span><p class="text-sm font-mono text-gray-500">{data.species.id}</p></div>
      {/if}
    </div>
  </section>

  <!-- Entretien -->
  <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
    <h2 class="text-sm font-semibold text-gray-300">Conseils d'entretien</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {#if editing}
        <div>
          <label class="label" for="light">Lumière</label>
          <select id="light" bind:value={draft.care_tips.light} class="select">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="bright-indirect">Vive indirecte</option>
            <option value="direct-sun">Soleil direct</option>
          </select>
        </div>
        <div>
          <label class="label" for="water">Arrosage</label>
          <select id="water" bind:value={draft.care_tips.water} class="select">
            <option value="dry-between-watering">Laisser sécher</option>
            <option value="moist-always">Maintenir humide</option>
            <option value="aquatic">Aquatique</option>
          </select>
        </div>
        <div>
          <label class="label" for="humidity">Humidité</label>
          <select id="humidity" bind:value={draft.care_tips.humidity} class="select">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>
        <div>
          <label class="label" for="temp-min">Temp. min (°C)</label>
          <input id="temp-min" type="number" bind:value={draft.care_tips.temperature_min_celsius} class="input" />
        </div>
        <div>
          <label class="label" for="temp-max">Temp. max (°C)</label>
          <input id="temp-max" type="number" bind:value={draft.care_tips.temperature_max_celsius} class="input" />
        </div>
        <div>
          <label class="label" for="fertilization">Fertilisation (mois)</label>
          <input id="fertilization" type="number" bind:value={draft.care_tips.fertilization_frequency_months} class="input" min="1" />
        </div>
        <div class="sm:col-span-3">
          <label class="label" for="substrate">Substrat</label>
          <input id="substrate" bind:value={draft.care_tips.substrate_mix} class="input" />
        </div>
      {:else}
        <div><span class="label block">Lumière</span><p class="text-sm text-gray-200">{data.species.care_tips.light}</p></div>
        <div><span class="label block">Arrosage</span><p class="text-sm text-gray-200">{data.species.care_tips.water}</p></div>
        <div><span class="label block">Humidité</span><p class="text-sm text-gray-200">{data.species.care_tips.humidity}</p></div>
        <div><span class="label block">Temp. min</span><p class="text-sm text-gray-200">{data.species.care_tips.temperature_min_celsius}°C</p></div>
        <div><span class="label block">Temp. max</span><p class="text-sm text-gray-200">{data.species.care_tips.temperature_max_celsius}°C</p></div>
        <div><span class="label block">Fertilisation</span><p class="text-sm text-gray-200">tous les {data.species.care_tips.fertilization_frequency_months} mois</p></div>
        {#if data.species.care_tips.substrate_mix}
          <div class="sm:col-span-3"><span class="label block">Substrat</span><p class="text-sm text-gray-200">{data.species.care_tips.substrate_mix}</p></div>
        {/if}
      {/if}
    </div>
  </section>

  <!-- Autres infos -->
  <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
    <h2 class="text-sm font-semibold text-gray-300">Informations complémentaires</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#if editing}
        <div>
          <label class="label" for="toxicity">Toxicité</label>
          <select id="toxicity" bind:value={draft.toxicity} class="select">
            <option value={undefined}>Non renseignée</option>
            <option value="non-toxic">Non toxique</option>
            <option value="toxic-pets">Toxique pour animaux</option>
            <option value="toxic-humans">Toxique pour humains</option>
            <option value="toxic-all">Toxique (animaux + humains)</option>
          </select>
        </div>
        <div>
          <label class="label" for="growth-rate">Croissance</label>
          <select id="growth-rate" bind:value={draft.growth_rate} class="select">
            <option value={undefined}>Non renseignée</option>
            <option value="slow">Lente</option>
            <option value="medium">Moyenne</option>
            <option value="fast">Rapide</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="notes">Notes</label>
          <textarea id="notes" bind:value={draft.notes} class="input resize-none h-24"></textarea>
        </div>
      {:else}
        {#if data.species.toxicity}
          <div><span class="label block">Toxicité</span><p class="text-sm text-gray-200">{data.species.toxicity}</p></div>
        {/if}
        {#if data.species.growth_rate}
          <div><span class="label block">Croissance</span><p class="text-sm text-gray-200">{data.species.growth_rate}</p></div>
        {/if}
        {#if data.species.notes}
          <div class="sm:col-span-2"><span class="label block">Notes</span><p class="text-sm text-gray-300">{data.species.notes}</p></div>
        {/if}
        {#if !data.species.toxicity && !data.species.growth_rate && !data.species.notes}
          <p class="text-sm text-gray-600 sm:col-span-2">Aucune information complémentaire.</p>
        {/if}
      {/if}
    </div>
  </section>
</div>
