import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { libraryPath, pathExists, writeJsonFile, readJsonFile } from '$lib/server/fs-utils';
import { fetchPlantBookDetails, mapToCareTips } from '$lib/server/openplantbook';
import { slugify } from '$lib/utils';
import type { Species } from '$lib/types';

const DEFAULT_CARE_TIPS: Species['care_tips'] = {
  light: 'medium',
  water: 'dry-between-watering',
  humidity: 'medium',
  temperature_min_celsius: 10,
  temperature_max_celsius: 30,
  substrate_mix: 'Terreau standard',
  fertilization_frequency_months: 2
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { genus, species, common_names, family, notes, enrich } = body;

  if (!genus || !species) error(400, 'genus et species requis');

  const id = slugify(`${genus}-${species}`);
  const filePath = libraryPath(id);

  if (pathExists(filePath)) {
    const existing = await readJsonFile<Species>(filePath);
    return json({ id, species: existing, created: false });
  }

  let careTips = { ...DEFAULT_CARE_TIPS };

  if (enrich && env.OPENPLANTBOOK_CLIENT_ID) {
    const raw = await fetchPlantBookDetails(genus, species, env.OPENPLANTBOOK_CLIENT_ID, env.OPENPLANTBOOK_CLIENT_SECRET ?? '');
    if (raw) {
      const partial = mapToCareTips(raw);
      careTips = { ...careTips, ...partial };
    }
  }

  const newSpecies: Species = {
    id,
    genus,
    species,
    common_names: common_names ?? [],
    family: family ?? '',
    notes: notes ?? undefined,
    care_tips: careTips
  };

  await writeJsonFile(filePath, newSpecies);
  return json({ id, species: newSpecies, created: true });
};
