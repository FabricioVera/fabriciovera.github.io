/**
 * Funciones puras y utilidades deterministas para Daily Kanji [/kanji]
 * Conforme con Artículo I (Determinismo Diario) y Artículo V (Tipado Estricto)
 * FabricioVera / FabriGames
 */

import Rand from "rand-seed";
import type { KanjiN5 } from "../types/kanji";
import { convertKatakanaToHiragana, normalizeRomaji } from "./kanaConverter";

/**
 * Obtiene la semilla diaria formateada estrictamente como YYYYMMDD + suffix.
 * Si dateStr no se provee, utiliza la fecha local actual del jugador.
 */
export function getDailySeed(dateStr?: string, suffix: string = "kanji"): string {
  if (dateStr) {
    const cleanDate = dateStr.replace(/[^0-9]/g, "");
    return `${cleanDate}${suffix}`;
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}${suffix}`;
}

/**
 * Baraja un arreglo de forma determinista usando el algoritmo Fisher-Yates
 * y una función generadora de números aleatorios proveniente de rand-seed.
 */
export function deterministicShuffle<T>(array: T[], nextRandom: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Selecciona una lista ordenada y determinista de N kanjis únicos del catálogo N5
 * utilizando la semilla YYYYMMDD + "kanji" con rand-seed.
 * Cumple estrictamente con el Artículo I de la Constitución.
 */
export function getDailyKanjiList(
  kanjis: KanjiN5[],
  dateStr?: string,
  count: number = 20
): KanjiN5[] {
  if (!kanjis || kanjis.length === 0) {
    throw new Error("El catálogo de kanjis no puede estar vacío");
  }
  const seed = getDailySeed(dateStr, "kanji");
  const rand = new Rand(seed);
  const shuffled = deterministicShuffle(kanjis, () => rand.next());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Selecciona el Kanji principal del día de forma determinista universal.
 * Mantiene retrocompatibilidad retornando el primer kanji de la lista diaria.
 */
export function getDailyKanji(kanjis: KanjiN5[], dateStr?: string): KanjiN5 {
  const list = getDailyKanjiList(kanjis, dateStr, 1);
  return list[0];
}

/**
 * Obtiene la lectura primaria en hiragana para un kanji dado.
 * Si cuenta con Kun'yomi, limpia caracteres auxiliares (puntos y guiones).
 * Si solo cuenta con On'yomi (Katakana), lo transforma automáticamente a Hiragana.
 */
export function getPrimaryReading(kanji: KanjiN5): string {
  if (kanji.readings.kun && kanji.readings.kun.length > 0) {
    return kanji.readings.kun[0].replace(/\./g, "").replace(/^-/, "").trim();
  }
  if (kanji.readings.on && kanji.readings.on.length > 0) {
    const cleanOn = kanji.readings.on[0].replace(/\./g, "").replace(/^-/, "").trim();
    return convertKatakanaToHiragana(cleanOn);
  }
  return "";
}

/**
 * Obtiene la transcripción romaji principal de un kanji.
 */
export function getPrimaryRomaji(kanji: KanjiN5): string {
  if (kanji.romaji && kanji.romaji.length > 0) {
    return kanji.romaji[0].toLowerCase().trim();
  }
  return "";
}

/**
 * Genera exactamente 4 opciones de significado (1 correcta y 3 distractores deterministas)
 * garantizando ausencia de duplicados semánticos y barajado determinista para cada kanji.
 */
export function getMeaningOptions(
  kanji: KanjiN5,
  allKanjis: KanjiN5[],
  dateStr?: string
): string[] {
  const seed = getDailySeed(dateStr, `meaning_${kanji.id}`);
  const rand = new Rand(seed);

  const correctMeaning = kanji.meanings[0];
  const chosenMeanings = new Set<string>([correctMeaning.toLowerCase().trim()]);
  const distractors: string[] = [];

  const candidates = allKanjis.filter((k) => k.id !== kanji.id);
  const shuffledCandidates = deterministicShuffle(candidates, () => rand.next());

  for (const candidate of shuffledCandidates) {
    if (distractors.length >= 3) break;
    const meaning = candidate.meanings[0];
    const norm = meaning.toLowerCase().trim();
    if (!chosenMeanings.has(norm)) {
      distractors.push(meaning);
      chosenMeanings.add(norm);
    }
  }

  const options = [correctMeaning, ...distractors];
  return deterministicShuffle(options, () => rand.next());
}

/**
 * Genera exactamente 4 opciones de lectura en Hiragana (1 correcta y 3 distractores deterministas).
 */
export function getReadingOptions(
  kanji: KanjiN5,
  allKanjis: KanjiN5[],
  dateStr?: string
): string[] {
  const seed = getDailySeed(dateStr, `reading_${kanji.id}`);
  const rand = new Rand(seed);

  const correctReading = getPrimaryReading(kanji);
  const chosenReadings = new Set<string>([correctReading]);
  const distractors: string[] = [];

  const candidates = allKanjis.filter((k) => k.id !== kanji.id);
  const shuffledCandidates = deterministicShuffle(candidates, () => rand.next());

  for (const candidate of shuffledCandidates) {
    if (distractors.length >= 3) break;
    const reading = getPrimaryReading(candidate);
    if (reading && !chosenReadings.has(reading)) {
      distractors.push(reading);
      chosenReadings.add(reading);
    }
  }

  const options = [correctReading, ...distractors];
  return deterministicShuffle(options, () => rand.next());
}

/**
 * Genera exactamente 4 opciones de transcripción Romaji (1 correcta y 3 distractores deterministas).
 */
export function getRomajiOptions(
  kanji: KanjiN5,
  allKanjis: KanjiN5[],
  dateStr?: string
): string[] {
  const seed = getDailySeed(dateStr, `romaji_${kanji.id}`);
  const rand = new Rand(seed);

  const correctRomaji = getPrimaryRomaji(kanji);
  const chosenRomajis = new Set<string>([correctRomaji]);
  const distractors: string[] = [];

  const candidates = allKanjis.filter((k) => k.id !== kanji.id);
  const shuffledCandidates = deterministicShuffle(candidates, () => rand.next());

  for (const candidate of shuffledCandidates) {
    if (distractors.length >= 3) break;
    const candidateRomaji = getPrimaryRomaji(candidate);
    if (candidateRomaji && !chosenRomajis.has(candidateRomaji)) {
      distractors.push(candidateRomaji);
      chosenRomajis.add(candidateRomaji);
    }
  }

  const options = [correctRomaji, ...distractors];
  return deterministicShuffle(options, () => rand.next());
}

/**
 * Normaliza respuestas de usuario eliminando espacios superfluos, signos de puntuación
 * y unificando a minúsculas.
 */
export function normalizeAnswer(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.,/\\!?()]/g, "");
}

/**
 * Validador flexible de respuestas que evalúa si la respuesta del usuario coincide
 * con alguna de las variantes admitidas por el kanji (significados, lecturas o romaji).
 */
export function isAnswerCorrect(
  userAnswer: string,
  acceptableAnswers: string[],
  isRomajiMode: boolean = false
): boolean {
  if (!userAnswer || acceptableAnswers.length === 0) return false;

  const normalizedUser = isRomajiMode
    ? normalizeRomaji(userAnswer)
    : normalizeAnswer(userAnswer);

  return acceptableAnswers.some((ans) => {
    const normalizedAns = isRomajiMode ? normalizeRomaji(ans) : normalizeAnswer(ans);
    return normalizedUser === normalizedAns;
  });
}
