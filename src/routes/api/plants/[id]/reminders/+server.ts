import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomUUID } from 'crypto';
import { readJsonFile, writeJsonFile, plantDataPath } from '$lib/server/fs-utils';
import type { Plant, Reminder } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
  const plant = await readJsonFile<Plant>(plantDataPath(params.id));
  if (!plant) error(404, 'Plante introuvable');
  return json(plant.reminders ?? []);
};

export const POST: RequestHandler = async ({ params, request }) => {
  const plant = await readJsonFile<Plant>(plantDataPath(params.id));
  if (!plant) error(404, 'Plante introuvable');

  const body = await request.json() as Omit<Reminder, 'id' | 'done'>;
  const reminder: Reminder = { id: randomUUID(), done: false, ...body };

  plant.reminders = [...(plant.reminders ?? []), reminder];
  await writeJsonFile(plantDataPath(params.id), plant);

  return json(reminder, { status: 201 });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const plant = await readJsonFile<Plant>(plantDataPath(params.id));
  if (!plant) error(404, 'Plante introuvable');

  const { id, ...updates } = await request.json() as Partial<Reminder> & { id: string };
  if (!id) error(400, 'id manquant');

  plant.reminders = (plant.reminders ?? []).map((r) =>
    r.id === id ? { ...r, ...updates } : r
  );
  await writeJsonFile(plantDataPath(params.id), plant);

  return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  const plant = await readJsonFile<Plant>(plantDataPath(params.id));
  if (!plant) error(404, 'Plante introuvable');

  const { id } = await request.json() as { id: string };
  plant.reminders = (plant.reminders ?? []).filter((r) => r.id !== id);
  await writeJsonFile(plantDataPath(params.id), plant);

  return new Response(null, { status: 204 });
};
