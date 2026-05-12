<script lang="ts">
  import { Settings, FolderOpen, Tag, Download } from 'lucide-svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function exportData() {
    window.open('/api/plants', '_blank');
  }
</script>

<div class="px-4 py-6 max-w-2xl mx-auto space-y-6">
  <div class="flex items-center gap-3 mb-2">
    <Settings class="w-5 h-5 text-accent-green" />
    <h1 class="text-xl font-semibold">Paramètres</h1>
  </div>

  <!-- Infos système -->
  <section class="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
    <div class="px-4 py-3 border-b border-surface-3">
      <h2 class="text-sm font-medium text-gray-300">Informations système</h2>
    </div>

    <dl class="divide-y divide-surface-3">
      <div class="flex items-center gap-3 px-4 py-3">
        <FolderOpen class="w-4 h-4 text-gray-500 flex-shrink-0" />
        <dt class="text-sm text-gray-400 w-32 flex-shrink-0">Répertoire data</dt>
        <dd class="text-sm text-gray-100 font-mono truncate" title={data.dataDir}>{data.dataDir}</dd>
      </div>

      <div class="flex items-center gap-3 px-4 py-3">
        <Tag class="w-4 h-4 text-gray-500 flex-shrink-0" />
        <dt class="text-sm text-gray-400 w-32 flex-shrink-0">Version</dt>
        <dd class="text-sm text-gray-100 font-mono">v{data.version}</dd>
      </div>
    </dl>
  </section>

  <!-- Export -->
  <section class="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
    <div class="px-4 py-3 border-b border-surface-3">
      <h2 class="text-sm font-medium text-gray-300">Données</h2>
    </div>

    <div class="px-4 py-4 space-y-3">
      <p class="text-sm text-gray-400">
        Exporte la liste de toutes vos plantes au format JSON.
      </p>
      <button onclick={exportData} class="btn-ghost border border-surface-3 gap-2">
        <Download class="w-4 h-4" />
        Exporter les plantes (JSON)
      </button>
    </div>
  </section>
</div>
