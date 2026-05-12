import { json, error } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import type { RequestHandler } from './$types';
import type { Plant } from '$lib/types';
import {
  ensureDataDirs,
  listDirectories,
  readJsonFile,
  writeJsonFile,
  createDirectory,
  writeMarkdownFile,
  saveBuffer,
  plantDir,
  plantDataPath,
  plantJournalPath,
  plantPhotosDir,
  PLANTS_DIR
} from '$lib/server/fs-utils';
import { generateRandomNickname, getPhotoUrl, isImageFile } from '$lib/utils';
import { identifyWithPlantNet } from '$lib/server/identification';
import { env } from '$env/dynamic/private';
import path from 'path';

async function runBackgroundIdentification(plantId: string, buffer: Buffer, filename: string, apiKey: string) {
  try {
    const candidates = await identifyWithPlantNet(buffer, filename, apiKey);
    const top = candidates[0];
    if (!top || top.score < 0.15) return;
    const existing = await readJsonFile<Plant>(plantDataPath(plantId));
    if (!existing) return;
    await writeJsonFile(plantDataPath(plantId), {
      ...existing,
      metadata: {
        ...existing.metadata,
        pending_candidate: {
          scientific_name: top.scientificName,
          genus: top.genus,
          common_names: top.commonNames,
          score: top.score
        }
      }
    });
    console.log(`[bg-identify] ${plantId} → ${top.scientificName} (${Math.round(top.score * 100)}%)`);
  } catch (err) {
    console.error('[bg-identify] erreur:', err instanceof Error ? err.message : err);
  }
}

export const GET: RequestHandler = async ({ url }) => {
  await ensureDataDirs();

  const locationFilter = url.searchParams.get('location');
  const statusFilter = url.searchParams.get('status');
  const speciesFilter = url.searchParams.get('species_id');
  const tagFilter = url.searchParams.get('tag');
  const sortField = url.searchParams.get('sort') ?? 'added_at';
  const sortOrder = url.searchParams.get('order') ?? 'desc';
  const search = url.searchParams.get('q')?.toLowerCase();

  const dirs = await listDirectories(PLANTS_DIR);
  const plants: (Plant & { main_photo_url?: string })[] = [];

  for (const dir of dirs) {
    const data = await readJsonFile<Plant>(plantDataPath(dir));
    if (!data) continue;

    if (locationFilter && data.location !== locationFilter) continue;
    if (statusFilter && data.status !== statusFilter) continue;
    if (speciesFilter && data.species_id !== speciesFilter) continue;
    if (tagFilter && !data.tags.includes(tagFilter)) continue;
    if (search) {
      const searchable = [data.nickname, data.location, data.species_id, ...data.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(search)) continue;
    }

    plants.push({
      ...data,
      main_photo_url: data.main_photo_filename
        ? getPhotoUrl(data.id, data.main_photo_filename)
        : undefined
    });
  }

  plants.sort((a, b) => {
    let av: string | number = (a as Record<string, unknown>)[sortField] as string ?? '';
    let bv: string | number = (b as Record<string, unknown>)[sortField] as string ?? '';
    if (typeof av === 'string' && typeof bv === 'string') {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
    }
    if (av < bv) return sortOrder === 'asc' ? -1 : 1;
    if (av > bv) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return json(plants);
};

export const POST: RequestHandler = async ({ request }) => {
  await ensureDataDirs();

  const contentType = request.headers.get('content-type') ?? '';
  let nickname = '';
  let species_id: string | undefined;
  let location: string | undefined;
  let tags: string[] = [];
  let photoBuffer: Buffer | undefined;
  let photoFilename: string | undefined;
  let formData: FormData | undefined;

  if (contentType.includes('multipart/form-data')) {
    formData = await request.formData();
    nickname = (formData.get('nickname') as string) || '';
    species_id = (formData.get('species_id') as string) || undefined;
    location = (formData.get('location') as string) || undefined;
    const tagsRaw = formData.get('tags') as string;
    tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const file = formData.get('photo') as File | null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      photoBuffer = Buffer.from(arrayBuffer);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      photoFilename = `cover.${ext}`;
    }
  } else {
    const body = await request.json().catch(() => ({}));
    nickname = body.nickname || '';
    species_id = body.species_id;
    location = body.location;
    tags = body.tags ?? [];
  }

  if (!nickname.trim()) {
    nickname = generateRandomNickname();
  }

  const id = `plant-${uuidv4().slice(0, 8)}`;
  const now = new Date().toISOString();

  const isQuickCapture = !species_id || !location;

  const plant: Plant = {
    id,
    species_id: species_id || undefined,
    nickname: nickname.trim(),
    status: isQuickCapture ? 'new' : 'ok',
    location: location || undefined,
    added_at: now,
    tags,
    main_photo_filename: photoFilename ?? ''
  };

  const dir = plantDir(id);
  const photosDir = plantPhotosDir(id);
  await createDirectory(dir);
  await createDirectory(photosDir);
  await writeJsonFile(plantDataPath(id), plant);
  await writeMarkdownFile(plantJournalPath(id), '');

  if (photoBuffer && photoFilename) {
    await saveBuffer(path.join(photosDir, photoFilename), photoBuffer);
  }

  // Quick snap = formData sans champ 'status' — identification en arrière-plan
  const isQuickSnap = contentType.includes('multipart/form-data') && !formData?.has('status');
  if (isQuickSnap && photoBuffer && photoFilename && env.PLANTNET_API_KEY) {
    runBackgroundIdentification(id, photoBuffer, photoFilename, env.PLANTNET_API_KEY).catch(() => {});
  }

  return json(
    {
      ...plant,
      main_photo_url: photoFilename ? getPhotoUrl(id, photoFilename) : undefined
    },
    { status: 201 }
  );
};
