import type { PageServerLoad } from './$types';
import type { Plant, Species } from '$lib/types';
import {
  ensureDataDirs,
  listDirectories,
  listFiles,
  readJsonFile,
  plantDataPath,
  libraryPath,
  PLANTS_DIR,
  LIBRARY_DIR
} from '$lib/server/fs-utils';
import { getPhotoUrl } from '$lib/utils';

export const load: PageServerLoad = async () => {
  await ensureDataDirs();

  // Index des catégories par species_id
  const categoryMap = new Map<string, string[]>();
  const libraryFiles = await listFiles(LIBRARY_DIR);
  for (const file of libraryFiles) {
    if (!file.endsWith('.json')) continue;
    const id = file.slice(0, -5);
    const sp = await readJsonFile<Species>(libraryPath(id));
    if (sp?.categories?.length) categoryMap.set(id, sp.categories);
  }

  const dirs = await listDirectories(PLANTS_DIR);
  const plants: (Plant & { main_photo_url?: string; species_categories: string[] })[] = [];

  for (const dir of dirs) {
    const data = await readJsonFile<Plant>(plantDataPath(dir));
    if (!data) continue;
    plants.push({
      ...data,
      main_photo_url: data.main_photo_filename
        ? getPhotoUrl(data.id, data.main_photo_filename)
        : undefined,
      species_categories: data.species_id ? (categoryMap.get(data.species_id) ?? []) : []
    });
  }

  return { plants };
};
