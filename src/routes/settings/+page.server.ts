import type { PageServerLoad } from './$types';
import { DATA_DIR } from '$lib/server/fs-utils';
import fs from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async () => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  let version = '0.0.1';
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
    version = pkg.version ?? version;
  } catch {
    // ignore
  }

  return { dataDir: DATA_DIR, version };
};
