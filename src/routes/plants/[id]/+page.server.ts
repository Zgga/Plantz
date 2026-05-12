import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Plant, Species } from '$lib/types';
import {
  readJsonFile,
  readMarkdownFile,
  listFiles,
  plantDataPath,
  plantJournalPath,
  plantPhotosDir,
  LIBRARY_DIR,
  listDirectories,
  PLANTS_DIR
} from '$lib/server/fs-utils';
import { getPhotoUrl, isImageFile } from '$lib/utils';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const journal = await readMarkdownFile(plantJournalPath(id));
  const photoFiles = await listFiles(plantPhotosDir(id));
  const photos = photoFiles
    .filter((f) => isImageFile(f) && !f.includes('_thumb.'))
    .map((f) => ({
      filename: f,
      url: getPhotoUrl(id, f),
      is_cover: f === plant.main_photo_filename,
      taken_at: plant.photos_metadata?.[f]?.taken_at ?? null
    }))
    .sort((a, b) => (a.taken_at ?? a.filename).localeCompare(b.taken_at ?? b.filename));

  let species: Species | null = null;
  if (plant.species_id) {
    species = await readJsonFile<Species>(path.join(LIBRARY_DIR, `${plant.species_id}.json`));
  }

  // Load library for species autocomplete
  const libFiles = await listFiles(LIBRARY_DIR);
  const library: Species[] = [];
  for (const f of libFiles) {
    if (!f.endsWith('.json')) continue;
    const s = await readJsonFile<Species>(path.join(LIBRARY_DIR, f));
    if (s) library.push(s);
  }

  return { plant, species, journal, photos, library };
};
