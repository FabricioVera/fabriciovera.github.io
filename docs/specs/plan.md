# Plan Técnico: Daily Kanji [/kanji] (Aprender Japonés)

- **Spec Asociada:** [`spec.md`](spec.md)
- **Estado:** aprobado
- **Fecha:** 2026-10-04

---

## 🏗️ 1. Arquitectura y Responsabilidades de Archivos

### Archivos Existentes a Modificar:
| Archivo | Responsabilidad / Modificación |
| :--- | :--- |
| `src/data/games.ts` | Registrar la nueva entrada del juego `/kanji` con su título, descripción, icono temático y ruta activa en el catálogo global. |
| `package.json` | Instalar e integrar la dependencia de cliente `hanzi-writer` (y sus tipos `@types/hanzi-writer` si aplica). |
| `docs/progress.md` | Actualizar el estado de características y trazabilidad en el Memory Bank general. |

### Nuevos Archivos a Crear:
| Archivo | Capa / Módulo | Responsabilidad |
| :--- | :--- | :--- |
| `src/data/kanji/kana.json` | Datos Estáticos | Catálogo estructurado de caracteres Hiragana y Katakana con su equivalencia en romaji Hepburn (importado estáticamente vía `@data/kanji/*`). |
| `src/data/kanji/n5.json` | Datos Estáticos | Dataset de kanjis JLPT N5 con campos: `id`, `kanji`, `unicode`, lecturas (`on`/`kun`), significados en español y ejemplos (importado estáticamente vía `@data/kanji/*`). |
| `src/types/kanji.ts` | Tipado / DTO | Interfaces y contratos TypeScript estrictos para modelos de datos, estados de etapa, persistencia y resultados. |
| `src/utils/kanji.ts` | Utilidades / Lógica Pura | PRNG determinista con `rand-seed` (semilla `YYYYMMDD + "kanji"`), selección de objetivo, generador de distractores y normalizador. |
| `src/utils/kanaConverter.ts` | Utilidades / Lógica Pura | Motor de conversión en tiempo real de pulsaciones romaji a caracteres hiragana para el modo de escritura directa. |
| `src/services/kanjiRepository.ts` | Repositorio / Persistencia | Abstracción desacoplada de `localStorage` para persistencia incremental por etapa, validación de fecha, cálculo de racha y estadísticas. |
| `src/store/useKanjiStore.ts` | Estado (Zustand) | Máquina de estados interactiva: gestión del kanji del día, etapa activa (1-4), intento único por etapa, toggle de modalidad y persistencia incremental. |
| `src/components/games/kanji/DailyKanjiGame.tsx` | UI (React Island) | Componente raíz orquestador montado con `client:only="React"`, coordina etapas, feedback y modales. |
| `src/components/games/kanji/KanjiModeToggle.tsx` | UI (React) | Selector interactivo accesible para alternar entre "Selección Múltiple" y "Escritura Directa". |
| `src/components/games/kanji/KanjiProgressBar.tsx` | UI (React) | Barra superior de progreso con 4 indicadores de estado visual (`🟩` acierto, `🟥` fallo, `⏳` activa, `⚪` pendiente). |
| `src/components/games/kanji/stages/KanjiReadingStage.tsx` | UI (React) | Etapa 1: Lectura en Hiragana con 1 solo intento, feedback de error pedagógico con respuesta revelada y avance de etapa. |
| `src/components/games/kanji/stages/KanjiMeaningStage.tsx` | UI (React) | Etapa 2: Significado en español con 4 alternativas deterministas (1 correcta, 3 distractores), 1 intento y respuesta pedagógica. |
| `src/components/games/kanji/stages/KanjiRomajiStage.tsx` | UI (React) | Etapa 3: Transcripción fonética a romaji estándar con 1 intento y revelación pedagógica ante fallo. |
| `src/components/games/kanji/stages/KanjiStrokeStage.tsx` | UI (React) | Etapa 4: Canvas interactivo gobernado por `hanzi-writer` con validación estricta de orden y orientación de trazos más animación guía. |
| `src/components/games/kanji/KanjiSummaryModal.tsx` | UI (React) | Modal final tras completar las 4 etapas con contador de racha, grilla de 4 emojis y acción "Toque a un amigo". |
| `src/utils/kanjiShare.ts` | Utilidades / Social | Formateo del mensaje social de 4 emojis y ejecución de Web Share API con fallback a URL WhatsApp y portapapeles. |
| `src/pages/kanji/index.astro` | Rutas (Astro SSG) | Página estática que define el layout, metatags SEO y monta la isla React `DailyKanjiGame` con directiva `client:only="React"`. |

---

## 📊 2. Impacto en Tipos y Datos

### Modelos y Contratos en `src/types/kanji.ts`:
```typescript
export type KanjiStageKey = "reading" | "meaning" | "romaji" | "strokes";

export type StageOutcome = "success" | "failure"; // 'success' = 🟩, 'failure' = 🟥

export type InputMode = "multiple_choice" | "direct_input";

export interface KanaItem {
  kana: string;
  romaji: string;
  type: "hiragana" | "katakana";
}

export interface KanjiN5 {
  id: string;
  kanji: string;
  unicode: string;
  readings: {
    on: string[];
    kun: string[];
  };
  meanings: string[];
  romaji: string[];
  words?: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
}

export interface KanjiStageProgress {
  stage: KanjiStageKey;
  attempted: boolean;
  outcome: StageOutcome | null;
  userAnswer?: string;
  revealedAnswer?: string;
}

export interface KanjiDailyState {
  date: string; // "YYYY-MM-DD"
  kanjiId: string;
  currentStageIndex: number; // 0: reading, 1: meaning, 2: romaji, 3: strokes, 4: completed
  stages: Record<KanjiStageKey, KanjiStageProgress>;
  isCompleted: boolean;
  streak: number;
  lastPlayedDate: string | null;
}

export interface KanjiStats {
  currentStreak: number;
  maxStreak: number;
  totalDaysPlayed: number;
  totalPerfectDays: number; // 4 aciertos (🟩🟩🟩🟩)
  lastCompletedDate: string | null;
}
```

### Persistencia en `localStorage` (Claves Gestionadas por `kanjiRepository`):
- `fabrigames_kanji_daily_progress`: Almacena el `KanjiDailyState` incremental con la fecha actual.
- `fabrigames_kanji_stats`: Almacena el registro acumulativo de `KanjiStats`.
- `fabrigames_kanji_input_mode`: Preferencia de usuario para el toggle ("multiple_choice" | "direct_input").

---

## 🧮 3. Funciones Puras y Determinismo

### 3.1. Algoritmo Determinista con `rand-seed` (Art. I)
- **Función:** `getDailyKanji(kanjiList: KanjiN5[], dateStr: string): KanjiN5`
  - Se genera la semilla estricta concatenando `YYYYMMDD + "kanji"` (ej: `20261004kanji`).
  - Se inicializa una instancia de `Rand(seed)` de la librería `rand-seed`.
  - El índice diario se obtiene calculando `Math.floor(rng.next() * kanjiList.length)`.
  - Garantiza idéntico objetivo para todos los usuarios en la misma fecha local sin recurrir a `Math.random()`.

### 3.2. Generación Determinista de Distractores para Significado (Art. I)
- **Función:** `getMeaningOptions(targetKanji: KanjiN5, kanjiList: KanjiN5[], dateStr: string): string[]`
  - Utiliza el mismo generador PRNG determinista inicializado con la semilla diaria para seleccionar 3 distractores aleatorios de otros kanjis de la lista, mezclando deterministamente las 4 opciones finales.

### 3.3. Conversión Fonética Romaji a Hiragana
- **Función:** `convertRomajiToHiragana(input: string): string`
  - Mapeo directo y recursivo de sílabas romaji estándar (Hepburn) hacia caracteres hiragana mientras el usuario escribe en tiempo real en el modo de entrada directa.
- **Función:** `normalizeAnswer(text: string): string`
  - Normaliza caracteres eliminando espacios extremos, reduciendo diacríticos y transformando a minúsculas para comparaciones robustas.

---

## 🏝️ 4. Arquitectura de Estado e Islas

### 4.1. Directiva de Hidratación en Astro
- **Página Astro:** `src/pages/kanji/index.astro`.
- **Directiva:** `<DailyKanjiGame client:only="React" />`.
  - **Justificación:** `hanzi-writer` interactúa directamente con el DOM y el elemento `<svg>/<canvas>`, y la persistencia requiere acceso temprano y exclusivo a `localStorage` y `window`. La directiva `client:only="React"` previene inconsistencias de SSR y falsas hidrataciones.

### 4.2. Estado con Zustand (`useKanjiStore`)
- Administra el estado completo del reto del día:
  - `kanjiTarget`: Kanji del día.
  - `currentStageIndex`: Índice numérico de etapa actual (0 a 4).
  - `stages`: Registro de cada etapa (`reading`, `meaning`, `romaji`, `strokes`) con su estado y resultado (`success` o `failure`).
  - `inputMode`: Modo de respuesta activo (`multiple_choice` o `direct_input`).
  - `isEducationalFeedbackOpen`: Booleano para pausar la vista y mostrar la respuesta revelada antes de avanzar tras un fallo.
  - Acciones:
    - `initializeDaily(dateStr, kanjis)`: Carga el estado guardado o inicializa nuevo si cambió la fecha.
    - `setInputMode(mode)`: Alterna el toggle y persiste preferencia.
    - `submitStageAnswer(answer)`: Procesa el único intento, determina acierto (`🟩`) o fallo (`🟥`), activa feedback y guarda incrementalmente con `kanjiRepository`.
    - `advanceToNextStage()`: Concluye la etapa pedagógica y salta a la siguiente.
    - `completeStrokes()`: Registra la finalización del canvas interactivo y actualiza la racha diaria.

### 4.3. Capa de Repositorio (`kanjiRepository`)
- Encapsula `localStorage` con métodos:
  - `getDailyProgress(dateStr: string): KanjiDailyState | null`
  - `saveIncrementalProgress(state: KanjiDailyState): void`
  - `getStats(): KanjiStats`
  - `updateStreakAndStats(dateStr: string, isPerfect: boolean): KanjiStats`
  - `getInputModePreference(): InputMode`
  - `saveInputModePreference(mode: InputMode): void`

---

## 🎨 5. Theming y Estilos (Tailwind CSS v4)
- **Tipografía Japonesa:** Fuentes del sistema optimizadas para ideogramas CJK (`font-sans` con fallback `Noto Sans JP`, `Hiragino Kaku Gothic Pro`, `Meiryo`).
- **Colores de Feedback EARS / Wordle:**
  - Acierto: `bg-emerald-500/20 text-emerald-400 border-emerald-500` (🟩).
  - Fallo pedagógico: `bg-rose-500/20 text-rose-400 border-rose-500` (🟥).
  - Activo / Foco: `border-amber-400 text-amber-300`.
- **Canvas de Hanzi Writer:** Fondo oscuro retro con retícula tradicional de caligrafía en cruz punteada (*mizu-grid*).

---

## 📐 6. Contratos de Interfaz (TypeScript)

```typescript
// Contrato de la API de compartir
export interface ShareResultPayload {
  streak: number;
  grid: string; // ej: "🟩🟥🟩🟩"
  dateStr: string;
  gameUrl: string;
}

export interface KanjiRepositoryContract {
  getDailyProgress(date: string): KanjiDailyState | null;
  saveIncrementalProgress(state: KanjiDailyState): void;
  getStats(): KanjiStats;
  updateStreakAndStats(date: string, isPerfect: boolean): KanjiStats;
  getInputModePreference(): InputMode;
  saveInputModePreference(mode: InputMode): void;
}
```

---

## ⚖️ 7. Decisiones Técnicas Justificadas

| Decisión Técnica | Alternativa Descartada | Justificación |
| :--- | :--- | :--- |
| **`client:only="React"` en `/kanji`** | `client:load` con SSR híbrido | `hanzi-writer` requiere acceso estricto al DOM del navegador y APIs gráficas SVG. El SSR provocaría errores de ejecución o hydration mismatches innecesarios. |
| **Persistencia incremental por etapa** | Persistencia únicamente al finalizar las 4 etapas | Si un usuario móvil recibe una llamada o recarga el navegador en la etapa 3, la persistencia incremental evita la frustración de reiniciar el reto desde cero y previene trampas de reintento. |
| **1 solo intento con revelación pedagógica** | Intentos ilimitados con penalización | Alinea la experiencia con la tensión competitiva de Wordle/Arknightdle, manteniendo alto valor didáctico al enseñar inmediatamente la lectura/significado correcto tras el error. |
| **Toggle de Selección Múltiple vs Escritura Directa** | Obligar un único tipo de entrada | Maximiza la accesibilidad para principiantes absolutos (múltiple opción) y practicantes avanzados (escritura directa con conversión romaji a kana). |
| **Semilla determinista estricta `YYYYMMDD + "kanji"`** | Semilla basada en timestamp o hash simple | Cumplimiento estricto del Art. I de la Constitución de Ingeniería para asegurar reproducibilidad universal. |
| **`hanzi-writer` vía paquete npm** | Canvas HTML5 dibujado manualmente desde cero | `hanzi-writer` incluye la base de datos de trazos KanjiVG estandarizada con algoritmos probados de detección de dirección, orden y animación. |
| **Datasets en `src/data/kanji/` con import estático** | Archivos estáticos en `public/data/` consumidos con `fetch` | El estándar del repositorio aloja los datasets locales en `src/data/` (`@data/*`), eliminando la necesidad de `fetch` asíncrono en cliente, evitando errores de red o 404, y optimizando el bundle durante la compilación. |

---

## 🧪 8. Estrategia de Verificación y Pruebas

| Requisito Funcional | Estrategia de Verificación | Criterio de Éxito |
| :--- | :--- | :--- |
| **RF-1 a RF-4** (Determinismo diario) | Ejecutar prueba unitaria/script con fecha simulada idéntica en dos instancias. | Se obtiene idéntico kanji y mismos distractores. |
| **RF-5 a RF-7** (Toggle de modo) | Probar interacción en UI alternando entre selección múltiple y escritura directa. | El modo cambia al instante y transcribe romaji a hiragana en el input de texto. |
| **RF-8 a RF-15** (1 intento y feedback educativo) | Probar respuesta incorrecta deliberada en etapas 1, 2 y 3. | Se registra `🟥`, se revela la respuesta correcta en pantalla y se avanza sin conceder un segundo intento. |
| **RF-16 a RF-19** (Canvas de trazos) | Interactuar con el canvas ejecutando trazo incorrecto y trazo correcto. | El trazo incorrecto se resalta y muestra animación; el correcto se fija hasta completar el ideograma. |
| **RF-20 a RF-23** (Persistencia incremental y racha) | Responder etapas 1 y 2, recargar la página (`F5`). | La partida reanuda en etapa 3 conservando los resultados previos de etapas 1 y 2. |
| **RF-24 a RF-26** (Modal social y compartir) | Completar etapa 4 y accionar "Toque a un amigo". | Se abre Web Share API o genera URL WhatsApp con la grilla exacta de 4 emojis (`🟩`/`🟥`) y la racha. |

- **Verificación Técnica Global:** Ejecución de `npm run build` sin errores de compilación TypeScript ni empaquetado Astro.
- **Verificación Responsive:** Verificación en viewport móvil (375px) y escritorio para confirmar que el canvas de trazos y las opciones sean plenamente usables.
