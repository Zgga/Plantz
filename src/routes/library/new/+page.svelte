<script lang="ts">
  import { ArrowLeft, Plus } from 'lucide-svelte';
  import { slugify } from '$lib/utils';

  let genus = $state('');
  let species = $state('');
  let cultivar = $state('');
  let commonNames = $state('');
  let family = $state('');
  let origin = $state('');
  let light = $state<'low' | 'medium' | 'bright-indirect' | 'direct-sun'>('medium');
  let water = $state<'dry-between-watering' | 'moist-always' | 'aquatic'>('dry-between-watering');
  let humidity = $state<'low' | 'medium' | 'high'>('medium');
  let tempMin = $state(10);
  let tempMax = $state(30);
  let substrate = $state('');
  let fertilization = $state(3);
  let toxicity = $state('');
  let growthRate = $state('');
  let notes = $state('');

  let submitting = $state(false);
  let errorMsg = $state('');

  const autoId = $derived(
    genus && species
      ? slugify(`${genus}-${species}${cultivar ? `-${cultivar}` : ''}`)
      : ''
  );

  async function submit(e: Event) {
    e.preventDefault();
    if (!genus.trim() || !species.trim()) return;
    submitting = true;
    errorMsg = '';

    const payload = {
      id: autoId,
      genus: genus.trim(),
      species: species.trim(),
      ...(cultivar.trim() ? { cultivar: cultivar.trim() } : {}),
      common_names: commonNames.split(',').map((s) => s.trim()).filter(Boolean),
      family: family.trim(),
      ...(origin.trim() ? { origin: origin.trim() } : {}),
      care_tips: {
        light,
        water,
        humidity,
        temperature_min_celsius: tempMin,
        temperature_max_celsius: tempMax,
        substrate_mix: substrate.trim(),
        fertilization_frequency_months: fertilization
      },
      ...(toxicity ? { toxicity } : {}),
      ...(growthRate ? { growth_rate: growthRate } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {})
    };

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        window.location.href = '/library';
      } else {
        const err = await res.json().catch(() => ({}));
        errorMsg = err.message ?? 'Erreur lors de la création.';
      }
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Nouvelle espèce – Plantz</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
  <div class="flex items-center gap-3">
    <a href="/library" class="btn btn-ghost p-2">
      <ArrowLeft class="w-4 h-4" />
    </a>
    <h1 class="text-xl font-bold">Nouvelle espèce</h1>
  </div>

  {#if errorMsg}
    <div class="rounded-lg bg-accent-red/10 border border-accent-red/20 px-4 py-3 text-sm text-accent-red">
      {errorMsg}
    </div>
  {/if}

  <form onsubmit={submit} class="space-y-6">
    <!-- Identification -->
    <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
      <h2 class="text-sm font-semibold text-gray-300">Identification botanique</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label" for="genus">Genre <span class="text-accent-red">*</span></label>
          <input id="genus" bind:value={genus} class="input" placeholder="ex: Monstera" required />
        </div>
        <div>
          <label class="label" for="species-name">Espèce <span class="text-accent-red">*</span></label>
          <input id="species-name" bind:value={species} class="input" placeholder="ex: deliciosa" required />
        </div>
        <div>
          <label class="label" for="cultivar">Cultivar</label>
          <input id="cultivar" bind:value={cultivar} class="input" placeholder="ex: Thai Constellation" />
        </div>
        <div>
          <label class="label" for="family">Famille</label>
          <input id="family" bind:value={family} class="input" placeholder="ex: Araceae" />
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="common-names">Noms communs</label>
          <input id="common-names" bind:value={commonNames} class="input" placeholder="séparés par des virgules" />
        </div>
        <div>
          <label class="label" for="origin">Origine géographique</label>
          <input id="origin" bind:value={origin} class="input" placeholder="ex: Amérique centrale" />
        </div>
        {#if autoId}
          <div>
            <label class="label">ID généré</label>
            <p class="text-sm font-mono text-gray-400 bg-surface-2 px-3 py-2 rounded-lg">{autoId}</p>
          </div>
        {/if}
      </div>
    </section>

    <!-- Entretien -->
    <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
      <h2 class="text-sm font-semibold text-gray-300">Conseils d'entretien</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="label" for="light">Lumière</label>
          <select id="light" bind:value={light} class="select">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="bright-indirect">Vive indirecte</option>
            <option value="direct-sun">Soleil direct</option>
          </select>
        </div>
        <div>
          <label class="label" for="water">Arrosage</label>
          <select id="water" bind:value={water} class="select">
            <option value="dry-between-watering">Laisser sécher</option>
            <option value="moist-always">Maintenir humide</option>
            <option value="aquatic">Aquatique</option>
          </select>
        </div>
        <div>
          <label class="label" for="humidity">Humidité</label>
          <select id="humidity" bind:value={humidity} class="select">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>
        <div>
          <label class="label" for="temp-min">Temp. min (°C)</label>
          <input id="temp-min" type="number" bind:value={tempMin} class="input" />
        </div>
        <div>
          <label class="label" for="temp-max">Temp. max (°C)</label>
          <input id="temp-max" type="number" bind:value={tempMax} class="input" />
        </div>
        <div>
          <label class="label" for="fertilization">Fertilisation (mois)</label>
          <input id="fertilization" type="number" bind:value={fertilization} class="input" min="1" />
        </div>
        <div class="sm:col-span-3">
          <label class="label" for="substrate">Substrat</label>
          <input id="substrate" bind:value={substrate} class="input" placeholder="ex: Terreau + perlite 30%" />
        </div>
      </div>
    </section>

    <!-- Autres infos -->
    <section class="bg-surface-1 border border-surface-3 rounded-xl p-4 space-y-4">
      <h2 class="text-sm font-semibold text-gray-300">Informations complémentaires</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label" for="toxicity">Toxicité</label>
          <select id="toxicity" bind:value={toxicity} class="select">
            <option value="">Non renseignée</option>
            <option value="non-toxic">Non toxique</option>
            <option value="toxic-pets">Toxique pour animaux</option>
            <option value="toxic-humans">Toxique pour humains</option>
            <option value="toxic-all">Toxique (animaux + humains)</option>
          </select>
        </div>
        <div>
          <label class="label" for="growth-rate">Croissance</label>
          <select id="growth-rate" bind:value={growthRate} class="select">
            <option value="">Non renseignée</option>
            <option value="slow">Lente</option>
            <option value="medium">Moyenne</option>
            <option value="fast">Rapide</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="label" for="notes">Notes</label>
          <textarea id="notes" bind:value={notes} class="input resize-none h-24" placeholder="Observations, conseils spécifiques..."></textarea>
        </div>
      </div>
    </section>

    <button type="submit" class="btn btn-primary w-full h-11" disabled={submitting || !genus.trim() || !species.trim()}>
      {#if submitting}
        <span class="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
        Création...
      {:else}
        <Plus class="w-4 h-4" />
        Créer l'espèce
      {/if}
    </button>
  </form>
</div>
