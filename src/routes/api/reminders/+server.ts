import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDirectories, readJsonFile, plantDataPath } from '$lib/server/fs-utils';
import { PLANTS_DIR } from '$lib/server/fs-utils';
import type { Plant } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
  const doneParam = url.searchParams.get('done');
  const includeDone = doneParam === 'true';

  const plantIds = await listDirectories(PLANTS_DIR);
  const results: Array<{
    plant_id: string;
    plant_nickname: string;
    reminder_id: string;
    type: string;
    label: string | undefined;
    due_date: string;
    done: boolean;
    overdue: boolean;
  }> = [];

  const today = new Date().toISOString().slice(0, 10);

  for (const id of plantIds) {
    const plant = await readJsonFile<Plant>(plantDataPath(id));
    if (!plant?.reminders?.length) continue;

    for (const r of plant.reminders) {
      if (!includeDone && r.done) continue;
      results.push({
        plant_id: id,
        plant_nickname: plant.nickname,
        reminder_id: r.id,
        type: r.type,
        label: r.label,
        due_date: r.due_date,
        done: r.done,
        overdue: !r.done && r.due_date < today
      });
    }
  }

  results.sort((a, b) => a.due_date.localeCompare(b.due_date));

  return json(results);
};
