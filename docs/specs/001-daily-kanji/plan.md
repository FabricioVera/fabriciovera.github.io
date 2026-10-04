# Plan Técnico: Daily Kanji [/kanji] — Formato 20 Ítems por Modalidad (Fase Vocabulario, Trazos Inversos y 1000 Kanjis)

- **Spec Asociada:** [`spec.md`](spec.md)
- **Estado:** en progreso (diseño técnico de T8-T13)
- **Fecha:** 2026-10-04

---

## 🏗️ 1. Arquitectura y Responsabilidades de Archivos

### Archivos a Modificar / Crear:
| Archivo | Capa / Módulo | Modificación |
| :--- | :--- | :--- |
| `public/data/kanji/jouyou1000.json` (Nuevo) | Datos Estáticos | Dataset con los 1000 kanjis más utilizados de Japón (Jouyou) con lecturas (on/kun), significados en español y lista de palabras compuestas (`words: { japanese, kana, meaning }[]`). |
| `src/types/kanji.ts` | Tipado / DTO | Actualizar `KanjiStageKey = "reading" | "meaning" | "vocabulary" | "strokes"`. Tipar palabras compuestas y soporte para trazos inversos. |
| `src/store/useKanjiStore.ts` | Estado (Zustand) | Adaptar la etapa 3 a `vocabulary`, orquestar la selección determinista sobre el pool de 1000 kanjis y actualizar la validación de respuestas. |
| `src/components/games/kanji/KanaReferenceModal.tsx` (Nuevo) | UI (React) | Modal interactivo de silabarios con pestañas Hiragana y Katakana con transcripción en Romaji (Hepburn) consumiendo `kana.json`. |
| `src/components/games/kanji/stages/KanjiVocabStage.tsx` (Nuevo) | UI (React) | Etapa de vocabulario compuesto: presenta la palabra (ej. `大人`) y evalúa significado/lectura con 4 opciones o escritura directa. |
| `src/components/games/kanji/stages/KanjiStrokeStage.tsx` | UI (React) | Modalidad de trazos inversos: consigna con la palabra en español y lectura kana/romaji; lienzo en blanco sin silueta previa para dibujo activo, con animación asistida ante fallos. |
| `src/components/games/kanji/DailyKanjiGame.tsx` | UI (React Island) | Botón para abrir el panel de Kanas, listener global de tecla `Enter` para avance tras responder o en revisión, y eliminación estricta de todos los subtítulos. |
| `src/components/games/kanji/KanjiSummaryModal.tsx` y `kanjiShare.ts` | UI / Social | Actualizar etiquetas de resumen de `Romaji` a `Vocabulario` (`📚 Vocabulario: X / 20`). |

---

## 📊 2. Impacto en Tipos y Datos (`src/types/kanji.ts`)

```typescript
export type KanjiStageKey = "reading" | "meaning" | "vocabulary" | "strokes";
export type StageOutcome = "correct" | "incorrect" | "pending";
export type InputMode = "multiple_choice" | "direct_input";

export interface KanjiWord {
  japanese: string;
  kana: string;
  meaning: string;
}

export interface KanjiItem {
  id: string;
  kanji: string;
  unicode: string;
  readings: {
    on: string[];
    kun: string[];
  };
  meanings: string[];
  words: KanjiWord[];
}

export interface StageAnswerRecord {
  kanjiId: string;
  kanjiCharacter: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export interface KanjiStageProgress {
  stageKey: KanjiStageKey;
  stage: KanjiStageKey;
  isCompleted: boolean;
  score: number; // Aciertos sobre 20
  answers: StageAnswerRecord[]; // Historial de las 20 respuestas
}

export interface KanjiDailyState {
  date: string; // Formato YYYY-MM-DD
  kanjiIds: string[]; // 20 IDs ordenados del día
  currentStageIndex: number; // 0..3 (o 4 si completado)
  currentQuestionIndex: number; // 0..19
  stages: Record<KanjiStageKey, KanjiStageProgress>;
  isCompleted: boolean;
  selectedFont?: KanjiFontFamily;
}
```

---

## ⚙️ 3. Lógica de Nuevas Modalidades y Componentes

### 3.1. Dataset de 1000 Kanjis:
- Se estructura un archivo `public/data/kanji/jouyou1000.json` con los 1000 kanjis más frecuentes en japonés.
- Cada entrada cuenta con: `id`, `kanji`, `unicode`, `readings` (`on`, `kun`), `meanings` (español) y `words` (mínimo 1-3 palabras compuestas reales con escritura en kanji, lectura en kana y traducción al español).
- `getDailyKanjiList`: se alimenta de esta base amplia de 1000 kanjis, manteniendo el determinismo PRNG diario de 20 kanjis sin colisiones.

### 3.2. Modalidad Vocabulario Compuesto (`KanjiVocabStage.tsx`):
- Reemplaza la antigua etapa de transcripción de un solo kanji a Romaji.
- Para el kanji activo de los 20 (ej. `人`), selecciona deterministamente una de sus palabras compuestas (ej. `大人` [adulto] o `外国人` [extranjero]).
- Presenta en pantalla la palabra compuesta destacada.
- En modo Selección Múltiple: genera 4 alternativas (el significado correcto en español y 3 distractores de otras palabras del catálogo de kanjis).
- En modo Escritura Directa: el usuario ingresa la lectura en kana o el significado.
- Mantiene el modo revisión con la respuesta previa al navegar por la paginación 1..20.

### 3.3. Modalidad Trazos Inversos (`KanjiStrokeStage.tsx`):
- En lugar de mostrar el kanji en grande para calcarlo pasivamente, se presenta la consigna:
  - *"Dibuja el kanji para:"* **[Significado en español]**
  - Pronunciación de apoyo: **[Hiragana / Romaji]**
- El lienzo `HanziWriter` se configura con `showOutline: false` (sin silueta visible) y `showCharacter: false`.
- El usuario dibuja el kanji desde su recuerdo activo:
  - Si el trazo es correcto: se dibuja en negro/azul y avanza al siguiente trazo.
  - Si el trazo es incorrecto: emite feedback de error. Tras 2 intentos fallidos o al presionar *"Ver trazo"*, `HanziWriter.animateStroke(strokeNum)` reproduce la guía visual animada para que el usuario aprenda la dirección y orden correctos.
  - Al completar todos los trazos del kanji, se marca como completado y se registra el acierto.

### 3.4. Modal de Referencia de Kanas (`KanaReferenceModal.tsx`):
- Componente modal flotante activado mediante un botón con ícono accesible en la barra superior (`[あ/ア Silabario]`).
- Contiene dos pestañas:
  1. **Hiragana:** Cuadrícula con las 46 vocales/consonantes básicas, caracteres modificados (dakuon `が, ざ...`, handakuon `ぱ, ぴ...`) y diptongos (yōon `きゃ, しゅ...`) con su correspondiente romaji.
  2. **Katakana:** Cuadrícula análoga en katakana.
- No interrumpe ni reinicia el progreso de la pregunta en curso.

### 3.5. Navegación por Teclado con Tecla Enter:
- Hook o listener global en `DailyKanjiGame.tsx`:
  - `window.addEventListener("keydown", handleKeyDown)`
  - Si `e.key === "Enter"` y la pregunta actual ya tiene feedback visible (`isFeedbackActive`) o está en modo revisión de una respuesta completada:
    - Ejecuta `advanceAfterFeedback()`.
    - Realiza `e.preventDefault()` para evitar envíos dobles.

### 3.6. Eliminación Rigurosa de Subtítulos (Regla Cero Subtítulos):
- Revisar y eliminar todos los elementos `<p className="text-xs text-neutral-400 mt-0.5">...</p>` o equivalentes que actúen como subtítulos descriptivos debajo de los títulos en:
  - `DailyKanjiGame.tsx`
  - `KanjiReadingStage.tsx`
  - `KanjiMeaningStage.tsx`
  - `KanjiVocabStage.tsx`
  - `KanjiStrokeStage.tsx`
  - `KanjiSummaryModal.tsx`

---

## 🧪 4. Estrategia de Verificación y Testing

1. **Dataset 1000 Kanjis:** Validar integridad JSON y que el generador PRNG seleccione 20 kanjis válidos sin errores ni campos vacíos.
2. **Vocabulario:** Probar la selección determinista de palabras compuestas y distractores.
3. **Trazos Inversos:** Validar que el lienzo inicie sin silueta previa, acepte trazos correctos y ofrezca animación didáctica ante error.
4. **Modal de Kanas:** Abrir y cerrar el modal verificando la visualización correcta de caracteres Hiragana/Katakana y romaji sin parpadeos.
5. **Navegación Enter:** Responder y presionar Enter para verificar que avanza fluidamente al siguiente ejercicio.
6. **Cero Subtítulos:** Auditoría visual de la interfaz para confirmar que no queden subtítulos ni párrafos descriptivos bajo los encabezados.
7. **Compilación Limpia:** Ejecutar `npm run build && touch astro.config.mjs` garantizando 0 errores TypeScript.
