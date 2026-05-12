import { writeFileSync } from 'fs';
import { join } from 'path';

const base = new URL('../data/library/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const files = {
  'alocasia-black-velvet.json': {
    id: 'alocasia-black-velvet', genus: 'Alocasia', species: 'reginula', cultivar: 'Black Velvet',
    common_names: ['Alocasia Black Velvet', 'Alocasia velours noir'],
    family: 'Araceae', origin: 'Bornéo (Malaisie)', categories: ['aroid'],
    care_tips: { light: 'medium', water: 'moist-always', humidity: 'high',
      temperature_min_celsius: 18, temperature_max_celsius: 28,
      substrate_mix: 'Terreau + perlite (40%) + sphagne', fertilization_frequency_months: 2 },
    toxicity: 'toxic-all', growth_rate: 'slow',
    notes: "Très sensible à l'excès d'eau. Éviter les courants d'air froids. Brumiser régulièrement."
  },
  'alocasia-zebrina.json': {
    id: 'alocasia-zebrina', genus: 'Alocasia', species: 'zebrina',
    common_names: ['Alocasia zèbre', 'Tige zèbre'],
    family: 'Araceae', origin: 'Philippines', categories: ['aroid'],
    care_tips: { light: 'medium', water: 'moist-always', humidity: 'high',
      temperature_min_celsius: 18, temperature_max_celsius: 28,
      substrate_mix: 'Terreau léger + perlite (30%) + écorces fines. Drainage impératif.',
      fertilization_frequency_months: 2 },
    toxicity: 'toxic-all', growth_rate: 'medium',
    notes: "Tiges rayées zèbre caractéristiques. Sensible aux acariens en air sec. Peut entrer en dormance sous 18°C."
  },
  'caladium-bicolor.json': {
    id: 'caladium-bicolor', genus: 'Caladium', species: 'bicolor',
    common_names: ['Caladium', 'Cœur saignant', "Oreille d'éléphant colorée"],
    family: 'Araceae', origin: 'Amérique du Sud tropicale (Brésil, Guyanes)', categories: ['aroid'],
    care_tips: { light: 'medium', water: 'moist-always', humidity: 'high',
      temperature_min_celsius: 18, temperature_max_celsius: 32,
      substrate_mix: 'Terreau riche + perlite (20%). Sol humide mais drainant.',
      fertilization_frequency_months: 2 },
    toxicity: 'toxic-all', growth_rate: 'medium',
    notes: "Plante tubéreuse — entre en dormance automne/hiver. Réduire l'arrosage, conserver le bulbe au sec et chaud. Relance au printemps."
  },
  'calathea-orbifolia.json': {
    id: 'calathea-orbifolia', genus: 'Calathea', species: 'orbifolia',
    common_names: ['Calathea orbifolia', 'Geoppertia orbifolia'],
    family: 'Marantaceae', origin: 'Bolivie', categories: ['tropical'],
    care_tips: { light: 'medium', water: 'moist-always', humidity: 'high',
      temperature_min_celsius: 18, temperature_max_celsius: 26,
      substrate_mix: 'Terreau universel léger + perlite (20%). Éviter les sols compacts.',
      fertilization_frequency_months: 2 },
    toxicity: 'non-toxic', growth_rate: 'medium',
    notes: "Utiliser eau filtrée ou décantée (sensible au calcaire). Les feuilles s'enroulent si air trop sec."
  },
  'ficus-elastica.json': {
    id: 'ficus-elastica', genus: 'Ficus', species: 'elastica',
    common_names: ['Caoutchouc', 'Figuier élastique', 'Arbre à caoutchouc'],
    family: 'Moraceae', origin: 'Inde, Népal, Myanmar, Malaisie', categories: ['tropical'],
    care_tips: { light: 'bright-indirect', water: 'dry-between-watering', humidity: 'medium',
      temperature_min_celsius: 15, temperature_max_celsius: 35,
      substrate_mix: 'Terreau universel de qualité + perlite (20%).',
      fertilization_frequency_months: 2 },
    toxicity: 'toxic-pets', growth_rate: 'fast',
    notes: "Essuyer les feuilles pour optimiser la photosynthèse. Le latex est irritant. Déteste les déplacements et courants d'air."
  },
  'ficus-lyrata.json': {
    id: 'ficus-lyrata', genus: 'Ficus', species: 'lyrata',
    common_names: ['Ficus lyré', 'Figuier lyre', 'Fiddle-Leaf Fig'],
    family: 'Moraceae', origin: 'Afrique tropicale occidentale', categories: ['tropical'],
    care_tips: { light: 'bright-indirect', water: 'dry-between-watering', humidity: 'medium',
      temperature_min_celsius: 16, temperature_max_celsius: 28,
      substrate_mix: 'Terreau de qualité + perlite (20%). Sol bien drainant.',
      fertilization_frequency_months: 1 },
    toxicity: 'toxic-pets', growth_rate: 'medium',
    notes: "Déteste être déplacé — choisir son emplacement définitif dès le départ. Nettoyer les grandes feuilles avec un chiffon humide."
  },
  'monstera-deliciosa.json': {
    id: 'monstera-deliciosa', genus: 'Monstera', species: 'deliciosa',
    common_names: ['Monstera', 'Fenestré', 'Plante gruyère', 'Philodendron pertusum'],
    family: 'Araceae', origin: 'Amérique centrale (Mexique, Panama)', categories: ['aroid'],
    care_tips: { light: 'bright-indirect', water: 'dry-between-watering', humidity: 'medium',
      temperature_min_celsius: 15, temperature_max_celsius: 30,
      substrate_mix: "Terreau universel + perlite (20%) + écorces d'orchidée (10%)",
      fertilization_frequency_months: 1 },
    toxicity: 'toxic-pets', growth_rate: 'fast',
    notes: "Tuteuriser avec un support moussu. Arroser quand les 3–4 premiers cm de substrat sont secs."
  },
  'philodendron-gloriosum.json': {
    id: 'philodendron-gloriosum', genus: 'Philodendron', species: 'gloriosum',
    common_names: ['Philodendron Gloriosum', 'Philodendron gloire'],
    family: 'Araceae', origin: 'Colombie, Venezuela, Pérou', categories: ['aroid'],
    care_tips: { light: 'medium', water: 'dry-between-watering', humidity: 'high',
      temperature_min_celsius: 18, temperature_max_celsius: 27,
      substrate_mix: 'Terreau aéré + perlite (30%) + sphagne, pH 5.5–6.5',
      fertilization_frequency_months: 1 },
    toxicity: 'toxic-all', growth_rate: 'slow',
    notes: "Plante rampante (pas grimpante). Feuilles veloutées très décoratives. Sensible aux araignées rouges en air sec."
  },
  'pothos-golden.json': {
    id: 'pothos-golden', genus: 'Epipremnum', species: 'aureum', cultivar: 'Golden',
    common_names: ['Pothos doré', 'Scindapsus doré', 'Plante du diable'],
    family: 'Araceae', origin: 'Îles Salomon', categories: ['aroid'],
    care_tips: { light: 'low', water: 'dry-between-watering', humidity: 'low',
      temperature_min_celsius: 10, temperature_max_celsius: 30,
      substrate_mix: 'Terreau universel standard. Tolère des conditions pauvres.',
      fertilization_frequency_months: 2 },
    toxicity: 'toxic-pets', growth_rate: 'fast',
    notes: "Très tolérante, idéale pour débutants. Supporte les environnements sombres et secs. Peut pousser dans l'eau seule."
  },
  'sansevieria-trifasciata.json': {
    id: 'sansevieria-trifasciata', genus: 'Dracaena', species: 'trifasciata',
    common_names: ['Sansévière', 'Langue de belle-mère', 'Snake Plant', 'Sansevieria'],
    family: 'Asparagaceae', origin: "Afrique de l'Ouest (Nigeria, Congo)", categories: ['succulent'],
    care_tips: { light: 'low', water: 'dry-between-watering', humidity: 'low',
      temperature_min_celsius: 10, temperature_max_celsius: 35,
      substrate_mix: 'Substrat cactées ou terreau + sable grossier (50%)',
      fertilization_frequency_months: 3 },
    toxicity: 'toxic-pets', growth_rate: 'slow',
    notes: "Extrêmement résistante. Cause de mort principale : sur-arrosage. Arroser tous les 2–6 semaines. Reclassée Dracaena en 2017."
  },
  'spathiphyllum-floribundum.json': {
    id: 'spathiphyllum-floribundum', genus: 'Spathiphyllum', species: 'floribundum',
    common_names: ['Fleur de lune', 'Spathiphyllum', 'Faux arum', 'Lis de paix'],
    family: 'Araceae', origin: 'Amérique centrale, Colombie, Venezuela', categories: ['aroid'],
    care_tips: { light: 'low', water: 'moist-always', humidity: 'high',
      temperature_min_celsius: 15, temperature_max_celsius: 30,
      substrate_mix: 'Terreau universel + perlite légère (15%). Maintenir légèrement humide.',
      fertilization_frequency_months: 2 },
    toxicity: 'toxic-pets', growth_rate: 'medium',
    notes: "Excellente pour faible luminosité. Les feuilles tombent si trop sec — bon indicateur visuel d'arrosage. Fleurit au printemps."
  },
  'tillandsia-cyanea.json': {
    id: 'tillandsia-cyanea', genus: 'Tillandsia', species: 'cyanea',
    common_names: ["Tillandsia cyanea", "Pink Quill", "Tillandsia rose", "Fleur de l'air"],
    family: 'Bromeliaceae', origin: 'Équateur', categories: ['tropical'],
    care_tips: { light: 'bright-indirect', water: 'dry-between-watering', humidity: 'high',
      temperature_min_celsius: 15, temperature_max_celsius: 32,
      substrate_mix: 'Épiphyte — liège, bois ou substrat orchidée très aéré. Pas de terreau standard.',
      fertilization_frequency_months: 2 },
    toxicity: 'non-toxic', growth_rate: 'slow',
    notes: "Ne pas laisser d'eau stagnante au cœur. Brumiser 2–3×/semaine ou tremper 30 min/semaine. Fleurit une seule fois puis produit des rejets (pups)."
  },
};

for (const [filename, data] of Object.entries(files)) {
  const path = join(base, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`OK: ${filename}`);
}
