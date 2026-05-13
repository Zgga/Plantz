import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  readJsonFile,
  appendMarkdownFile,
  writeMarkdownFile,
  plantDataPath,
  plantJournalPath
} from '$lib/server/fs-utils';

export const POST: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const plant = await readJsonFile(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const { content } = await request.json();
  if (!content?.trim()) error(400, 'Contenu manquant');
  if (content.length > 50_000) error(413, 'Contenu trop long (max 50 000 caractères)');

  const now = new Date();
  const dateStr = now.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const entry = `### ${dateStr}\n\n${content.trim()}`;
  await appendMarkdownFile(plantJournalPath(id), entry);

  return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  const plant = await readJsonFile(plantDataPath(id));
  if (!plant) error(404, 'Plante introuvable');

  const { content } = await request.json();
  await writeMarkdownFile(plantJournalPath(id), content ?? '');

  return json({ success: true });
};
