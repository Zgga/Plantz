import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { DATA_DIR } from '$lib/server/fs-utils';

export const GET: RequestHandler = async () => {
  const probe = path.join(DATA_DIR, '.health');
  try {
    await fs.writeFile(probe, 'ok');
    await fs.unlink(probe);
  } catch (err) {
    return json(
      { status: 'error', data_dir: DATA_DIR, error: String(err) },
      { status: 503 }
    );
  }

  return json({ status: 'ok' });
};
