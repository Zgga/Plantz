<script lang="ts">
  import { page } from '$app/stores';
  import { Leaf, AlertTriangle, Home } from 'lucide-svelte';
</script>

<div class="flex flex-col items-center justify-center min-h-full px-4 py-16 text-center">
  <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-green/10 mb-6">
    {#if $page.status === 404}
      <Leaf class="w-8 h-8 text-accent-green opacity-50" />
    {:else}
      <AlertTriangle class="w-8 h-8 text-accent-red" />
    {/if}
  </div>

  <p class="text-6xl font-bold text-gray-600 mb-3">{$page.status}</p>

  <h1 class="text-xl font-semibold text-gray-100 mb-2">
    {#if $page.status === 404}
      Page introuvable
    {:else if $page.status === 500}
      Erreur serveur
    {:else}
      Une erreur est survenue
    {/if}
  </h1>

  <p class="text-sm text-gray-400 mb-8 max-w-xs">
    {#if $page.status === 404}
      Cette page n'existe pas ou a été déplacée.
    {:else}
      {$page.error?.message ?? 'Quelque chose s\'est mal passé.'}
    {/if}
  </p>

  <a href="/" class="btn-primary">
    <Home class="w-4 h-4" />
    Retour à la collection
  </a>
</div>
