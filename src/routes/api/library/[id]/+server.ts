import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Species } from '$lib/types';
import { readJsonFile, writeJsonFile, deleteFile, libraryPath } from '$lib/server/fs-utils';

export const GET: RequestHandler = async ({ params }) => {
  const data = await readJsonFile<Species>(libraryPath(params.id));
  if (!data) error(404, 'Espèce introuvable');
  return json(data);
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const existing = await readJsonFile<Species>(libraryPath(params.id));
  if (!existing) error(404, 'Espèce introuvable');

  const updates = await request.json();
  const updated = { ...existing, ...updates, id: params.id };
  await writeJsonFile(libraryPath(params.id), updated);

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const existing = await readJsonFile<Species>(libraryPath(params.id));
  if (!existing) error(404, 'Espèce introuvable');

  await deleteFile(libraryPath(params.id));
  return new Response(null, { status: 204 });
};
