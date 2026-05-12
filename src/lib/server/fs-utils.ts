import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
export const PLANTS_DIR = path.join(DATA_DIR, 'plants');
export const LIBRARY_DIR = path.join(DATA_DIR, 'library');

export async function ensureDataDirs() {
  await fs.mkdir(PLANTS_DIR, { recursive: true });
  await fs.mkdir(LIBRARY_DIR, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath);
}

export async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function writeMarkdownFile(filePath: string, content: string): Promise<void> {
  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, content, 'utf-8');
  await fs.rename(tmp, filePath);
}

export async function appendMarkdownFile(filePath: string, entry: string): Promise<void> {
  const existing = await readMarkdownFile(filePath);
  const separator = existing.trim() ? '\n\n---\n\n' : '';
  await writeMarkdownFile(filePath, existing + separator + entry);
}

export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function createDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore if not exists
  }
}

export async function moveFile(src: string, dest: string): Promise<void> {
  await fs.rename(src, dest);
}

export async function saveBuffer(filePath: string, buffer: Buffer): Promise<void> {
  await fs.writeFile(filePath, buffer);
}

export function pathExists(p: string): boolean {
  return existsSync(p);
}

export function plantDir(plantId: string): string {
  return path.join(PLANTS_DIR, plantId);
}

export function plantDataPath(plantId: string): string {
  return path.join(plantDir(plantId), 'data.json');
}

export function plantJournalPath(plantId: string): string {
  return path.join(plantDir(plantId), 'journal.md');
}

export function plantPhotosDir(plantId: string): string {
  return path.join(plantDir(plantId), 'photos');
}

export function libraryPath(speciesId: string): string {
  return path.join(LIBRARY_DIR, `${speciesId}.json`);
}
