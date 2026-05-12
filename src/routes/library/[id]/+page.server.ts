import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Species } from '$lib/types';
import { readJsonFile, libraryPath } from '$lib/server/fs-utils';

export const load: PageServerLoad = async ({ params }) => {
  const species = await readJsonFile<Species>(libraryPath(params.id));
  if (!species) error(404, 'Espèce introuvable');
  return { species };
};
