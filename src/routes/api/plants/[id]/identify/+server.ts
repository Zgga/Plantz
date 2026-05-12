import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';
import { plantDataPath, plantPhotosDir, readJsonFile } from '$lib/server/fs-utils';
import { identifyWithPlantNet } from '$lib/server/identification';
import type { Plant } from '$lib/types';

export const POST: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const { filename } = await request.json();
  if (!filename) error(400, 'filename requis');

  const photoPath = path.join(plantPhotosDir(id), filename);
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await fs.readFile(photoPath));
  } catch {
    error(404, 'Photo introuvable');
  }

  console.log(`[identify] filename="${filename}", PLANTNET_API_KEY présente: ${!!env.PLANTNET_API_KEY}`);

  try {
    const candidates = await identifyWithPlantNet(buffer, filename, env.PLANTNET_API_KEY ?? '');
    const bestScore = candidates[0]?.score ?? 0;
    return json({
      candidates,
      best_score: bestScore,
      needs_refinement: bestScore < 0.7
    });
  } catch (err) {
    console.error('[identify] PlantNet error:', err instanceof Error ? err.message : err);
    return json({ candidates: [], best_score: 0, needs_refinement: true });
  }
};
