# Plan Técnico: Daily Kanji [/kanji] — Formato 20 Ítems por Modalidad

- **Spec Asociada:** [`spec.md`](spec.md)
- **Estado:** borrador (adaptación técnica a 20 ítems por etapa)
- **Fecha:** 2026-10-04

---

## 🏗️ 1. Arquitectura y Responsabilidades de Archivos

### Archivos a Modificar:
| Archivo | Capa / Módulo | Modificación |
| :--- | :--- | :--- |
| `src/types/kanji.ts` | Tipado / DTO | Modelar `dailyKanjis` (20 kanjis), sub-progreso `currentQuestionIndex` (0..19), registro de respuestas por pregunta `StageAnswerRecord` y puntajes por etapa `score` sobre 20. |
| `src/utils/kanji.ts` | Utilidades Puras | Implementar `getDailyKanjiList()` con barajado determinista `rand-seed` (semilla `YYYYMMDDkanji`) seleccionando 20 kanjis sin duplicados y distractores para cada uno. |
| `src/services/kanjiRepository.ts` | Persistencia / Repositorio | Adaptar la serialización/deserialización en `localStorage` para almacenar la tupla granular `(currentStageIndex, currentQuestionIndex, answers)` y restaurar la partida con fidelidad absoluta. |
| `src/store/useKanjiStore.ts` | Estado (Zustand) | Incorporar ciclo de 20 preguntas por etapa: `submitAnswer`, `advanceAfterFeedback`, avance de pregunta `currentQuestionIndex` (0 a 19), transición de etapa y completado final tras los 20 trazos. |
| `src/components/games/kanji/KanjiProgressBar.tsx` | UI (React) | Extender con indicador de sub-progreso (`Pregunta X de 20`), contador de aciertos en vivo (`X / 20`) y barra porcentual de la etapa activa. |
| `src/components/games/kanji/stages/KanjiReadingStage.tsx` | UI (React) | Adaptar para responder el kanji activo de los 20, con transición animada entre preguntas y feedback educativo instantáneo. |
| `src/components/games/kanji/stages/KanjiMeaningStage.tsx` | UI (React) | Adaptar para responder significados con distractores dinámicos para cada uno de los 20 kanjis. |
| `src/components/games/kanji/stages/KanjiRomajiStage.tsx` | UI (React) | Adaptar para transcripción fonética romaji secuencial de los 20 kanjis. |
| `src/components/games/kanji/stages/KanjiStrokeStage.tsx` | UI (React) | Administrar el carrusel caligráfico de los 20 kanjis: destrucción y recreación controlada de la instancia de `HanziWriter` por cada kanji, contador de trazo y avance automático. |
| `src/components/games/kanji/KanjiSummaryModal.tsx` | UI (React) | Presentar resumen de resultados desglosado por modalidad: Lectura (X/20), Significado (Y/20), Romaji (Z/20), Trazos (20/20) y Total (Puntaje/80). |
| `src/utils/kanjiShare.ts` | Utilidades / Social | Actualizar generador de texto para compartir con el desglose sobre 20 por modalidad y racha. |
| `src/components/games/kanji/DailyKanjiGame.tsx` | UI (React Island) | Proveer contexto del kanji activo (`dailyKanjis[currentQuestionIndex]`) a las etapas hijas y coordinar modales intermedios o finales. |

---

## 📊 2. Impacto en Tipos y Datos (`src/types/kanji.ts`)

```typescript
export type KanjiStageKey = "reading" | "meaning" | "romaji" | "strokes";
export type StageOutcome = "correct" | "incorrect" | "pending";
export type InputMode = "multiple_choice" | "direct_input";

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
}

export interface KanjiStats {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  totalGamesCompleted: number;
  totalScoreAccumulated: number;
}
```

---

## ⚙️ 3. Lógica Determinista y Flujo de Estados

### 3.1. Selección Determinista de 20 Kanjis (`src/utils/kanji.ts`):
```typescript
export function getDailyKanjiList(allKanjis: KanjiN5[], dateStr?: string, count: number = 20): KanjiN5[] {
  const seed = getDailySeed(dateStr, "kanji");
  const rand = new Rand(seed);
  const shuffled = deterministicShuffle(allKanjis, () => rand.next());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
```

### 3.2. Máquina de Estados en Zustand (`useKanjiStore`):
- `currentStageIndex`: 0 = Lectura, 1 = Significado, 2 = Romaji, 3 = Trazos, 4 = Finalizado.
- `currentQuestionIndex`: 0 a 19 (índice del kanji activo dentro de la etapa).
- `kanjiTarget`: `dailyKanjis[currentQuestionIndex]`.
- Al enviar respuesta (`submitAnswer`):
  1. Se evalúa la respuesta del kanji actual y se guarda el registro en `stages[stageKey].answers`.
  2. Si es acierto, se suma 1 a `stages[stageKey].score`.
  3. Se abre retroalimentación visual (`isFeedbackOpen: true`).
- Al pulsar continuar o transicionar (`advanceAfterFeedback`):
  1. `isFeedbackOpen = false`.
  2. Si `currentQuestionIndex < 19`: `currentQuestionIndex++` (avanza al siguiente kanji).
  3. Si `currentQuestionIndex === 19`: se marca `stages[stageKey].isCompleted = true`, se resetea `currentQuestionIndex = 0` y se incrementa `currentStageIndex++`.
  4. Si `currentStageIndex === 4`: se declara `isCompleted = true` y se actualiza la racha diaria en `kanjiRepository`.

---

## 🎨 4. Ciclo de Vida y Limpieza en Canvas de Trazos (`KanjiStrokeStage.tsx`)

Para evitar fugas de memoria (*memory leaks*) en el renderizado de 20 kanjis sucesivos con `hanzi-writer`:
1. Cada cambio de `currentQuestionIndex` desmonta el contenedor previo o ejecuta `writerRef.current.destroy()`.
2. Se instancia el nuevo kanji objetivo de forma idempotente con `HanziWriter.create(...)`.
3. Al completar todos los trazos del kanji actual, se dispara automáticamente el avance hacia el siguiente kanji (o finalización si era el kanji 20).

---

## 🧪 5. Estrategia de Verificación y Testing

1. **Determinismo:** Verificar que dos llamadas con la misma fecha produzcan idéntica lista de 20 kanjis en idéntico orden.
2. **Ciclo de 20 preguntas:** Validar transiciones `0 -> 1 -> ... -> 19 -> cambio de etapa`.
3. **Persistencia granular:** Simular recarga a mitad de la etapa (ej. pregunta 11) y validar que el estado y los aciertos previos se recuperen íntegros.
4. **Resumen y Compartir:** Comprobar que el modal final totalice las 4 etapas sobre 80 puntos y genere el texto viral adecuado.
5. **Compilación y DevTools:** Inspección automatizada mediante Chrome DevTools Protocol y `npm run build` sin errores.
