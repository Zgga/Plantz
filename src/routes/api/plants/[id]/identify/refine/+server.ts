import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';
import { plantDataPath, plantPhotosDir, readJsonFile, writeJsonFile } from '$lib/server/fs-utils';
import { identifyWithClaude } from '$lib/server/identification';
import type { Plant } from '$lib/types';

export const POST: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const { filename } = await request.json();
  if (!filename) error(400, 'filename requis');

  // Retourner le cache si disponible
  const cached = plant.metadata?.identification_cache?.[filename]?.claude;
  if (cached) {
    console.log(`[identify/refine] Cache hit pour "${filename}"`);
    return json({ result: cached, cached: true });
  }

  const photoPath = path.join(plantPhotosDir(id), filename);
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await fs.readFile(photoPath));
  } catch {
    error(404, 'Photo introuvable');
  }

  console.log(`[identify/refine] filename="${filename}", ANTHROPIC_API_KEY présente: ${!!env.ANTHROPIC_API_KEY}`);

  try {
    const result = await identifyWithClaude(buffer, env.ANTHROPIC_API_KEY ?? '', filename);
    console.log('[identify/refine] Claude result:', result.genus, result.species, result.confidence);

    // Mise en cache dans plant.metadata
    const cache = plant.metadata?.identification_cache ?? {};
    cache[filename] = { ...(cache[filename] ?? {}), claude: { ...result, cached_at: new Date().toISOString() } };
    await writeJsonFile(plantDataPath(id), {
      ...plant,
      metadata: { ...plant.metadata, identification_cache: cache }
    });

    return json({ result, cached: false });
  } catch (err) {
    console.error('[identify/refine] Claude error:', err instanceof Error ? err.message : err);
    const message = err instanceof Error ? err.message : 'Erreur identification IA';
    error(502, message);
  }
};
