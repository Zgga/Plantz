/**
 * Seed script — crée des plantes et espèces de démo.
 * Usage : node scripts/seed.mjs [--data-dir ./data]
 */
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const args = process.argv.slice(2);
const dataDirArg = args.indexOf('--data-dir');
const DATA_DIR = dataDirArg !== -1 ? args[dataDirArg + 1] : process.env.DATA_DIR ?? './data';
const PLANTS_DIR = path.join(DATA_DIR, 'plants');
const LIBRARY_DIR = path.join(DATA_DIR, 'library');

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath);
}

async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

// ── Espèces ──────────────────────────────────────────────────────────────────

const species = [
  {
    id: 'monstera-deliciosa',
    genus: 'Monstera',
    species: 'deliciosa',
    common_names: ['Monstera', 'Philodendron pertusum', 'Plante gruyère'],
    family: 'Araceae',
    origin: 'Amérique centrale',
    care_tips: {
      light: 'bright-indirect',
      water: 'dry-between-watering',
      humidity: 'high',
      temperature_min_celsius: 15,
      temperature_max_celsius: 30,
      substrate_mix: 'Terreau universel + perlite 20%',
      fertilization_frequency_months: 1
    },
    toxicity: 'toxic-pets',
    growth_rate: 'medium',
    notes: 'Nettoyer les feuilles régulièrement. Tuteurer avec un bâton de mousse.'
  },
  {
    id: 'sansevieria-trifasciata',
    genus: 'Sansevieria',
    species: 'trifasciata',
    common_names: ['Langue de belle-mère', 'Plante serpent'],
    family: 'Asparagaceae',
    origin: 'Afrique de l\'Ouest',
    care_tips: {
      light: 'low',
      water: 'dry-between-watering',
      humidity: 'low',
      temperature_min_celsius: 10,
      temperature_max_celsius: 35,
      substrate_mix: 'Terreau cactées + sable grossier 30%',
      fertilization_frequency_months: 3
    },
    toxicity: 'toxic-pets',
    growth_rate: 'slow',
    notes: 'Très résistante. Arroser très peu en hiver (1x/mois max).'
  },
  {
    id: 'pothos-epipremnum',
    genus: 'Epipremnum',
    species: 'aureum',
    common_names: ['Pothos', 'Scindapsus doré'],
    family: 'Araceae',
    origin: 'Polynésie',
    care_tips: {
      light: 'medium',
      water: 'dry-between-watering',
      humidity: 'medium',
      temperature_min_celsius: 12,
      temperature_max_celsius: 30,
      substrate_mix: 'Terreau universel',
      fertilization_frequency_months: 2
    },
    toxicity: 'toxic-pets',
    growth_rate: 'fast',
    notes: 'Parfait pour débutants. Supporte bien la négligence.'
  },
  {
    id: 'ficus-lyrata',
    genus: 'Ficus',
    species: 'lyrata',
    common_names: ['Ficus lyre', 'Fiddle-leaf fig'],
    family: 'Moraceae',
    origin: 'Afrique tropicale',
    care_tips: {
      light: 'bright-indirect',
      water: 'dry-between-watering',
      humidity: 'medium',
      temperature_min_celsius: 16,
      temperature_max_celsius: 28,
      substrate_mix: 'Terreau universel + perlite 10%',
      fertilization_frequency_months: 1
    },
    toxicity: 'toxic-pets',
    growth_rate: 'slow',
    notes: 'Déteste être déplacé. Choisir son emplacement définitif et ne plus bouger.'
  },
  {
    id: 'spathiphyllum-wallisii',
    genus: 'Spathiphyllum',
    species: 'wallisii',
    common_names: ['Spathiphyllum', 'Fleur de lune', 'Peace lily'],
    family: 'Araceae',
    origin: 'Amérique centrale',
    care_tips: {
      light: 'low',
      water: 'moist-always',
      humidity: 'high',
      temperature_min_celsius: 15,
      temperature_max_celsius: 28,
      substrate_mix: 'Terreau riche + tourbe',
      fertilization_frequency_months: 2
    },
    toxicity: 'toxic-all',
    growth_rate: 'medium',
    notes: 'Indique quand elle a soif en tombant légèrement. Brumiser régulièrement.'
  }
];

// ── Plantes ───────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const plants = [
  {
    id: `plant-${randomUUID()}`,
    species_id: 'monstera-deliciosa',
    nickname: 'Monstera du salon',
    status: 'ok',
    location: 'Salon – Coin nord-est',
    added_at: daysAgo(180),
    last_repotting_at: daysAgo(60),
    pot: { size_cm: 24, material: 'terracotta' },
    tags: ['favoris', 'grande'],
    main_photo_filename: '',
    journal: `## ${daysAgo(180)}\n\nAcquise en jardinerie. Très belle plante avec 6 feuilles adultes et 2 jeunes pousses.\n\n---\n\n## ${daysAgo(60)}\n\nRempotage effectué. Racines très développées, passage en pot de 24cm. Substrat : terreau + perlite 20%.\n\n---\n\n## ${daysAgo(10)}\n\nNouvelle feuille en train de se dérouler. Croissance active.`
  },
  {
    id: `plant-${randomUUID()}`,
    species_id: 'sansevieria-trifasciata',
    nickname: 'Sansé chambre',
    status: 'ok',
    location: 'Chambre – Rebord de fenêtre',
    added_at: daysAgo(365),
    pot: { size_cm: 14, material: 'ceramic' },
    tags: ['débutant', 'résistante'],
    main_photo_filename: '',
    journal: `## ${daysAgo(365)}\n\nCadeau de crémaillère. En parfait état.\n\n---\n\n## ${daysAgo(30)}\n\nPas arrosée depuis 6 semaines, toujours impeccable.`
  },
  {
    id: `plant-${randomUUID()}`,
    species_id: 'pothos-epipremnum',
    nickname: 'Pothos retombant',
    status: 'alert',
    location: 'Bureau – Étagère haute',
    added_at: daysAgo(90),
    pot: { size_cm: 12, material: 'plastic' },
    tags: ['bouture', 'retombant'],
    main_photo_filename: '',
    journal: `## ${daysAgo(90)}\n\nBouture prélevée sur un pothos parent. 3 nœuds enracinés en eau.\n\n---\n\n## ${daysAgo(5)}\n\nQuelques feuilles jaunissent. Peut-être trop d'eau directe ou manque de lumière.`
  },
  {
    id: `plant-${randomUUID()}`,
    species_id: 'spathiphyllum-wallisii',
    nickname: 'Paix éternelle',
    status: 'dormant',
    location: 'Salle de bain',
    added_at: daysAgo(200),
    pot: { size_cm: 16, material: 'ceramic' },
    tags: ['floraison', 'salle-de-bain'],
    main_photo_filename: '',
    journal: `## ${daysAgo(200)}\n\nAcquise en fleurs. 3 spathes blanches.\n\n---\n\n## ${daysAgo(45)}\n\nPériode de dormance hivernale. Arrosages réduits.`
  },
  {
    id: `plant-${randomUUID()}`,
    nickname: 'Mystère du couloir',
    status: 'new',
    location: 'Couloir',
    added_at: today,
    pot: { size_cm: 10, material: 'plastic' },
    tags: ['identifier'],
    main_photo_filename: '',
    journal: `## ${today}\n\nTrouvée devant la porte. Espèce inconnue. À identifier.`
  }
];

// ── Écriture ──────────────────────────────────────────────────────────────────

console.log(`DATA_DIR : ${DATA_DIR}\n`);

for (const sp of species) {
  const filePath = path.join(LIBRARY_DIR, `${sp.id}.json`);
  await writeJson(filePath, sp);
  console.log(`  espèce   ${sp.genus} ${sp.species}`);
}

for (const plant of plants) {
  const { journal, ...plantData } = plant;
  const plantDir = path.join(PLANTS_DIR, plant.id);
  await writeJson(path.join(plantDir, 'data.json'), plantData);
  await writeText(path.join(plantDir, 'journal.md'), journal);
  await fs.mkdir(path.join(plantDir, 'photos'), { recursive: true });
  console.log(`  plante   ${plant.nickname}`);
}

console.log(`\n✓ Seed terminé — ${species.length} espèces, ${plants.length} plantes.`);
