import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Plant } from '$lib/types';
import {
  readJsonFile,
  writeJsonFile,
  readMarkdownFile,
  listFiles,
  deleteDirectory,
  plantDataPath,
  plantDir,
  plantJournalPath,
  plantPhotosDir,
  assertSafeId
} from '$lib/server/fs-utils';
import { getPhotoUrl, isImageFile } from '$lib/utils';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  assertSafeId(id);
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const journal = await readMarkdownFile(plantJournalPath(id));
  const photoFiles = await listFiles(plantPhotosDir(id));
  const photos = photoFiles.filter(isImageFile).map((f) => ({
    filename: f,
    url: getPhotoUrl(id, f)
  }));

  return json({ ...plant, journal, photos });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  assertSafeId(id);
  const existing = await readJsonFile<Plant>(plantDataPath(id));
  if (!existing) error(404, 'Plante introuvable');

  const updates = await request.json();

  // Prevent overwriting immutable fields
  delete updates.id;
  delete updates.added_at;

  const updated: Plant = { ...existing, ...updates };
  await writeJsonFile(plantDataPath(id), updated);

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const { id } = params;
  assertSafeId(id);
  const existing = await readJsonFile<Plant>(plantDataPath(id));
  if (!existing) error(404, 'Plante introuvable');

  await deleteDirectory(plantDir(id));

  return json({ success: true });
};
