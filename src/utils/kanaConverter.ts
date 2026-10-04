/**
 * Conversor fonético en tiempo real de Romaji a Hiragana / Katakana
 * FabricioVera / FabriGames — Daily Kanji [/kanji]
 */

/** Tabla de mapeo fonético de Romaji estándar (Hepburn y variantes) a Hiragana */
const ROMAJI_TO_HIRAGANA_MAP: Record<string, string> = {
  // Dígrafos y combinaciones de 3 caracteres (prioridad alta)
  kya: "きゃ",
  kyu: "きゅ",
  kyo: "きょ",
  sha: "しゃ",
  shu: "しゅ",
  sho: "しょ",
  sya: "しゃ",
  syu: "しゅ",
  syo: "しょ",
  cha: "ちゃ",
  chu: "ちゅ",
  cho: "ちょ",
  tya: "ちゃ",
  tyu: "ちゅ",
  tyo: "ちょ",
  nya: "にゃ",
  nyu: "にゅ",
  nyo: "にょ",
  hya: "ひゃ",
  hyu: "ひゅ",
  hyo: "ひょ",
  mya: "みゃ",
  myu: "みゅ",
  myo: "みょ",
  rya: "りゃ",
  ryu: "りゅ",
  ryo: "りょ",
  gya: "ぎゃ",
  gyu: "ぎゅ",
  gyo: "ぎょ",
  jya: "じゃ",
  jyu: "じゅ",
  jyo: "じょ",
  zya: "じゃ",
  zyu: "じゅ",
  zyo: "じょ",
  bya: "びゃ",
  byu: "びゅ",
  byo: "びょ",
  pya: "ぴゃ",
  pyu: "ぴゅ",
  pyo: "ぴょ",
  dya: "ぢゃ",
  dyu: "ぢゅ",
  dyo: "ぢょ",
  tsu: "つ",
  chi: "ち",
  shi: "し",

  // Combinaciones de 2 caracteres
  ka: "か",
  ki: "き",
  ku: "く",
  ke: "け",
  ko: "こ",
  sa: "さ",
  si: "し",
  su: "す",
  se: "せ",
  so: "そ",
  ta: "た",
  ti: "ち",
  tu: "つ",
  te: "て",
  to: "と",
  na: "な",
  ni: "に",
  nu: "ぬ",
  ne: "ね",
  no: "の",
  ha: "は",
  hi: "ひ",
  fu: "ふ",
  hu: "ふ",
  he: "へ",
  ho: "ほ",
  ma: "ま",
  mi: "み",
  mu: "む",
  me: "め",
  mo: "も",
  ya: "や",
  yu: "ゆ",
  yo: "よ",
  ra: "ら",
  ri: "り",
  ru: "る",
  re: "れ",
  ro: "ろ",
  wa: "わ",
  wo: "を",
  ga: "が",
  gi: "ぎ",
  gu: "ぐ",
  ge: "げ",
  go: "ご",
  za: "ざ",
  ji: "じ",
  zi: "じ",
  zu: "ず",
  ze: "ぜ",
  zo: "ぞ",
  da: "だ",
  di: "ぢ",
  du: "づ",
  de: "de", // se corrige abajo
  do: "ど",
  ba: "ば",
  bi: "び",
  bu: "ぶ",
  be: "べ",
  bo: "ぼ",
  pa: "ぱ",
  pi: "ぴ",
  pu: "ぷ",
  pe: "ぺ",
  po: "ぽ",
  ja: "じゃ",
  ju: "じゅ",
  jo: "じょ",
  nn: "ん",
  "n'": "ん",

  // Vocales básicas de 1 caracter
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お",
};

// Corrección de entrada duplicada
ROMAJI_TO_HIRAGANA_MAP["de"] = "で";

/**
 * Transforma texto en romaji a caracteres hiragana en tiempo real.
 * Soporta dígrafos (kya -> きゃ), sokuon consonántico (tt -> っと, kk -> っこ) y 'n' silábica.
 */
export function convertRomajiToHiragana(romaji: string): string {
  if (!romaji) return "";

  let result = "";
  let i = 0;
  const lower = romaji.toLowerCase();
  const len = lower.length;

  while (i < len) {
    // 1. Verificar dígrafos / trigramas de 3 letras (kya, chu, tsu, etc.)
    if (i + 3 <= len) {
      const sub3 = lower.substring(i, i + 3);
      if (ROMAJI_TO_HIRAGANA_MAP[sub3]) {
        result += ROMAJI_TO_HIRAGANA_MAP[sub3];
        i += 3;
        continue;
      }
    }

    // 2. Verificar sokuon (pequeño tsu っ): consonante doble como kk, tt, ss, pp, etc.
    const char1 = lower[i];
    const char2 = i + 1 < len ? lower[i + 1] : "";

    if (
      char1 === char2 &&
      char1 !== "n" &&
      char1 >= "a" &&
      char1 <= "z" &&
      !"aeiou".includes(char1)
    ) {
      result += "っ";
      i += 1;
      continue;
    }

    // Caso especial sokuon para 'c' seguido de 'ch' (ej: matchi -> まっち)
    if (char1 === "t" && lower.substring(i, i + 3) === "tch") {
      result += "っ";
      i += 1;
      continue;
    }

    // 3. Verificar bigramas de 2 letras
    if (i + 2 <= len) {
      const sub2 = lower.substring(i, i + 2);
      if (ROMAJI_TO_HIRAGANA_MAP[sub2]) {
        result += ROMAJI_TO_HIRAGANA_MAP[sub2];
        i += 2;
        continue;
      }
    }

    // 4. Tratamiento especial para 'n' silábica (ん)
    if (char1 === "n") {
      // Si va seguido de una consonante que no sea 'y' ni vocal, es 'ん'
      if (
        char2 &&
        !"aeiouy'".includes(char2) &&
        char2 >= "a" &&
        char2 <= "z"
      ) {
        result += "ん";
        i += 1;
        continue;
      }
      // Si es la última letra y estamos evaluando
      if (i === len - 1 && len > 1) {
        result += "ん";
        i += 1;
        continue;
      }
    }

    // 5. Verificar monogramas (vocales de 1 letra)
    if (ROMAJI_TO_HIRAGANA_MAP[char1]) {
      result += ROMAJI_TO_HIRAGANA_MAP[char1];
      i += 1;
      continue;
    }

    // Si ya es un caracter kana o puntuación/espacio, conservarlo
    result += romaji[i];
    i += 1;
  }

  return result;
}

/**
 * Convierte un caracter o cadena Hiragana a su equivalente en Katakana.
 */
export function convertHiraganaToKatakana(hiragana: string): string {
  if (!hiragana) return "";
  let result = "";
  for (let i = 0; i < hiragana.length; i++) {
    const code = hiragana.charCodeAt(i);
    // Rango Hiragana estándar en Unicode: U+3041 (ぁ) a U+3096 (ゖ)
    if (code >= 0x3041 && code <= 0x3096) {
      result += String.fromCharCode(code + 0x60);
    } else {
      result += hiragana[i];
    }
  }
  return result;
}

/**
 * Convierte un caracter o cadena Katakana a su equivalente en Hiragana.
 */
export function convertKatakanaToHiragana(katakana: string): string {
  if (!katakana) return "";
  let result = "";
  for (let i = 0; i < katakana.length; i++) {
    const code = katakana.charCodeAt(i);
    // Rango Katakana estándar en Unicode: U+30A1 (ァ) a U+30F6 (ヶ)
    if (code >= 0x30a1 && code <= 0x30f6) {
      result += String.fromCharCode(code - 0x60);
    } else {
      result += katakana[i];
    }
  }
  return result;
}

/**
 * Transforma texto en romaji a caracteres katakana.
 */
export function convertRomajiToKatakana(romaji: string): string {
  const hiragana = convertRomajiToHiragana(romaji);
  return convertHiraganaToKatakana(hiragana);
}

/**
 * Normaliza transcripciones en Romaji para evaluación flexible de la Etapa 3.
 * Transforma macrones Hepburn (ō -> ou, ū -> uu), apóstrofes y diacríticos.
 */
export function normalizeRomaji(romaji: string): string {
  if (!romaji) return "";

  return romaji
    .toLowerCase()
    .trim()
    .replace(/ō/g, "ou")
    .replace(/ū/g, "uu")
    .replace(/ā/g, "aa")
    .replace(/ī/g, "ii")
    .replace(/ē/g, "ei")
    .replace(/ô/g, "ou")
    .replace(/û/g, "uu")
    .replace(/â/g, "aa")
    .replace(/î/g, "ii")
    .replace(/ê/g, "ei")
    .replace(/['’\-]/g, "")
    .replace(/\s+/g, "");
}
