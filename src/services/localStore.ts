// Armazenamento local (sem Firebase) — guarda histórico mensal e anotações no
// localStorage do navegador. Mesma "forma" de dados que o Firestore usava, então
// trocar para Firebase depois (multi-dispositivo, tempo real) é só reimplementar
// este arquivo — nenhuma view/hook precisa mudar.
import { MonthData } from '../types';

const HISTORICO_KEY = 'dashboard_historico_v1';
const NOTES_KEY = 'dashboard_notes_v1';
const HISTORICO_EVENT = 'dashboard:historico-changed';
const NOTES_EVENT = 'dashboard:notes-changed';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── HISTÓRICO MENSAL ────────────────────────────────────────────────────────
export function getHistorico(): Record<string, MonthData[]> {
  return readJSON<Record<string, MonthData[]>>(HISTORICO_KEY, {});
}

export function subscribeToHistorico(onData: (byClient: Record<string, MonthData[]>) => void) {
  onData(getHistorico());
  const handler = () => onData(getHistorico());
  window.addEventListener(HISTORICO_EVENT, handler);
  return () => window.removeEventListener(HISTORICO_EVENT, handler);
}

export async function addOrUpdateMonthData(clientId: string, data: MonthData): Promise<void> {
  const all = getHistorico();
  const list = all[clientId] ?? [];
  const idx = list.findIndex(m => m.chave === data.chave);
  if (idx >= 0) list[idx] = data;
  else list.push(data);
  list.sort((a, b) => a.chave.localeCompare(b.chave));
  all[clientId] = list;
  writeJSON(HISTORICO_KEY, all);
  window.dispatchEvent(new Event(HISTORICO_EVENT));
}

// ─── ANOTAÇÕES POR CLIENTE ───────────────────────────────────────────────────
export function getNotes(): Record<string, string> {
  return readJSON<Record<string, string>>(NOTES_KEY, {});
}

export function subscribeToClientNotes(onData: (byClient: Record<string, string>) => void) {
  onData(getNotes());
  const handler = () => onData(getNotes());
  window.addEventListener(NOTES_EVENT, handler);
  return () => window.removeEventListener(NOTES_EVENT, handler);
}

export async function updateClientNote(clientId: string, feedback: string): Promise<void> {
  const all = getNotes();
  all[clientId] = feedback;
  writeJSON(NOTES_KEY, all);
  window.dispatchEvent(new Event(NOTES_EVENT));
}
