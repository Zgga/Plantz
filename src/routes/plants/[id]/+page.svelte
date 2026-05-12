<script lang="ts">
  import {
    ArrowLeft, Edit3, Save, X, Trash2, Camera, Star, MapPin,
    Leaf, Calendar, FlaskConical, Droplets, Sun, Wind, Tag,
    Plus, ChevronDown, ChevronUp, FileText, Image, Info, Crop, CalendarDays,
    Bell, Check, Droplets as Water, Flower2, Shovel
  } from 'lucide-svelte';
  import { marked } from 'marked';
  import { formatDate, formatDateTime, getLightLabel, getWaterLabel, getHumidityLabel } from '$lib/utils';
  import CoverCropModal from '$lib/components/CoverCropModal.svelte';
  import SpeciesCombobox from '$lib/components/SpeciesCombobox.svelte';
  import type { Plant } from '$lib/types';

  let { data } = $props();

  let plant = $state({ ...data.plant });
  let species = $state(data.species ?? null);
  let journal = $state(data.journal ?? '');
  let photos = $state(data.photos ? [...data.photos] : []);
  let library = $state(data.library ?? []);
  let reminders = $state<import('$lib/types').Reminder[]>(data.plant.reminders ?? []);

  let editing = $state(false);
  let saving = $state(false);
  let journalEntry = $state('');
  let addingEntry = $state(false);
  let activeTab = $state<'info' | 'journal' | 'photos'>('info');
  let uploadingPhoto = $state(false);
  let deletingPlant = $state(false);
  let cropModalPhoto = $state<{ filename: string; url: string } | null>(null);

  // Editable form draft – initialized lazily inside startEdit
  let draft = $state({ ...data.plant });

  function startEdit() {
    draft = { ...plant };
    editing = true;
  }

  function cancelEdit() {
    draft = { ...plant };
    editing = false;
  }

  async function saveEdit() {
    saving = true;
    try {
      const res = await fetch(`/api/plants/${plant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      if (res.ok) {
        const updated = await res.json();
        plant = updated;
        editing = false;
        if (draft.species_id !== plant.species_id) {
          window.location.reload();
        }
      }
    } finally {
      saving = false;
    }
  }

  async function addJournalEntry() {
    if (!journalEntry.trim()) return;
    const res = await fetch(`/api/plants/${plant.id}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: journalEntry })
    });
    if (res.ok) {
      addingEntry = false;
      journalEntry = '';
      window.location.reload();
    }
  }

  async function uploadPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    uploadingPhoto = true;
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`/api/plants/${plant.id}/photos`, { method: 'POST', body: fd });
      if (res.ok) {
        const photo = await res.json();
        photos = [...photos, photo];
        if (!plant.main_photo_filename) {
          plant = { ...plant, main_photo_filename: photo.filename };
        }
      }
    } finally {
      uploadingPhoto = false;
      input.value = '';
    }
  }

  async function setCover(filename: string) {
    const res = await fetch(`/api/plants/${plant.id}/photos/${encodeURIComponent(filename)}`, {
      method: 'PUT'
    });
    if (res.ok) {
      plant = { ...plant, main_photo_filename: filename, main_photo_position: undefined };
      photos = photos.map((p) => ({ ...p, is_cover: p.filename === filename }));
    }
  }

  // ── Reminders ────────────────────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);

  let addingReminder = $state(false);
  let newReminder = $state({ type: 'watering' as const, label: '', due_date: today });

  const reminderIcon: Record<string, typeof Bell> = {
    watering: Water,
    repotting: Shovel,
    fertilizing: Flower2,
    other: Bell
  };

  async function addReminder() {
    const res = await fetch(`/api/plants/${plant.id}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newReminder.type, label: newReminder.label || undefined, due_date: newReminder.due_date })
    });
    if (res.ok) {
      const r = await res.json();
      reminders = [...reminders, r];
      addingReminder = false;
      newReminder = { type: 'watering', label: '', due_date: today };
    }
  }

  async function toggleReminder(id: string, done: boolean) {
    const res = await fetch(`/api/plants/${plant.id}/reminders`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done })
    });
    if (res.ok) reminders = reminders.map((r) => r.id === id ? { ...r, done } : r);
  }

  async function deleteReminder(id: string) {
    const res = await fetch(`/api/plants/${plant.id}/reminders`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) reminders = reminders.filter((r) => r.id !== id);
  }

  const reminderTypeLabel: Record<string, string> = {
    watering: 'Arrosage', repotting: 'Rempotage', fertilizing: 'Fertilisation', other: 'Autre'
  };

  async function saveCoverPosition(pos: { x: number; y: number }) {
    const res = await fetch(`/api/plants/${plant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plant, main_photo_position: pos })
    });
    if (res.ok) {
      plant = { ...plant, main_photo_position: pos };
    }
    cropModalPhoto = null;
  }

  let editingDateFor = $state<string | null>(null);
  let editingDateValue = $state('');

  function startEditDate(filename: string, currentDate: string | null) {
    editingDateFor = filename;
    editingDateValue = currentDate ?? new Date().toISOString().slice(0, 10);
  }

  async function saveTakenAt(filename: string) {
    const res = await fetch(`/api/plants/${plant.id}/photos/${encodeURIComponent(filename)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taken_at: editingDateValue })
    });
    if (res.ok) {
      photos = photos.map((p) =>
        p.filename === filename ? { ...p, taken_at: editingDateValue } : p
      );
    }
    editingDateFor = null;
  }

  async function deletePhoto(filename: string) {
    if (!confirm(`Supprimer cette photo ?`)) return;
    const res = await fetch(`/api/plants/${plant.id}/photos/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      photos = photos.filter((p) => p.filename !== filename);
      if (plant.main_photo_filename === filename) {
        plant = { ...plant, main_photo_filename: photos[0]?.filename ?? '' };
      }
    }
  }

  async function deletePlant() {
    if (!confirm(`Supprimer "${plant.nickname}" définitivement ?`)) return;
    deletingPlant = true;
    const res = await fetch(`/api/plants/${plant.id}`, { method: 'DELETE' });
    if (res.ok) window.location.href = '/';
    else deletingPlant = false;
  }

  const coverPhoto = $derived(photos.find((p) => p.filename === plant.main_photo_filename) ?? photos[0]);

  const speciesOptions = $derived(
    library.map((s) => ({
      value: s.id,
      label: s.cultivar ? `${s.genus} '${s.cultivar}'` : `${s.genus} ${s.species}`
    }))
  );

  function tagsFromString(str: string): string[] {
    return str.split(',').map((t) => t.trim()).filter(Boolean);
  }
</script>

{#if cropModalPhoto}
  <CoverCropModal
    photoUrl={cropModalPhoto.url}
    position={plant.main_photo_position ?? { x: 50, y: 50 }}
    onSave={saveCoverPosition}
    onClose={() => (cropModalPhoto = null)}
  />
{/if}

<svelte:head>
  <title>{plant.nickname} – Plantz</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
  <!-- Header -->
  <div class="flex items-start gap-4">
    <a href="/" class="btn btn-ghost p-2 mt-1 flex-shrink-0">
      <ArrowLeft class="w-4 h-4" />
    </a>

    <div class="flex-1 min-w-0">
      {#if editing}
        <input bind:value={draft.nickname} class="input text-xl font-bold mb-1" placeholder="Nom de la plante" />
      {:else}
        <h1 class="text-2xl font-bold text-gray-100 truncate">{plant.nickname}</h1>
      {/if}
      {#if species}
        <p class="text-sm text-gray-500 italic mt-0.5">
          {species.genus} {species.species}{species.cultivar ? ` '${species.cultivar}'` : ''}
        </p>
      {/if}
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      {#if editing}
        <button onclick={cancelEdit} class="btn btn-ghost p-2" disabled={saving}>
          <X class="w-4 h-4" />
        </button>
        <button onclick={saveEdit} class="btn btn-primary p-2" disabled={saving}>
          <Save class="w-4 h-4" />
        </button>
      {:else}
        <button onclick={startEdit} class="btn btn-ghost p-2">
          <Edit3 class="w-4 h-4" />
        </button>
        <button onclick={deletePlant} class="btn btn-danger p-2" disabled={deletingPlant}>
          <Trash2 class="w-4 h-4" />
        </button>
      {/if}
    </div>
  </div>

  <!-- Cover photo -->
  <div class="relative aspect-video rounded-xl overflow-hidden bg-surface-2">
    {#if coverPhoto}
      <img
        src={coverPhoto.url}
        alt={plant.nickname}
        class="w-full h-full object-cover"
        style={plant.main_photo_position ? `object-position: ${plant.main_photo_position.x}% ${plant.main_photo_position.y}%` : ''}
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <Leaf class="w-16 h-16 text-surface-3" />
      </div>
    {/if}

    <!-- Status badge -->
    <div class="absolute top-3 right-3">
      <span class={`badge badge-${plant.status}`}>{plant.status}</span>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 border-b border-surface-3">
    <button
      onclick={() => (activeTab = 'info')}
      class={['flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === 'info' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-400 hover:text-gray-200'].join(' ')}
    >
      <Info class="w-4 h-4" />Infos
    </button>
    <button
      onclick={() => (activeTab = 'journal')}
      class={['flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === 'journal' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-400 hover:text-gray-200'].join(' ')}
    >
      <FileText class="w-4 h-4" />Journal
    </button>
    <button
      onclick={() => (activeTab = 'photos')}
      class={['flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === 'photos' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-400 hover:text-gray-200'].join(' ')}
    >
      <Image class="w-4 h-4" />Photos
    </button>
  </div>

  <!-- Tab content -->
  {#if activeTab === 'info'}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Status -->
      <div>
        <label class="label" for="status">Statut</label>
        {#if editing}
          <select id="status" bind:value={draft.status} class="select">
            <option value="new">Nouvelle</option>
            <option value="ok">En bonne santé</option>
            <option value="alert">En alerte</option>
            <option value="dormant">En dormance</option>
          </select>
        {:else}
          <span class={`badge badge-${plant.status} text-sm`}>{plant.status}</span>
        {/if}
      </div>

      <!-- Species -->
      <div>
        <label class="label" for="species-combobox">Espèce</label>
        {#if editing}
          <SpeciesCombobox
            library={library}
            value={draft.species_id ?? ''}
            onchange={(id) => (draft.species_id = id || undefined)}
            placeholder="— Inconnue —"
          />
        {:else}
          <p class="text-sm text-gray-300 italic">
            {species ? `${species.genus} ${species.species}${species.cultivar ? ` '${species.cultivar}'` : ''}` : plant.species_id ?? '—'}
          </p>
        {/if}
      </div>

      <!-- Location -->
      <div>
        <label class="label" for="location">
          <MapPin class="w-3 h-3 inline mr-1" />Emplacement
        </label>
        {#if editing}
          <input id="location" bind:value={draft.location} class="input" placeholder="ex: Salon – Étagère Est" />
        {:else}
          <p class="text-sm text-gray-300">{plant.location ?? '—'}</p>
        {/if}
      </div>

      <!-- Added at -->
      <div>
        <label class="label">
          <Calendar class="w-3 h-3 inline mr-1" />Date d'acquisition
        </label>
        {#if editing}
          <input type="date" bind:value={draft.added_at} class="input" />
        {:else}
          <p class="text-sm text-gray-300">{formatDate(plant.added_at)}</p>
        {/if}
      </div>

      <!-- Last repotting -->
      <div>
        <label class="label" for="last_repotting">Dernier rempotage</label>
        {#if editing}
          <input id="last_repotting" type="date" bind:value={draft.last_repotting_at} class="input" />
        {:else}
          <p class="text-sm text-gray-300">{plant.last_repotting_at ? formatDate(plant.last_repotting_at) : '—'}</p>
        {/if}
      </div>

      <!-- Pot -->
      <div>
        <label class="label" for="pot_size">Pot</label>
        {#if editing}
          <div class="flex gap-2">
            <input
              id="pot_size"
              type="number"
              bind:value={draft.pot!.size_cm}
              class="input w-24"
              placeholder="Ø cm"
              min="1"
            />
            <select bind:value={draft.pot!.material} class="select">
              <option value="terracotta">Terre cuite</option>
              <option value="plastic">Plastique</option>
              <option value="ceramic">Céramique</option>
              <option value="other">Autre</option>
            </select>
          </div>
        {:else}
          <p class="text-sm text-gray-300">
            {plant.pot ? `Ø ${plant.pot.size_cm} cm – ${plant.pot.material}` : '—'}
          </p>
        {/if}
      </div>

      <!-- Tags -->
      <div class="md:col-span-2">
        <label class="label">
          <Tag class="w-3 h-3 inline mr-1" />Tags
        </label>
        {#if editing}
          <input
            bind:value={draft.tags}
            class="input"
            placeholder="séparés par des virgules"
            onchange={(e) => {
              draft.tags = tagsFromString((e.target as HTMLInputElement).value);
            }}
          />
          <p class="text-xs text-gray-600 mt-1">Séparés par des virgules</p>
        {:else}
          <div class="flex flex-wrap gap-1">
            {#each plant.tags as tag}
              <span class="text-xs bg-surface-3 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>
            {/each}
            {#if plant.tags.length === 0}
              <span class="text-sm text-gray-600">Aucun tag</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Rappels -->
      <div class="md:col-span-2 space-y-2">
        <div class="flex items-center justify-between">
          <span class="label flex items-center gap-1.5">
            <Bell class="w-3 h-3" />Rappels
          </span>
          {#if !editing}
            <button onclick={() => (addingReminder = !addingReminder)} class="btn btn-ghost h-7 px-2 text-xs">
              <Plus class="w-3 h-3" />Ajouter
            </button>
          {/if}
        </div>

        {#if addingReminder && !editing}
          <div class="card p-3 space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <select bind:value={newReminder.type} class="select text-xs h-8">
                <option value="watering">Arrosage</option>
                <option value="repotting">Rempotage</option>
                <option value="fertilizing">Fertilisation</option>
                <option value="other">Autre</option>
              </select>
              <input type="date" bind:value={newReminder.due_date} class="input text-xs h-8" />
            </div>
            {#if newReminder.type === 'other'}
              <input bind:value={newReminder.label} class="input text-xs h-8" placeholder="Description..." />
            {/if}
            <div class="flex gap-2 justify-end">
              <button onclick={() => (addingReminder = false)} class="btn btn-ghost h-7 px-2 text-xs">Annuler</button>
              <button onclick={addReminder} class="btn btn-primary h-7 px-2 text-xs" disabled={!newReminder.due_date}>
                <Check class="w-3 h-3" />Créer
              </button>
            </div>
          </div>
        {/if}

        {#if reminders.length > 0}
          <ul class="space-y-1">
            {#each reminders.sort((a, b) => a.due_date.localeCompare(b.due_date)) as r (r.id)}
              {@const RIcon = reminderIcon[r.type] ?? Bell}
              {@const overdue = !r.done && r.due_date < today}
              <li class={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm', r.done ? 'opacity-50' : overdue ? 'bg-accent-red/10' : 'bg-surface-2'].join(' ')}>
                <RIcon class="w-3.5 h-3.5 flex-shrink-0 {overdue ? 'text-accent-red' : 'text-gray-500'}" />
                <span class={['flex-1', r.done ? 'line-through text-gray-600' : ''].join(' ')}>
                  {r.label ?? reminderTypeLabel[r.type]}
                </span>
                <span class="text-xs {overdue ? 'text-accent-red font-medium' : 'text-gray-500'}">{formatDate(r.due_date)}</span>
                {#if !editing}
                  <button onclick={() => toggleReminder(r.id, !r.done)} class="p-1 rounded text-gray-500 hover:text-accent-green transition-colors">
                    <Check class="w-3.5 h-3.5" />
                  </button>
                  <button onclick={() => deleteReminder(r.id)} class="p-1 rounded text-gray-500 hover:text-accent-red transition-colors">
                    <X class="w-3.5 h-3.5" />
                  </button>
                {/if}
              </li>
            {/each}
          </ul>
        {:else if !addingReminder}
          <p class="text-xs text-gray-600">Aucun rappel.</p>
        {/if}
      </div>

      <!-- Species care tips -->
      {#if species}
        <div class="md:col-span-2 card p-4 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <FlaskConical class="w-4 h-4 text-accent-green" />
            Conseils d'entretien
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <Sun class="w-4 h-4 text-accent-amber flex-shrink-0" />
              <span class="text-gray-400">{getLightLabel(species.care_tips.light)}</span>
            </div>
            <div class="flex items-center gap-2">
              <Droplets class="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span class="text-gray-400">{getWaterLabel(species.care_tips.water)}</span>
            </div>
            <div class="flex items-center gap-2">
              <Wind class="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span class="text-gray-400">Humidité {getHumidityLabel(species.care_tips.humidity)}</span>
            </div>
          </div>
          {#if species.care_tips.substrate_mix}
            <p class="text-xs text-gray-500">
              <span class="font-medium text-gray-400">Substrat :</span> {species.care_tips.substrate_mix}
            </p>
          {/if}
        </div>
      {/if}
    </div>

  {:else if activeTab === 'journal'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-300">Journal de bord</h2>
        <button onclick={() => (addingEntry = !addingEntry)} class="btn btn-ghost h-8 px-3 text-xs">
          <Plus class="w-3 h-3" />
          Nouvelle entrée
        </button>
      </div>

      {#if addingEntry}
        <div class="card p-4 space-y-3">
          <textarea
            bind:value={journalEntry}
            class="input resize-none h-32"
            placeholder="Observations du jour..."
          ></textarea>
          <div class="flex gap-2 justify-end">
            <button onclick={() => (addingEntry = false)} class="btn btn-ghost h-8 px-3 text-xs">
              Annuler
            </button>
            <button onclick={addJournalEntry} class="btn btn-primary h-8 px-3 text-xs" disabled={!journalEntry.trim()}>
              <Save class="w-3 h-3" />
              Enregistrer
            </button>
          </div>
        </div>
      {/if}

      {#if journal.trim()}
        <div class="card p-4 prose prose-invert prose-sm max-w-none">
          {@html marked(journal)}
        </div>
      {:else}
        <div class="text-center text-gray-600 py-10">
          <FileText class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">Le journal est vide. Ajoutez votre première observation !</p>
        </div>
      {/if}
    </div>

  {:else if activeTab === 'photos'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-300">{photos.length} photo{photos.length > 1 ? 's' : ''}</h2>
        <label class={['btn btn-primary h-8 px-3 text-xs cursor-pointer', uploadingPhoto ? 'opacity-70' : ''].join(' ')}>
          <Camera class="w-3 h-3" />
          {uploadingPhoto ? 'Envoi...' : 'Ajouter'}
          <input
            type="file"
            accept="image/*"
            onchange={uploadPhoto}
            disabled={uploadingPhoto}
          />
        </label>
      </div>

      {#if photos.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {#each photos as photo (photo.filename)}
            <div class="relative group aspect-square rounded-lg overflow-hidden bg-surface-2">
              <img src={photo.url} alt={photo.filename} class="w-full h-full object-cover" loading="lazy" />

              <!-- Overlay actions -->
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {#if !photo.is_cover}
                  <button
                    onclick={() => setCover(photo.filename)}
                    class="p-1.5 rounded-lg bg-surface-1/80 text-accent-amber hover:text-yellow-300 transition-colors"
                    title="Définir comme photo principale"
                  >
                    <Star class="w-4 h-4" />
                  </button>
                {:else}
                  <button
                    onclick={() => (cropModalPhoto = photo)}
                    class="p-1.5 rounded-lg bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30 transition-colors"
                    title="Recadrer la cover"
                  >
                    <Crop class="w-4 h-4" />
                  </button>
                {/if}
                <button
                  onclick={() => startEditDate(photo.filename, photo.taken_at)}
                  class="p-1.5 rounded-lg bg-surface-1/80 text-gray-300 hover:text-white transition-colors"
                  title="Modifier la date"
                >
                  <CalendarDays class="w-4 h-4" />
                </button>
                <button
                  onclick={() => deletePhoto(photo.filename)}
                  class="p-1.5 rounded-lg bg-surface-1/80 text-accent-red hover:text-red-300 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <!-- Date edit inline -->
              {#if editingDateFor === photo.filename}
                <div class="absolute inset-x-0 bottom-0 bg-surface-1/95 p-2 flex gap-1">
                  <input
                    type="date"
                    bind:value={editingDateValue}
                    class="input h-7 text-xs flex-1 px-2"
                  />
                  <button onclick={() => saveTakenAt(photo.filename)} class="btn btn-primary h-7 px-2 text-xs">
                    <Save class="w-3 h-3" />
                  </button>
                  <button onclick={() => (editingDateFor = null)} class="btn btn-ghost h-7 px-2 text-xs">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              {:else if photo.taken_at}
                <div class="absolute bottom-1 right-1">
                  <span class="text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded">
                    {formatDate(photo.taken_at)}
                  </span>
                </div>
              {/if}

              {#if photo.is_cover}
                <div class="absolute bottom-1 left-1">
                  <span class="text-xs bg-accent-amber/80 text-black px-1.5 py-0.5 rounded font-medium">
                    Principale
                  </span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center text-gray-600 py-10">
          <Image class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">Aucune photo. Ajoutez-en une !</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
