export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(isoString: string, locale = 'fr-FR'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string, locale = 'fr-FR'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

const PLANT_ADJECTIVES = [
  'Verte', 'Sauvage', 'Robuste', 'Mystérieuse', 'Élégante', 'Tropicale',
  'Gracieuse', 'Lumineuse', 'Paisible', 'Luxuriante', 'Fougueuse', 'Discrète'
];

const PLANT_NOUNS = [
  'Rescapée', 'Voyageuse', 'Conquérante', 'Princesse', 'Reine', 'Exploratrice',
  'Gardienne', 'Sentinelle', 'Amazone', 'Nomade', 'Pionnière', 'Découvreuse'
];

export function generateRandomNickname(): string {
  const adj = PLANT_ADJECTIVES[Math.floor(Math.random() * PLANT_ADJECTIVES.length)];
  const noun = PLANT_NOUNS[Math.floor(Math.random() * PLANT_NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj} ${noun} #${num}`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'Nouvelle',
    ok: 'En bonne santé',
    alert: 'En alerte',
    dormant: 'En dormance'
  };
  return labels[status] ?? status;
}

export function getLightLabel(light: string): string {
  const labels: Record<string, string> = {
    'low': 'Faible luminosité',
    'medium': 'Luminosité moyenne',
    'bright-indirect': 'Lumière vive indirecte',
    'direct-sun': 'Soleil direct'
  };
  return labels[light] ?? light;
}

export function getWaterLabel(water: string): string {
  const labels: Record<string, string> = {
    'dry-between-watering': 'Laisser sécher entre les arrosages',
    'moist-always': 'Maintenir humide en permanence',
    'aquatic': 'Plante aquatique'
  };
  return labels[water] ?? water;
}

export function getHumidityLabel(humidity: string): string {
  const labels: Record<string, string> = {
    low: 'Faible (< 40%)',
    medium: 'Moyenne (40–60%)',
    high: 'Élevée (> 60%)'
  };
  return labels[humidity] ?? humidity;
}

export const PLANT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'aroid', label: 'Aroid' },
  { value: 'succulent', label: 'Succulente' },
  { value: 'cactus', label: 'Cactus' },
  { value: 'caudex', label: 'Caudex' },
  { value: 'carnivore', label: 'Carnivore' },
  { value: 'orchid', label: 'Orchidée' },
  { value: 'fern', label: 'Fougère' },
  { value: 'semi-aquatic', label: 'Semi-aquatique' },
  { value: 'aquatic', label: 'Aquatique' },
  { value: 'tropical', label: 'Tropical' },
];

export function getCategoryLabel(value: string): string {
  return PLANT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
}

export function getPhotoUrl(plantId: string, filename: string): string {
  return `/api/plants/${plantId}/photos/${encodeURIComponent(filename)}`;
}

export function composeNickname(
  genus: string | undefined,
  commonNames: string[] | undefined,
  cultivar: string | undefined
): string {
  const part1 = genus?.trim() || '';
  const part2 = (commonNames?.[0] || cultivar || '').trim();
  return [part1, part2].filter(Boolean).join(' ');
}
