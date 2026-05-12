export interface Species {
  id: string;
  genus: string;
  species: string;
  cultivar?: string;
  common_names: string[];
  family: string;
  origin?: string;
  care_tips: {
    light: 'low' | 'medium' | 'bright-indirect' | 'direct-sun';
    water: 'dry-between-watering' | 'moist-always' | 'aquatic';
    humidity: 'low' | 'medium' | 'high';
    temperature_min_celsius: number;
    temperature_max_celsius: number;
    substrate_mix: string;
    fertilization_frequency_months: number;
  };
  toxicity?: 'non-toxic' | 'toxic-pets' | 'toxic-humans' | 'toxic-all';
  growth_rate?: 'slow' | 'medium' | 'fast';
  notes?: string;
}

export interface Plant {
  id: string;
  species_id?: string;
  nickname: string;
  status: 'new' | 'ok' | 'alert' | 'dormant';
  location?: string;
  added_at: string;
  last_repotting_at?: string;
  pot?: {
    size_cm: number;
    material: 'terracotta' | 'plastic' | 'ceramic' | 'other';
  };
  tags: string[];
  main_photo_filename: string;
  main_photo_position?: { x: number; y: number };
  photos_metadata?: Record<string, { taken_at: string }>;
  metadata?: {
    last_identification_confidence?: number;
    last_identification_source?: string;
  };
}

export interface PlantWithDetails extends Plant {
  species?: Species;
  main_photo_url?: string;
  photo_urls?: string[];
  journal_content?: string;
}

export interface JournalEntry {
  content: string;
}

export type PlantStatus = Plant['status'];
export type LightLevel = Species['care_tips']['light'];
export type WaterNeeds = Species['care_tips']['water'];
export type HumidityLevel = Species['care_tips']['humidity'];
export type PotMaterial = NonNullable<Plant['pot']>['material'];
