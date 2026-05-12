import type { PageServerLoad } from './$types';
import type { Plant } from '$lib/types';
import {
  ensureDataDirs,
  listDirectories,
  readJsonFile,
  plantDataPath,
  PLANTS_DIR
} from '$lib/server/fs-utils';
import { getPhotoUrl } from '$lib/utils';

export const load: PageServerLoad = async ({ url }) => {
  await ensureDataDirs();

  const dirs = await listDirectories(PLANTS_DIR);
  const plants: (Plant & { main_photo_url?: string })[] = [];

  for (const dir of dirs) {
    const data = await readJsonFile<Plant>(plantDataPath(dir));
    if (!data) continue;
    plants.push({
      ...data,
      main_photo_url: data.main_photo_filename
        ? getPhotoUrl(data.id, data.main_photo_filename)
        : undefined
    });
  }

  return { plants };
};
