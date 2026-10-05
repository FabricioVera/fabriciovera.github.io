/**
 * Funciones puras y utilidades deterministas para Daily Kanji [/kanji]
 * Conforme con Artículo I (Determinismo Diario) y Artículo V (Tipado Estricto)
 * FabricioVera / FabriGames
 */

import Rand from "rand-seed";
import type { KanjiN5, KanjiWord } from "../types/kanji";
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
 * Obtiene de forma determinista la palabra de vocabulario compuesto asignada al kanji para el día.
 */
export function getDeterministicVocabWord(
  kanji: KanjiN5,
  dateStr?: string,
  questionIndex: number = 0
): KanjiWord {
  if (!kanji.words || kanji.words.length === 0) {
    const meaning = kanji.meanings && kanji.meanings.length > 0 ? kanji.meanings[0] : "elemento";
    const reading = getPrimaryReading(kanji);
    return {
      japanese: kanji.kanji,
      word: kanji.kanji,
      kana: reading,
      reading: reading,
      meaning: meaning,
    };
  }
  const seed = getDailySeed(dateStr, `vocab_${kanji.id}_${questionIndex}`);
  const rand = new Rand(seed);
  const wordIdx = Math.floor(rand.next() * kanji.words.length);
  return kanji.words[wordIdx];
}

/**
 * Genera exactamente 4 opciones de significado para la palabra compuesta de vocabulario
 * (1 correcta y 3 distractores deterministas de otras palabras compuestas del catálogo).
 */
export function getVocabOptions(
  targetWord: KanjiWord,
  kanji: KanjiN5,
  allKanjis: KanjiN5[],
  dateStr?: string,
  questionIndex: number = 0
): string[] {
  const seed = getDailySeed(dateStr, `vocab_options_${kanji.id}_${questionIndex}`);
  const rand = new Rand(seed);

  const correctMeaning = targetWord.meaning.trim();
  const chosenMeanings = new Set<string>([correctMeaning.toLowerCase()]);
  const distractors: string[] = [];

  const candidates = allKanjis.filter((k) => k.id !== kanji.id);
  const shuffledCandidates = deterministicShuffle(candidates, () => rand.next());

  for (const candidate of shuffledCandidates) {
    if (distractors.length >= 3) break;
    if (candidate.words && candidate.words.length > 0) {
      const candidateWord = candidate.words[0];
      const meaning = candidateWord.meaning.trim();
      const norm = meaning.toLowerCase();
      if (meaning && !chosenMeanings.has(norm)) {
        distractors.push(meaning);
        chosenMeanings.add(norm);
      }
    } else if (candidate.meanings && candidate.meanings.length > 0) {
      const meaning = candidate.meanings[0].trim();
      const norm = meaning.toLowerCase();
      if (meaning && !chosenMeanings.has(norm)) {
        distractors.push(meaning);
        chosenMeanings.add(norm);
      }
    }
  }

  const options = [correctMeaning, ...distractors];
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

export interface WordSegment {
  char: string;
  reading: string;
  isKanji: boolean;
}

/**
 * Determina si un carácter es un Kanji (ideograma CJK).
 */
export function isKanjiChar(char: string): boolean {
  if (!char) return false;
  const code = char.codePointAt(0) || 0;
  return (
    (code >= 0x4e00 && code <= 0x9faf) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

/**
 * Validador de sonorización (rendaku) y geminación para lecturas de kanji en compuestos.
 */
function isRendakuMatch(cand: string, known: Set<string>): boolean {
  if (known.has(cand)) return true;
  const rendakuMap: Record<string, string> = {
    が: "か", ぎ: "き", ぐ: "く", げ: "け", ご: "こ",
    ざ: "さ", じ: "し", ず: "す", ぜ: "せ", ぞ: "そ",
    だ: "た", ぢ: "ち", づ: "つ", で: "て", ど: "と",
    ば: "は", び: "ひ", ぶ: "ふ", べ: "へ", ぼ: "ほ",
    ぱ: "は", ぴ: "ひ", ぷ: "ふ", ぺ: "へ", ぽ: "ほ",
  };
  const first = cand[0];
  if (rendakuMap[first]) {
    const unvoiced = rendakuMap[first] + cand.slice(1);
    if (known.has(unvoiced)) return true;
  }
  if (cand.endsWith("っ")) {
    const stem = cand.slice(0, -1);
    for (const k of known) {
      if (k.startsWith(stem)) return true;
    }
  }
  return false;
}

/**
 * Desglosa una palabra japonesa compuesta y su lectura en kana
 * para asignar a cada kanji su lectura individual separada (estilo furigana).
 */
export function splitWordFurigana(
  japanese: string,
  fullKana: string,
  kanjiCatalog?: KanjiN5[]
): WordSegment[] {
  if (!japanese) return [];
  if (!fullKana) {
    return Array.from(japanese).map((c) => ({
      char: c,
      reading: "",
      isKanji: isKanjiChar(c),
    }));
  }

  // Mapa rápido de lecturas conocidas por caracter kanji
  const readingMap = new Map<string, Set<string>>();
  if (kanjiCatalog) {
    for (const k of kanjiCatalog) {
      const set = new Set<string>();
      if (k.readings?.on) {
        for (const o of k.readings.on) {
          const clean = o.replace(/\./g, "").replace(/^-/, "").trim();
          set.add(convertKatakanaToHiragana(clean));
        }
      }
      if (k.readings?.kun) {
        for (const ku of k.readings.kun) {
          const clean = ku.replace(/\./g, "").replace(/^-/, "").trim();
          set.add(clean);
        }
      }
      readingMap.set(k.kanji, set);
    }
  }

  const chars = Array.from(japanese);
  const hasKanji = chars.some(isKanjiChar);
  if (!hasKanji) {
    return chars.map((c) => ({
      char: c,
      reading: "",
      isKanji: false,
    }));
  }

  const kanjiCount = chars.filter(isKanjiChar).length;
  if (kanjiCount === 1 && chars.length === 1) {
    return [{ char: japanese, reading: fullKana, isKanji: true }];
  }

  // Identificar prefijos y sufijos de kana idénticos (okurigana)
  let prefixLen = 0;
  while (
    prefixLen < chars.length &&
    prefixLen < fullKana.length &&
    !isKanjiChar(chars[prefixLen]) &&
    chars[prefixLen] === fullKana[prefixLen]
  ) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    suffixLen < chars.length - prefixLen &&
    suffixLen < fullKana.length - prefixLen &&
    !isKanjiChar(chars[chars.length - 1 - suffixLen]) &&
    chars[chars.length - 1 - suffixLen] === fullKana[fullKana.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const prefixChars = chars.slice(0, prefixLen);
  const suffixChars = chars.slice(chars.length - suffixLen);
  const middleChars = chars.slice(prefixLen, chars.length - suffixLen);
  const middleKana = fullKana.slice(prefixLen, fullKana.length - suffixLen);

  const middleSegments: WordSegment[] = [];
  const allMiddleAreKanji = middleChars.every(isKanjiChar);

  if (allMiddleAreKanji && middleChars.length > 0) {
    const kCount = middleChars.length;
    const kanaLen = middleKana.length;

    let bestPartition: number[] = [];
    let bestScore = -Infinity;

    function searchPartition(kanjiIdx: number, kanaStart: number, currentLengths: number[]) {
      if (kanjiIdx === kCount - 1) {
        const lastLen = kanaLen - kanaStart;
        if (lastLen > 0) {
          const allLens = [...currentLengths, lastLen];
          let score = 0;
          let idx = 0;
          for (let i = 0; i < kCount; i++) {
            const partLen = allLens[i];
            const partKana = middleKana.slice(idx, idx + partLen);
            idx += partLen;
            const kChar = middleChars[i];
            const knownReadings = readingMap.get(kChar);

            if (knownReadings && (knownReadings.has(partKana) || isRendakuMatch(partKana, knownReadings))) {
              score += 15;
            } else {
              score -= Math.abs(partLen - 2) * 2;
            }
          }
          if (score > bestScore) {
            bestScore = score;
            bestPartition = allLens;
          }
        }
        return;
      }

      const remainingKanjis = kCount - 1 - kanjiIdx;
      const maxLen = kanaLen - kanaStart - remainingKanjis;
      for (let len = 1; len <= Math.min(4, maxLen); len++) {
        searchPartition(kanjiIdx + 1, kanaStart + len, [...currentLengths, len]);
      }
    }

    searchPartition(0, 0, []);

    if (bestPartition.length === kCount) {
      let kIdx = 0;
      for (let i = 0; i < kCount; i++) {
        const len = bestPartition[i];
        const partKana = middleKana.slice(kIdx, kIdx + len);
        kIdx += len;
        middleSegments.push({
          char: middleChars[i],
          reading: partKana,
          isKanji: true,
        });
      }
    } else {
      const avgLen = middleKana.length / kCount;
      let cur = 0;
      for (let i = 0; i < kCount; i++) {
        const next = Math.round((i + 1) * avgLen);
        const partKana = middleKana.slice(cur, next);
        cur = next;
        middleSegments.push({
          char: middleChars[i],
          reading: partKana || middleKana,
          isKanji: true,
        });
      }
    }
  } else {
    // Mezcla de kana y kanji intermedios
    let remainingKana = middleKana;
    for (let i = 0; i < middleChars.length; i++) {
      const c = middleChars[i];
      if (isKanjiChar(c)) {
        middleSegments.push({
          char: c,
          reading: remainingKana,
          isKanji: true,
        });
        remainingKana = "";
      } else {
        middleSegments.push({
          char: c,
          reading: "",
          isKanji: false,
        });
      }
    }
  }

  const result: WordSegment[] = [];
  for (const c of prefixChars) {
    result.push({ char: c, reading: "", isKanji: false });
  }
  result.push(...middleSegments);
  for (const c of suffixChars) {
    result.push({ char: c, reading: "", isKanji: false });
  }

  return result;
}

