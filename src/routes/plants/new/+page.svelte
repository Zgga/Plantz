<script lang="ts">
  import { ArrowLeft, Camera, Leaf, Plus } from 'lucide-svelte';
  import SpeciesCombobox from '$lib/components/SpeciesCombobox.svelte';

  let { data } = $props();

  let nickname = $state('');
  let species_id = $state('');
  let location = $state('');
  let status = $state('new');
  let tags = $state('');
  let photoFile = $state<File | null>(null);
  let photoPreview = $state('');
  let submitting = $state(false);
  let error = $state('');

  function handlePhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    photoFile = file;
    photoPreview = URL.createObjectURL(file);
  }

  async function submit(e: Event) {
    e.preventDefault();
    submitting = true;
    error = '';

    try {
      const fd = new FormData();
      if (nickname.trim()) fd.append('nickname', nickname.trim());
      if (species_id) fd.append('species_id', species_id);
      if (location.trim()) fd.append('location', location.trim());
      fd.append('status', status);
      if (tags.trim()) fd.append('tags', tags);
      if (photoFile) fd.append('photo', photoFile);

      const res = await fetch('/api/plants', { method: 'POST', body: fd });
      if (res.ok) {
        const plant = await res.json();
        window.location.href = `/plants/${plant.id}`;
      } else {
        error = 'Erreur lors de la création de la plante.';
      }
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Nouvelle plante – Plantz</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-6 space-y-6">
  <div class="flex items-center gap-3">
    <a href="/" class="btn btn-ghost p-2">
      <ArrowLeft class="w-4 h-4" />
    </a>
    <h1 class="text-xl font-bold">Nouvelle plante</h1>
  </div>

  {#if error}
    <div class="rounded-lg bg-accent-red/10 border border-accent-red/20 px-4 py-3 text-sm text-accent-red">
      {error}
    </div>
  {/if}

  <form onsubmit={submit} class="space-y-5">
    <!-- Photo -->
    <div>
      <span class="label">Photo</span>
      <label class="block cursor-pointer">
        <div class={[
          'relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-colors',
          photoPreview ? 'border-surface-3' : 'border-surface-3 hover:border-accent-green/50'
        ].join(' ')}>
          {#if photoPreview}
            <img src={photoPreview} alt="Aperçu" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera class="w-8 h-8 text-white" />
            </div>
          {:else}
            <div class="w-full h-full bg-surface-2 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Camera class="w-10 h-10" />
              <span class="text-sm">Ajouter une photo</span>
            </div>
          {/if}
        </div>
        <input type="file" accept="image/*" capture="environment" onchange={handlePhotoChange} />
      </label>
    </div>

    <!-- Nickname -->
    <div>
      <label class="label" for="nickname">Surnom</label>
      <input
        id="nickname"
        bind:value={nickname}
        type="text"
        class="input"
        placeholder="Laissez vide pour un nom aléatoire"
      />
    </div>

    <!-- Species -->
    <div>
      <label class="label" for="species-combobox">Espèce</label>
      <SpeciesCombobox
        library={data.library}
        value={species_id}
        onchange={(id) => (species_id = id)}
      />
    </div>

    <!-- Location -->
    <div>
      <label class="label" for="location">Emplacement</label>
      <input
        id="location"
        bind:value={location}
        type="text"
        class="input"
        placeholder="ex: Salon – Étagère Est"
      />
    </div>

    <!-- Status -->
    <div>
      <label class="label" for="status">Statut initial</label>
      <select id="status" bind:value={status} class="select">
        <option value="new">Nouvelle</option>
        <option value="ok">En bonne santé</option>
        <option value="alert">En alerte</option>
        <option value="dormant">En dormance</option>
      </select>
    </div>

    <!-- Tags -->
    <div>
      <label class="label" for="tags">Tags</label>
      <input
        id="tags"
        bind:value={tags}
        type="text"
        class="input"
        placeholder="bouture, cadeau, fragile (séparés par des virgules)"
      />
    </div>

    <button type="submit" class="btn btn-primary w-full h-11" disabled={submitting}>
      {#if submitting}
        <span class="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
        Création en cours...
      {:else}
        <Plus class="w-4 h-4" />
        Créer la plante
      {/if}
    </button>
  </form>
</div>
