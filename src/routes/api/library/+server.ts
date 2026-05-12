import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Species } from '$lib/types';
import {
  ensureDataDirs,
  readJsonFile,
  writeJsonFile,
  listFiles,
  LIBRARY_DIR,
  libraryPath
} from '$lib/server/fs-utils';
import path from 'path';

export const GET: RequestHandler = async ({ url }) => {
  await ensureDataDirs();

  const search = url.searchParams.get('q')?.toLowerCase();

  const files = await listFiles(LIBRARY_DIR);
  const species: Species[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = await readJsonFile<Species>(path.join(LIBRARY_DIR, file));
    if (!data) continue;

    if (search) {
      const searchable = [data.id, data.genus, data.species, data.cultivar, ...data.common_names]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(search)) continue;
    }

    species.push(data);
  }

  species.sort((a, b) => a.genus.localeCompare(b.genus));

  return json(species);
};

export const POST: RequestHandler = async ({ request }) => {
  await ensureDataDirs();

  const data = await request.json() as Species;
  if (!data.id) error(400, 'ID manquant');

  await writeJsonFile(libraryPath(data.id), data);

  return json(data, { status: 201 });
};
