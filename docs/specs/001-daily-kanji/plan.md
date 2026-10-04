# Plan Técnico: Daily Kanji [/kanji] — Formato 20 Ítems por Modalidad

- **Spec Asociada:** [`spec.md`](spec.md)
- **Estado:** en progreso (incorporando navegación libre, paginación, modo revisión y tipografías)
- **Fecha:** 2026-10-04

---

## 🏗️ 1. Arquitectura y Responsabilidades de Archivos

### Archivos a Modificar / Crear:
| Archivo | Capa / Módulo | Modificación |
| :--- | :--- | :--- |
| `src/types/kanji.ts` | Tipado / DTO | Modelar `KanjiFontFamily`, estados de navegación libre, sub-progreso `currentQuestionIndex` (0..19), `StageAnswerRecord` y `KanjiDailyState`. |
| `src/store/useKanjiStore.ts` | Estado (Zustand) | Incorporar `setCurrentStage(index: number)`, `goToQuestion(index: number)`, `selectedFont: KanjiFontFamily`, `setSelectedFont(font)`, modo consulta de respuestas y avance adaptativo. |
| `src/components/games/kanji/KanjiPaginationBar.tsx` (Nuevo) | UI (React) | Barra interactiva de 20 botones (1..20) posicionada sobre el kanji con estados visuales (acierto `🟩`, fallo `🟥`, pendiente, activo) y navegación por clic. |
| `src/components/games/kanji/KanjiFontSelector.tsx` (Nuevo) | UI (React) | Selector accesible de tipografías japonesas (Noto Sans JP, Zen Kaku Gothic, BIZ UDPGothic, Klee One, Zen Maru Gothic) para probar en vivo. |
| `src/components/games/kanji/DailyKanjiGame.tsx` | UI (React Island) | Incorporar selector de pestañas para cambiar libremente de modalidad en cualquier momento, barra de paginación y contenedor con la fuente seleccionada. |
| `src/components/games/kanji/stages/KanjiReadingStage.tsx` | UI (React) | Adaptar para modo revisión cuando el ejercicio ya fue respondido (mostrar respuesta previa, acierto/fallo y bloquear nuevo intento). |
| `src/components/games/kanji/stages/KanjiMeaningStage.tsx` | UI (React) | Adaptar para modo revisión de respuestas emitidas y solución correcta en significados. |
| `src/components/games/kanji/stages/KanjiRomajiStage.tsx` | UI (React) | Adaptar para modo revisión en transcripciones fonéticas romaji. |
| `src/components/games/kanji/stages/KanjiStrokeStage.tsx` | UI (React) | Soportar navegación directa por paginación y modo práctica/revisión si el kanji ya fue trazado previamente. |
| `src/styles/global.css` o `src/pages/kanji/index.astro` | Estilos / Fuentes | Importar las fuentes de Google Fonts (Noto Sans JP, Zen Kaku Gothic New, BIZ UDPGothic, Klee One, Zen Maru Gothic) con utilidades de clase font. |

---

## 📊 2. Impacto en Tipos y Datos (`src/types/kanji.ts`)

```typescript
export type KanjiFontFamily = 
  | "noto-sans-jp" 
  | "zen-kaku-gothic" 
  | "biz-ud-gothic" 
  | "klee-one" 
  | "zen-maru-gothic";

export interface KanjiFontOption {
  id: KanjiFontFamily;
  name: string;
  category: string;
  cssFamily: string;
}

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
  selectedFont?: KanjiFontFamily;
}
```

---

## ⚙️ 3. Lógica de Navegación Libre y Modo Revisión

### 3.1. Navegación No Lineal entre Modalidades:
- El usuario puede presionar cualquiera de las 4 pestañas: `[📖 Lectura] [💡 Significado] [🔤 Romaji] [✍️ Trazos]`.
- Al cambiar de etapa mediante `setCurrentStage(index)`:
  - Se activa la etapa seleccionada.
  - Se sitúa en el primer ejercicio pendiente de esa etapa (o en el ejercicio 0 si ya se respondieron todos o ninguno).
  - El progreso y las respuestas de las demás etapas permanecen intactos en `kanjiRepository`.

### 3.2. Paginación Interactiva (1..20) y Modo Revisión:
- `KanjiPaginationBar` renderiza 20 botones compactos numerados del 1 al 20 sobre el kanji actual.
- Para cada botón `i` (0..19):
  - Verifica si `stages[currentStageKey].answers` contiene una respuesta para `dailyKanjis[i].id`.
  - Si no está respondido: estilo neutro (`bg-neutral-800 text-neutral-400`).
  - Si está respondido y `isCorrect === true`: estilo verde (`bg-emerald-900/60 text-emerald-300 border-emerald-500/60`).
  - Si está respondido y `isCorrect === false`: estilo rojo (`bg-rose-900/60 text-rose-300 border-rose-500/60`).
  - Si `i === currentQuestionIndex`: anillo brillante de foco (`ring-2 ring-indigo-400`).
- Al pulsar el botón `i`: llama a `goToQuestion(i)`.

### 3.3. Modo Consulta en las Etapas:
- Al renderizar la etapa actual, se comprueba si el kanji activo ya tiene un registro en `answers`:
  - Si existe registro previo:
    - Se deshabilitan los botones o inputs de envío.
    - Se marca la opción seleccionada por el usuario (verde si acertó, rojo si falló).
    - Si falló, se resalta la respuesta correcta con borde/fondo verde.
    - Se despliega un banner de revisión: *"Ejercicio ya respondido: Tu respuesta fue [X] (Correcta/Incorrecta). Solución: [Y]"*.
    - Se ofrece un botón *"Siguiente ejercicio"* o se puede pulsar cualquier número en la paginación.
  - Si no existe respuesta previa:
    - Se despliegan los controles de respuesta habituales y se evalúa el intento único.

---

## 🔤 4. Integración y Prueba de Tipografías Japonesas

Se importan las familias de Google Fonts con soporte para kanjis japoneses:
```css
@import url('https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Klee+One:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&family=Zen+Maru+Gothic:wght@400;700&display=swap');
```
Clases CSS asignadas según la fuente activa:
- `font-noto-sans-jp`: `'Noto Sans JP', sans-serif`
- `font-zen-kaku`: `'Zen Kaku Gothic New', sans-serif`
- `font-biz-ud`: `'BIZ UDPGothic', sans-serif`
- `font-klee-one`: `'Klee One', cursive`
- `font-zen-maru`: `'Zen Maru Gothic', sans-serif`

El componente `KanjiFontSelector` permite alternar rápidamente entre ellas con botones píldora o un menú desplegable, persistiendo la selección en `localStorage`.

---

## 🧪 5. Estrategia de Verificación y Testing

1. **Navegación libre de modalidades:** Comprobar que cambiar entre etapas preserva el progreso y las respuestas emitidas en cada una.
2. **Paginación 1..20:** Validar que al pulsar un número se cargue el kanji correspondiente y que los colores reflejen aciertos y fallos.
3. **Modo Revisión:** Verificar que las preguntas ya respondidas no admitan reintentos y muestren la respuesta dada y la solución correcta.
4. **Selector de Fuente:** Comprobar que cambiar la tipografía altere en caliente la apariencia del kanji principal y los textos japoneses.
5. **Compilación Limpia:** Ejecutar `npm run build && touch astro.config.mjs` garantizando 0 errores de TypeScript y bundle funcional.
