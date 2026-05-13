import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Plant } from '$lib/types';
import {
  readJsonFile,
  writeJsonFile,
  listDirectories,
  createDirectory,
  plantDataPath,
  plantPhotosDir,
  PLANTS_DIR
} from '$lib/server/fs-utils';

async function nextNickname(base: string): Promise<string> {
  const stripped = base.replace(/\s+\d+$/, '').trim();
  const dirs = await listDirectories(PLANTS_DIR);
  const taken = new Set<string>();
  for (const dir of dirs) {
    const p = await readJsonFile<Plant>(path.join(PLANTS_DIR, dir, 'data.json'));
    if (p?.nickname) taken.add(p.nickname);
  }
  if (!taken.has(stripped)) return stripped;
  for (let i = 2; i < 99; i++) {
    const candidate = `${stripped} ${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${stripped} ${Date.now()}`;
}

export const POST: RequestHandler = async ({ params }) => {
  const source = await readJsonFile<Plant>(plantDataPath(params.id));
  if (!source) error(404, 'Plante introuvable');

  const newId = `plant-${uuidv4().slice(0, 8)}`;
  const newNickname = await nextNickname(source.nickname);

  const newPlant: Plant = {
    ...source,
    id: newId,
    nickname: newNickname,
    reminders: [],
    photos_metadata: undefined,
    metadata: undefined,
    main_photo_filename: undefined
  };

  await createDirectory(plantPhotosDir(newId));

  // Copie la cover + son thumb dans le nouveau dossier
  if (source.main_photo_filename) {
    const srcDir = plantPhotosDir(params.id);
    const dstDir = plantPhotosDir(newId);
    const filename = source.main_photo_filename;
    const thumbName = filename.replace(/(\.[^.]+)$/, '_thumb$1');

    try {
      await fs.copyFile(path.join(srcDir, filename), path.join(dstDir, filename));
      newPlant.main_photo_filename = filename;

      // taken_at de la cover uniquement
      const coverMeta = source.photos_metadata?.[filename];
      if (coverMeta) newPlant.photos_metadata = { [filename]: coverMeta };
    } catch {
      // photo source absente : on continue sans cover
    }

    try {
      await fs.copyFile(path.join(srcDir, thumbName), path.join(dstDir, thumbName));
    } catch {
      // thumb absent : pas bloquant
    }
  }

  await writeJsonFile(plantDataPath(newId), newPlant);
  console.log(`[Clone] ${params.id} → ${newId} ("${newNickname}")`);

  return json({ id: newId, plant: newPlant }, { status: 201 });
};
