import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

export interface PlantNetCandidate {
  scientificName: string;
  genus: string;
  commonNames: string[];
  score: number;
}

export interface ClaudeIdentification {
  genus: string;
  species: string;
  common_names: string[];
  confidence: number;
  family: string;
  notes?: string;
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function compressForClaude(imageBuffer: Buffer): Promise<Buffer> {
  // Claude limite à 5MB. On redimensionne à 1200px max et qualité 80 pour rester sous 3.5MB.
  return sharp(imageBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function identifyWithPlantNet(imageBuffer: Buffer, filename = 'photo.webp', apiKey = ''): Promise<PlantNetCandidate[]> {
  if (!apiKey) throw new Error('PLANTNET_API_KEY manquante');

  const mime = mimeFromFilename(filename);
  const form = new FormData();
  form.append('images', new Blob([imageBuffer], { type: mime }), filename);
  form.append('organs', 'auto');

  console.log(`[PlantNet] POST identify, file="${filename}", mime="${mime}", key="${apiKey.slice(0, 6)}..."`);

  const res = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(apiKey)}&lang=fr`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PlantNet error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const results: PlantNetCandidate[] = (data.results ?? []).map((r: any) => ({
    scientificName: r.species?.scientificNameWithoutAuthor ?? r.species?.scientificName ?? '',
    genus: r.species?.genus?.scientificNameWithoutAuthor ?? '',
    commonNames: r.species?.commonNames ?? [],
    score: r.score ?? 0
  }));

  const sorted = results.sort((a, b) => b.score - a.score).slice(0, 5);
  console.log(`[PlantNet] ${sorted.length} candidats: ${sorted.map(r => `${r.scientificName}(${Math.round(r.score * 100)}%)`).join(', ')}`);
  return sorted;
}

export async function identifyWithClaude(imageBuffer: Buffer, apiKey = '', filename = 'photo.webp'): Promise<ClaudeIdentification> {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY manquante');

  const client = new Anthropic({ apiKey });

  const compressed = await compressForClaude(imageBuffer);
  console.log(`[Claude] image compressée: ${(compressed.length / 1024).toFixed(0)}KB`);

  const base64 = compressed.toString('base64');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system:
      'Tu es un expert en identification de plantes. Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication. ' +
      'Format exact : {"genus":"...","species":"...","common_names":["..."],"confidence":0-100,"family":"...","notes":"..."}. ' +
      'Si tu ne peux pas identifier, mets confidence à 0 et genus/species à "".',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Identifie cette plante.' }
        ]
      }
    ]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  try {
    return JSON.parse(text) as ClaudeIdentification;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as ClaudeIdentification;
    throw new Error('Réponse Claude non parseable');
  }
}
