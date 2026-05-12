import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { readJsonFile, writeJsonFile, libraryPath } from '$lib/server/fs-utils';
import { fetchPlantBookDetails, mapToCareTips } from '$lib/server/openplantbook';
import type { Species } from '$lib/types';

function mapToxicity(raw: string): Species['toxicity'] | undefined {
  const t = raw.toLowerCase();
  if (t.includes('non') || t === 'no' || t === 'false' || t === 'none') return 'non-toxic';
  if (t.includes('pet') && !t.includes('human')) return 'toxic-pets';
  if (t.includes('human') && !t.includes('pet')) return 'toxic-humans';
  if (t.includes('all') || t.includes('both') || t === 'yes' || t === 'true') return 'toxic-all';
  return undefined;
}

function mapGrowthRate(raw: string): Species['growth_rate'] | undefined {
  const g = raw.toLowerCase();
  if (g.includes('slow') || g.includes('lent')) return 'slow';
  if (g.includes('fast') || g.includes('rapid') || g.includes('rapide')) return 'fast';
  if (g.includes('medium') || g.includes('moderate') || g.includes('moyen')) return 'medium';
  return undefined;
}

export const POST: RequestHandler = async ({ params }) => {
  if (!env.OPENPLANTBOOK_CLIENT_ID) error(503, 'OpenPlantBook non configuré (OPENPLANTBOOK_CLIENT_ID manquant)');

  const existing = await readJsonFile<Species>(libraryPath(params.id));
  if (!existing) error(404, 'Espèce introuvable');

  const raw = await fetchPlantBookDetails(
    existing.genus,
    existing.species,
    env.OPENPLANTBOOK_CLIENT_ID,
    env.OPENPLANTBOOK_CLIENT_SECRET ?? ''
  );
  if (!raw) error(502, `Espèce "${existing.genus} ${existing.species}" non trouvée dans OpenPlantBook`);

  const updates: Partial<Species> = {};

  if (!existing.family && raw.family) updates.family = raw.family;
  if (!existing.origin && raw.origin) updates.origin = raw.origin;
  if (!existing.toxicity && raw.toxicity) {
    const mapped = mapToxicity(raw.toxicity);
    if (mapped) updates.toxicity = mapped;
  }
  if (!existing.growth_rate && raw.growth_rate) {
    const mapped = mapGrowthRate(raw.growth_rate);
    if (mapped) updates.growth_rate = mapped;
  }

  const careTipsPartial = mapToCareTips(raw);
  if (Object.keys(careTipsPartial).length > 0) {
    updates.care_tips = { ...existing.care_tips, ...careTipsPartial };
  }

  const updated: Species = { ...existing, ...updates };
  await writeJsonFile(libraryPath(params.id), updated);

  console.log(`[Enrich] ${params.id}: updated fields = ${Object.keys(updates).join(', ') || 'none'}`);
  return json({ species: updated, fields_updated: Object.keys(updates) });
};
