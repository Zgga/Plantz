import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const base = join(dirname(fileURLToPath(import.meta.url)), '../data/library');

const files = {
  'begonia-rex.json': {
    id: 'begonia-rex',
    genus: 'Begonia',
    species: 'rex',
    common_names: ['Bégonia Rex', 'Bégonia roi'],
    family: 'Begoniaceae',
    origin: 'Assam (Inde), Myanmar',
    categories: ['tropical'],
    care_tips: {
      light: 'medium',
      water: 'dry-between-watering',
      humidity: 'high',
      temperature_min_celsius: 15,
      temperature_max_celsius: 28,
      substrate_mix: "Terreau léger + perlite (30%). Très sensible à l'excès d'eau — drainage impératif.",
      fertilization_frequency_months: 2
    },
    toxicity: 'toxic-pets',
    growth_rate: 'medium',
    notes: "Rhizomateux. Laisser sécher le dessus du substrat entre les arrosages. Éviter l'eau sur les feuilles (taches). La plupart des Bégonias rex en commerce sont des hybrides (B. rex-cultorum) — le cultivar se note sur la plante."
  },
  'echeveria-elegans.json': {
    id: 'echeveria-elegans',
    genus: 'Echeveria',
    species: 'elegans',
    common_names: ['Echeveria élégante', 'Mexican Snowball', 'Poule et poussins'],
    family: 'Crassulaceae',
    origin: 'Mexique (Hidalgo)',
    categories: ['succulent'],
    care_tips: {
      light: 'direct-sun',
      water: 'dry-between-watering',
      humidity: 'low',
      temperature_min_celsius: 5,
      temperature_max_celsius: 35,
      substrate_mix: 'Substrat cactées / succulentes. Drainage maximal, pas de rétention.',
      fertilization_frequency_months: 3
    },
    toxicity: 'non-toxic',
    growth_rate: 'slow',
    notes: "Adore le plein soleil — étiolée sans lumière suffisante. Arroser abondamment puis laisser sécher complètement. Produit des stolons avec rosettes filles (pups). Résiste au gel léger (−2°C ponctuellement)."
  },
  'tillandsia-guatemalensis.json': {
    id: 'tillandsia-guatemalensis',
    genus: 'Tillandsia',
    species: 'guatemalensis',
    common_names: ['Tillandsia du Guatemala', 'Tillandsia raquette'],
    family: 'Bromeliaceae',
    origin: 'Guatemala, Mexique, Salvador',
    categories: ['tropical'],
    care_tips: {
      light: 'bright-indirect',
      water: 'dry-between-watering',
      humidity: 'high',
      temperature_min_celsius: 10,
      temperature_max_celsius: 35,
      substrate_mix: "Épiphyte — monter sur liège ou bois flotté. Pas de terreau.",
      fertilization_frequency_months: 2
    },
    toxicity: 'non-toxic',
    growth_rate: 'slow',
    notes: "Brumiser 3–4×/semaine ou tremper 30 min/semaine puis sécher à l'envers. Fleurit en inflorescence rose/violette, produit ensuite des rejets (pups). Espèce plus robuste que T. cyanea."
  }
};

for (const [filename, data] of Object.entries(files)) {
  writeFileSync(join(base, filename), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`OK: ${filename}`);
}
