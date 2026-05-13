import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import {
  readJsonFile,
  writeJsonFile,
  deleteFile,
  listFiles,
  plantDataPath,
  plantPhotosDir,
  assertSafeId,
  assertSafeFilename
} from '$lib/server/fs-utils';
import type { Plant } from '$lib/types';
import { isImageFile } from '$lib/utils';

export const GET: RequestHandler = async ({ params }) => {
  const { id, filename } = params;
  assertSafeId(id);
  assertSafeFilename(filename);

  if (!isImageFile(filename)) error(400, 'Type de fichier non supporté');

  const photosDir = plantPhotosDir(id);
  const filePath = path.join(photosDir, filename);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await fs.readFile(filePath) as unknown as Buffer;
  } catch {
    error(404, 'Photo introuvable');
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif'
  };

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': mimeMap[ext] ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const { id, filename } = params;
  assertSafeId(id);
  assertSafeFilename(filename);

  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const photosDir = plantPhotosDir(id);
  const thumbName = filename.replace(/(\.[^.]+)$/, '_thumb$1');
  await Promise.all([
    deleteFile(path.join(photosDir, filename)),
    deleteFile(path.join(photosDir, thumbName))
  ]);

  if (plant.photos_metadata?.[filename]) {
    const { [filename]: _, ...rest } = plant.photos_metadata;
    plant.photos_metadata = rest;
  }

  if (plant.main_photo_filename === filename) {
    const remaining = (await listFiles(photosDir)).filter((f) => isImageFile(f) && !f.includes('_thumb.') && f !== filename);
    plant.main_photo_filename = remaining[0] ?? undefined;
  }

  await writeJsonFile(plantDataPath(id), plant);

  return new Response(null, { status: 204 });
};

export const PUT: RequestHandler = async ({ params }) => {
  const { id, filename } = params;
  assertSafeId(id);
  assertSafeFilename(filename);

  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  plant.main_photo_filename = filename;
  await writeJsonFile(plantDataPath(id), plant);

  return new Response(null, { status: 204 });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const { id, filename } = params;
  assertSafeId(id);
  assertSafeFilename(filename);

  const plant = await readJsonFile<Plant>(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const body = await request.json() as { taken_at?: string };
  if (body.taken_at) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.taken_at)) error(400, 'Format de date invalide (YYYY-MM-DD attendu)');
    plant.photos_metadata = { ...plant.photos_metadata, [filename]: { taken_at: body.taken_at } };
    await writeJsonFile(plantDataPath(id), plant);
  }

  return new Response(null, { status: 204 });
};
