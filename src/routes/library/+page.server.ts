import type { PageServerLoad } from './$types';
import type { Species } from '$lib/types';
import { ensureDataDirs, listFiles, readJsonFile, LIBRARY_DIR } from '$lib/server/fs-utils';
import path from 'path';

export const load: PageServerLoad = async () => {
  await ensureDataDirs();
  const files = await listFiles(LIBRARY_DIR);
  const library: Species[] = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const s = await readJsonFile<Species>(path.join(LIBRARY_DIR, f));
    if (s) library.push(s);
  }
  library.sort((a, b) => a.genus.localeCompare(b.genus));
  return { library };
};
