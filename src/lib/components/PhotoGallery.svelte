<script lang="ts">
  import { ChevronLeft, ChevronRight, Star, Crop, CalendarDays, Scan, Trash2, Save, X } from 'lucide-svelte';
  import { formatDate } from '$lib/utils';

  interface Photo {
    filename: string;
    url: string;
    is_cover: boolean;
    taken_at: string | null;
  }

  interface Props {
    photos: Photo[];
    plantId: string;
    onSetCover: (filename: string) => void;
    onCropCover: (photo: Photo) => void;
    onEditDate: (filename: string, currentDate: string | null) => void;
    onIdentify: (filename: string) => void;
    onDelete: (filename: string) => void;
    onOpenLightbox: (photo: Photo) => void;
    editingDateFor: string | null;
    editingDateValue: string;
    onSaveDate: (filename: string) => void;
    onCancelDate: () => void;
    onDateValueChange: (val: string) => void;
  }

  let {
    photos,
    plantId,
    onSetCover,
    onCropCover,
    onEditDate,
    onIdentify,
    onDelete,
    onOpenLightbox,
    editingDateFor,
    editingDateValue,
    onSaveDate,
    onCancelDate,
    onDateValueChange
  }: Props = $props();

  let currentIndex = $state(0);
  let containerEl = $state<HTMLDivElement | null>(null);
  let thumbsEl = $state<HTMLDivElement | null>(null);

  // Swipe state
  let pointerStartX = $state(0);
  let pointerStartY = $state(0);
  let swiping = $state(false);
  let swipeDeltaX = $state(0);

  const currentPhoto = $derived(photos[currentIndex]);

  // Clamp index if photos shrink (deletion)
  $effect(() => {
    if (photos.length > 0 && currentIndex >= photos.length) {
      currentIndex = photos.length - 1;
    }
  });

  // Scroll active thumb into view
  $effect(() => {
    if (!thumbsEl) return;
    const thumb = thumbsEl.children[currentIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });

  function thumbUrl(filename: string): string {
    const thumbFilename = filename.replace(/(\.[^.]+)$/, '_thumb$1');
    return `/api/plants/${plantId}/photos/${encodeURIComponent(thumbFilename)}`;
  }

  function prev() {
    if (currentIndex > 0) currentIndex--;
  }

  function next() {
    if (currentIndex < photos.length - 1) currentIndex++;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    swipeDeltaX = 0;
    swiping = false;
  }

  function onPointerMove(e: PointerEvent) {
    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    if (!swiping && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      swiping = true;
    }
    if (swiping) {
      e.preventDefault();
      swipeDeltaX = dx;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (swiping) {
      if (swipeDeltaX < -50) next();
      else if (swipeDeltaX > 50) prev();
    } else if (Math.abs(swipeDeltaX) < 8 && currentPhoto) {
      // Tap (not a swipe) → open lightbox
      onOpenLightbox(currentPhoto);
    }
    swiping = false;
    swipeDeltaX = 0;
  }

  function onPointerCancel() {
    swiping = false;
    swipeDeltaX = 0;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="space-y-2">
  <!-- Main image -->
  <div
    bind:this={containerEl}
    class="relative aspect-video rounded-xl overflow-hidden bg-surface-2 touch-pan-y select-none cursor-grab active:cursor-grabbing"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerCancel}
    role="img"
    aria-label={currentPhoto ? `Photo ${currentIndex + 1} sur ${photos.length}` : 'Aucune photo'}
  >
    {#if currentPhoto}
      <img
        src={currentPhoto.url}
        alt={`Photo ${currentIndex + 1}`}
        class="w-full h-full object-cover pointer-events-none"
        class:transition-transform={!swiping}
        style={swiping ? `transform: translateX(${swipeDeltaX}px)` : ''}
        draggable="false"
        loading="lazy"
      />

      <!-- Prev / Next buttons -->
      {#if currentIndex > 0}
        <button
          onclick={(e) => { e.stopPropagation(); prev(); }}
          class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Photo précédente"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
      {/if}
      {#if currentIndex < photos.length - 1}
        <button
          onclick={(e) => { e.stopPropagation(); next(); }}
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Photo suivante"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      {/if}

      <!-- Counter -->
      <div class="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none">
        <span class="text-xs bg-black/60 text-gray-300 px-2 py-0.5 rounded-full">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      <!-- Date label -->
      {#if currentPhoto.taken_at && editingDateFor !== currentPhoto.filename}
        <div class="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none">
          <span class="text-xs bg-black/60 text-gray-300 px-2 py-0.5 rounded-full">
            {formatDate(currentPhoto.taken_at)}
          </span>
        </div>
      {/if}

      <!-- Action bar -->
      {#if editingDateFor === currentPhoto.filename}
        <!-- Date edit overlay -->
        <div class="absolute inset-x-0 bottom-0 bg-surface-1/95 p-2 flex gap-1 z-10" onclick={(e) => e.stopPropagation()}>
          <input
            type="date"
            value={editingDateValue}
            oninput={(e) => onDateValueChange((e.target as HTMLInputElement).value)}
            class="input h-7 text-xs flex-1 px-2"
          />
          <button onclick={() => onSaveDate(currentPhoto.filename)} class="btn btn-primary h-7 px-2 text-xs">
            <Save class="w-3 h-3" />
          </button>
          <button onclick={onCancelDate} class="btn btn-ghost h-7 px-2 text-xs">
            <X class="w-3 h-3" />
          </button>
        </div>
      {:else}
        <div
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-end gap-2 z-10"
          onclick={(e) => e.stopPropagation()}
        >
          {#if currentPhoto.is_cover}
            <span class="text-xs bg-accent-amber/80 text-black px-1.5 py-0.5 rounded font-medium self-end mr-auto">
              Principale
            </span>
            <button
              onclick={() => onCropCover(currentPhoto)}
              class="p-1.5 rounded-lg bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30 transition-colors"
              title="Recadrer la cover"
            >
              <Crop class="w-4 h-4" />
            </button>
          {:else}
            <button
              onclick={() => onSetCover(currentPhoto.filename)}
              class="p-1.5 rounded-lg bg-surface-1/80 text-accent-amber hover:text-yellow-300 transition-colors"
              title="Définir comme photo principale"
            >
              <Star class="w-4 h-4" />
            </button>
          {/if}
          <button
            onclick={() => onEditDate(currentPhoto.filename, currentPhoto.taken_at)}
            class="p-1.5 rounded-lg bg-surface-1/80 text-gray-300 hover:text-white transition-colors"
            title="Modifier la date"
          >
            <CalendarDays class="w-4 h-4" />
          </button>
          <button
            onclick={() => onIdentify(currentPhoto.filename)}
            class="p-1.5 rounded-lg bg-surface-1/80 text-gray-300 hover:text-accent-green transition-colors"
            title="Identifier"
          >
            <Scan class="w-4 h-4" />
          </button>
          <button
            onclick={() => onDelete(currentPhoto.filename)}
            class="p-1.5 rounded-lg bg-surface-1/80 text-accent-red hover:text-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Thumbnail strip -->
  {#if photos.length > 1}
    <div
      bind:this={thumbsEl}
      class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
    >
      {#each photos as photo, i (photo.filename)}
        <button
          onclick={() => (currentIndex = i)}
          class={[
            'flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-2 transition-all',
            i === currentIndex ? 'ring-2 ring-accent-green opacity-100' : 'opacity-60 hover:opacity-90'
          ].join(' ')}
          aria-label={`Aller à la photo ${i + 1}`}
        >
          <img
            src={thumbUrl(photo.filename)}
            alt={`Miniature ${i + 1}`}
            class="w-full h-full object-cover"
            loading="lazy"
            draggable="false"
          />
        </button>
      {/each}
    </div>
  {/if}
</div>
