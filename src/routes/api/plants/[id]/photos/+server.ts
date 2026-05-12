import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import path from 'path';
import sharp from 'sharp';
import {
  readJsonFile,
  writeJsonFile,
  saveBuffer,
  listFiles,
  createDirectory,
  plantDataPath,
  plantPhotosDir
} from '$lib/server/fs-utils';
import { getPhotoUrl, isImageFile } from '$lib/utils';
import type { Plant } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const files = await listFiles(plantPhotosDir(id));
  const photos = files.filter((f) => isImageFile(f) && !f.includes('_thumb.')).map((f) => ({
    filename: f,
    url: getPhotoUrl(id, f),
    is_cover: f === plant.main_photo_filename,
    taken_at: plant.photos_metadata?.[f]?.taken_at ?? null
  }));

  return json(photos);
};

export const POST: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const formData = await request.formData();
  const file = formData.get('photo') as File | null;
  const setAsCover = formData.get('set_as_cover') === 'true';

  if (!file || file.size === 0) error(400, 'Aucun fichier fourni');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const filename = `${timestamp}.webp`;
  const thumbFilename = `${timestamp}_thumb.webp`;

  const photosDir = plantPhotosDir(id);
  await createDirectory(photosDir);

  const arrayBuffer = await file.arrayBuffer();
  const raw = Buffer.from(arrayBuffer);
  const img = sharp(raw);

  const [webp, thumb] = await Promise.all([
    img.clone().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    img.clone().resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer()
  ]);

  await Promise.all([
    saveBuffer(path.join(photosDir, filename), webp),
    saveBuffer(path.join(photosDir, thumbFilename), thumb)
  ]);

  const takenAt = new Date().toISOString().slice(0, 10);
  plant.photos_metadata = { ...plant.photos_metadata, [filename]: { taken_at: takenAt } };
  if (setAsCover || !plant.main_photo_filename) {
    plant.main_photo_filename = filename;
  }
  await writeJsonFile(plantDataPath(id), plant);

  return json(
    {
      filename,
      url: getPhotoUrl(id, filename),
      is_cover: plant.main_photo_filename === filename,
      taken_at: takenAt
    },
    { status: 201 }
  );
};
