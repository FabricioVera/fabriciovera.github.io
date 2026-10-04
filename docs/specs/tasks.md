# Tareas: Daily Kanji [/kanji] (Aprender Japonés)

- **Spec Asociada:** [`spec.md`](spec.md)
- **Plan Asociado:** [`plan.md`](plan.md)
- **Estado General:** 8/10 completadas

---

## 📋 Lista de Tareas Atómicas de Ejecución (20-30 min por ciclo)

- [x] **T1. Dependencia `hanzi-writer` y Datasets Estáticos (`kana.json` y `n5.json`).** (Cubre: RF-1, RF-2, RF-6, RF-7)
  - **Objetivo:** Instalar la librería cliente `hanzi-writer` en `package.json` y construir los datasets JSON en `src/data/kanji/` para kanas y kanjis JLPT N5 esenciales (con id, kanji, unicode, readings on/kun, meanings en español, romaji y palabras).
  - **Archivos Involucrados:**
    - `package.json`
    - `src/data/kanji/kana.json`
    - `src/data/kanji/n5.json`
  - **Criterios de Aceptación (Hecho cuando):**
    - `hanzi-writer` queda agregado a las dependencias del proyecto.
    - `src/data/kanji/kana.json` contiene la colección de hiragana y katakana con romaji.
    - `src/data/kanji/n5.json` contiene la colección estructurada de kanjis N5 con los campos requeridos.
    - Los archivos JSON tienen sintaxis válida comprobada.

- [x] **T2. Contratos y Tipos Estrictos de Dominio (`src/types/kanji.ts`).** (Cubre: RF-1 a RF-26, Art. V)
  - **Objetivo:** Definir todas las interfaces y contratos TypeScript necesarios para los modelos de datos, estados de las 4 etapas, persistencia incremental, resultados (`🟩`/`🟥`) y opciones de compartir.
  - **Archivos Involucrados:**
    - `src/types/kanji.ts`
  - **Criterios de Aceptación (Hecho cuando):**
    - Exporta `KanjiN5`, `KanaItem`, `KanjiStageKey`, `StageOutcome`, `InputMode`, `KanjiStageProgress`, `KanjiDailyState`, `KanjiStats` y `ShareResultPayload`.
    - Modo estricto sin uso de `any`.
    - Compilación TypeScript sin errores.

- [x] **T3. Funciones Puras, Determinismo con `rand-seed` y Conversor Kana (`src/utils/kanji.ts` y `src/utils/kanaConverter.ts`).** (Cubre: RF-1, RF-2, RF-6, RF-7, RF-15, Art. I)
  - **Objetivo:** Implementar la selección determinista del kanji diario (`getDailyKanji`) con semilla `YYYYMMDD + "kanji"`, el generador de distractores para selección múltiple, el conversor fonético en tiempo real romaji ➔ hiragana (`convertRomajiToHiragana`) y la función de normalización de respuestas.
  - **Archivos Involucrados:**
    - `src/utils/kanji.ts`
    - `src/utils/kanaConverter.ts`
  - **Criterios de Aceptación (Hecho cuando):**
    - `getDailyKanji` devuelve el mismo kanji para la misma fecha local y mismo catálogo.
    - `getMeaningOptions` genera 4 opciones estables (1 correcta y 3 distractores deterministas).
    - `convertRomajiToHiragana` transforma secuencias como "ka", "shi", "tsu", "kyo" a sus caracteres hiragana respectivos en tiempo real.
    - Cero errores de tipado.

- [x] **T4. Repositorio de Persistencia Incremental en Almacenamiento Local (`src/services/kanjiRepository.ts`).** (Cubre: RF-20, RF-21, RF-22, RF-23, Art. III, Art. IV)
  - **Objetivo:** Construir el servicio desacoplado `kanjiRepository` que gestione la lectura y guardado incremental del progreso por etapa (`KanjiDailyState`), la racha diaria de días consecutivos y las preferencias del toggle en `localStorage`.
  - **Archivos Involucrados:**
    - `src/services/kanjiRepository.ts`
  - **Criterios de Aceptación (Hecho cuando):**
    - `saveIncrementalProgress` almacena el avance tras resolver cada etapa individual.
    - `getDailyProgress` restaura la partida conservando las etapas resueltas si la fecha coincide con la actual.
    - `updateStreakAndStats` incrementa la racha si el último día jugado fue consecutivo o la reinicia a 1 si pasó más de un día.
    - Tolerancia total a entornos sin `window` o con cuota restringida sin lanzar excepciones no controladas.

- [x] **T5. Store de Estado del Reto Diario con Zustand (`src/store/useKanjiStore.ts`).** (Cubre: RF-3, RF-5, RF-8 a RF-15, RF-20, RF-21, Art. II)
  - **Objetivo:** Crear la máquina de estados en Zustand para orquestar el flujo diario exclusivo: etapas 0 a 4, regla de 1 solo intento por etapa con calificación `🟩`/`🟥`, activación de feedback pedagógico, toggle de modalidad de respuesta y sincronización automática con `kanjiRepository`.
  - **Archivos Involucrados:**
    - `src/store/useKanjiStore.ts`
  - **Criterios de Aceptación (Hecho cuando):**
    - El store expone el estado reactivo (`kanjiTarget`, `currentStageIndex`, `stages`, `inputMode`, `isFeedbackOpen`, `isCompleted`).
    - Acciones `initializeDaily`, `setInputMode`, `submitStageAnswer`, `advanceToNextStage` y `completeStrokes` implementadas y verificadas.
    - Cada envío de etapa persiste de inmediato en el repositorio.

- [x] **T6. Componentes de Cabecera y Toggle de Modalidad (`KanjiProgressBar.tsx` y `KanjiModeToggle.tsx`).** (Cubre: RF-5, RF-8, RF-20, RF-21)
  - **Objetivo:** Desarrollar los componentes visuales superiores: la barra de progreso que indica el estado de cada etapa (🟩 acierto, 🟥 fallo pedagógico, activa, pendiente) y el selector interactivo (toggle) accesible para alternar entre "Selección Múltiple" y "Escritura Directa".
  - **Archivos Involucrados:**
    - `src/components/games/kanji/KanjiProgressBar.tsx`
    - `src/components/games/kanji/KanjiModeToggle.tsx`
  - **Criterios de Aceptación (Hecho cuando):**
    - `KanjiProgressBar` refleja dinámicamente los emojis/colores correspondientes a cada etapa según el store.
    - `KanjiModeToggle` permite conmutar fluidamente entre modos de entrada y sincroniza con el store y el repositorio.
    - Estilos coherentes con Tailwind v4.

- [x] **T7. Minijuegos Evaluativos 1 a 3 con Intento Único y Feedback Pedagógico (`KanjiReadingStage.tsx`, `KanjiMeaningStage.tsx`, `KanjiRomajiStage.tsx`).** (Cubre: RF-4 a RF-15)
  - **Objetivo:** Implementar los componentes para las 3 etapas lingüísticas: Lectura (hiragana), Significado (español) y Romanización (romaji), soportando tanto selección de 4 opciones como input directo con conversión kana, restringiendo a 1 solo intento y mostrando la respuesta correcta ante fallo antes de avanzar.
  - **Archivos Involucrados:**
    - `src/components/games/kanji/stages/KanjiReadingStage.tsx`
    - `src/components/games/kanji/stages/KanjiMeaningStage.tsx`
    - `src/components/games/kanji/stages/KanjiRomajiStage.tsx`
  - **Criterios de Aceptación (Hecho cuando):**
    - Cada etapa procesa exactamente 1 intento y bloquea la interfaz de inmediato.
    - Si el usuario falla, se destaca la respuesta correcta y se permite avanzar con un botón de continuación.
    - En modo "Escritura Directa", el campo de lectura transcribe automáticamente el romaji escrito a hiragana.

- [x] **T8. Minijuego de Trazos con Canvas Interactivo y Hanzi Writer (`KanjiStrokeStage.tsx`).** (Cubre: RF-16 a RF-19)
  - **Objetivo:** Integrar la librería `hanzi-writer` dentro de un lienzo interactivo con cuadrícula de caligrafía, validación en tiempo real del orden y orientación de cada trazo, y animación de auxilio ante trazos erróneos.
  - **Archivos Involucrados:**
    - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
  - **Criterios de Aceptación (Hecho cuando):**
    - Renderiza el lienzo interactivo con el kanji del día y la cuadrícula guía.
    - Detecta eventos táctiles y de puntero para dibujar los trazos.
    - Si un trazo es erróneo, reproduce la animación del trazo correcto.
    - Al completar todos los trazos con éxito, notifica al store para finalizar el juego con `🟩`.

- [ ] **T9. Modal de Resumen y Viralidad Social ("Toque a un amigo") (`KanjiSummaryModal.tsx` y `kanjiShare.ts`).** (Cubre: RF-24, RF-25, RF-26)
  - **Objetivo:** Crear la utilidad `kanjiShare.ts` para construir el mensaje social con la racha, la cuadrícula de 4 emojis (`🟩`/`🟥`) y la URL, junto con el componente `KanjiSummaryModal.tsx` que ejecuta Web Share API con fallback a WhatsApp y copiado al portapapeles.
  - **Archivos Involucrados:**
    - `src/utils/kanjiShare.ts`
    - `src/components/games/kanji/KanjiSummaryModal.tsx`
  - **Criterios de Aceptación (Hecho cuando):**
    - El modal muestra la racha actual, el resultado de las 4 etapas y el kanji del día con sus significados.
    - El botón "Toque a un amigo" invoca `navigator.share` si está disponible.
    - Si no está disponible o falla, abre la URL directa de WhatsApp con el mensaje codificado y permite copiar al portapapeles.

- [ ] **T10. Contenedor Raíz, Ruta Astro, Registro en Catálogo y Verificación Global (`DailyKanjiGame.tsx`, `index.astro`, `games.ts`, `docs/progress.md`).** (Cubre: Todos los RFs)
  - **Objetivo:** Ensamblar el contenedor interactivo `DailyKanjiGame.tsx`, crear la página estática `src/pages/kanji/index.astro` con directiva `client:only="React"`, registrar `/kanji` en `src/data/games.ts` y validar el build completo del proyecto.
  - **Archivos Involucrados:**
    - `src/components/games/kanji/DailyKanjiGame.tsx`
    - `src/pages/kanji/index.astro`
    - `src/data/games.ts`
    - `docs/progress.md`
  - **Criterios de Aceptación (Hecho cuando):**
    - La ruta `/kanji` renderiza fluidamente la experiencia diaria completa.
    - `src/data/games.ts` expone `/kanji` en el catálogo de juegos.
    - `npm run build` ejecuta sin ningún error de TypeScript, Astro ni Rollup.
    - `docs/progress.md` queda actualizado reflejando la nueva feature en desarrollo/planificada.
