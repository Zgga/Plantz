<script lang="ts">
  import { X } from 'lucide-svelte';
  import { formatDate } from '$lib/utils';

  interface Props {
    photoUrl: string;
    takenAt: string | null;
    onClose: () => void;
  }

  let { photoUrl, takenAt, onClose }: Props = $props();
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onClose(); }} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
  role="dialog"
  aria-modal="true"
  onclick={onClose}
>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="relative max-w-full max-h-full p-4 flex items-center justify-center"
    onclick={(e) => e.stopPropagation()}
  >
    <img
      src={photoUrl}
      alt=""
      class="max-w-[100vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
    />

    {#if takenAt}
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <span class="text-xs bg-black/70 text-gray-300 px-2.5 py-1 rounded-full">
          {formatDate(takenAt)}
        </span>
      </div>
    {/if}

    <button
      onclick={onClose}
      class="absolute top-6 right-6 p-2 rounded-full bg-black/60 text-gray-300 hover:text-white hover:bg-black/80 transition-colors"
      aria-label="Fermer"
    >
      <X class="w-5 h-5" />
    </button>
  </div>
</div>
