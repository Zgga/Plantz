<script lang="ts">
  import { X, Check } from 'lucide-svelte';

  interface Props {
    photoUrl: string;
    position: { x: number; y: number };
    onSave: (pos: { x: number; y: number }) => void;
    onClose: () => void;
  }

  let { photoUrl, position, onSave, onClose }: Props = $props();

  let pos = $state({ ...position });
  let containerEl = $state<HTMLDivElement | null>(null);
  let dragging = $state(false);

  function setFocus(e: MouseEvent | TouchEvent) {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    pos = {
      x: Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)))
    };
  }

  function onMouseDown(e: MouseEvent) {
    dragging = true;
    setFocus(e);
  }
  function onMouseMove(e: MouseEvent) {
    if (dragging) setFocus(e);
  }
  function onMouseUp() { dragging = false; }

  function onTouchStart(e: TouchEvent) { setFocus(e); }
  function onTouchMove(e: TouchEvent) { e.preventDefault(); setFocus(e); }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
  role="dialog"
  aria-modal="true"
>
  <div class="bg-surface-1 border border-surface-3 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
    <div class="flex items-center justify-between px-4 py-3 border-b border-surface-3">
      <h2 class="text-sm font-semibold">Recadrer la photo principale</h2>
      <button onclick={onClose} class="p-1.5 rounded-lg text-gray-400 hover:bg-surface-3 hover:text-gray-100">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="p-4 space-y-3">
      <p class="text-xs text-gray-500">Cliquez ou glissez pour définir le point focal de la cover.</p>

      <!-- Photo interactive -->
      <div
        bind:this={containerEl}
        class="relative w-full overflow-hidden rounded-xl cursor-crosshair select-none"
        style="aspect-ratio: 16/9;"
        onmousedown={onMouseDown}
        ontouchstart={onTouchStart}
        ontouchmove={onTouchMove}
        role="button"
        tabindex="0"
        aria-label="Définir le point focal"
      >
        <img
          src={photoUrl}
          alt="Recadrage"
          class="w-full h-full object-cover pointer-events-none"
          style="object-position: {pos.x}% {pos.y}%"
          draggable="false"
        />
        <!-- Focal point marker -->
        <div
          class="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style="left: {pos.x}%; top: {pos.y}%"
        >
          <div class="w-full h-full rounded-full border-2 border-white shadow-lg bg-white/20"></div>
          <div class="absolute inset-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
        </div>
      </div>

      <p class="text-xs text-gray-600 text-center">Point focal : {pos.x}% / {pos.y}%</p>
    </div>

    <div class="flex gap-2 justify-end px-4 py-3 border-t border-surface-3">
      <button onclick={onClose} class="btn btn-ghost h-8 px-3 text-xs">Annuler</button>
      <button onclick={() => onSave(pos)} class="btn btn-primary h-8 px-3 text-xs">
        <Check class="w-3 h-3" />
        Appliquer
      </button>
    </div>
  </div>
</div>
