import type { Species } from '$lib/types';

interface OpenPlantBookData {
  pid: string;
  display_pid: string;
  common_name?: string;
  family?: string;
  origin?: string;
  min_light_mmol?: number;
  max_light_mmol?: number;
  min_temp?: number;
  max_temp?: number;
  min_humidity?: number;
  max_humidity?: number;
  watering_period?: number;
  toxicity?: string;
  growth_rate?: string;
}

async function fetchToken(clientId: string, clientSecret: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  const res = await fetch('https://open.plantbook.io/api/v1/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!res.ok) throw new Error(`OpenPlantBook token error ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function fetchPlantBookDetails(
  genus: string,
  species: string,
  clientId: string,
  clientSecret: string
): Promise<OpenPlantBookData | null> {
  try {
    const token = await fetchToken(clientId, clientSecret);
    const pid = encodeURIComponent(`${genus} ${species}`.toLowerCase());
    const res = await fetch(`https://open.plantbook.io/api/v1/plant/detail/${pid}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function mapToCareTips(raw: OpenPlantBookData): Partial<Species['care_tips']> {
  const tips: Partial<Species['care_tips']> = {};

  if (raw.max_light_mmol != null) {
    const lux = raw.max_light_mmol;
    if (lux < 1000) tips.light = 'low';
    else if (lux < 5000) tips.light = 'medium';
    else if (lux < 15000) tips.light = 'bright-indirect';
    else tips.light = 'direct-sun';
  }

  if (raw.min_temp != null) tips.temperature_min_celsius = Math.round(raw.min_temp);
  if (raw.max_temp != null) tips.temperature_max_celsius = Math.round(raw.max_temp);

  if (raw.max_humidity != null) {
    const h = raw.max_humidity;
    if (h < 40) tips.humidity = 'low';
    else if (h < 65) tips.humidity = 'medium';
    else tips.humidity = 'high';
  }

  return tips;
}
