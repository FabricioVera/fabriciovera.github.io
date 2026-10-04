# Tareas de Implementación: Daily Kanji [/kanji] (20 Ítems por Modalidad)

- **Spec Asociada:** [`spec.md`](spec.md)
- **Plan Técnico:** [`plan.md`](plan.md)
- **Estado:** completado
- **Fecha:** 2026-10-04

---

## 📋 Lista de Tareas Atómicas

### 🟩 Tarea T1: Modelos de Dominio y Lógica Pura Determinista de 20 Kanjis
- **Objetivo:** Actualizar los contratos TypeScript y crear la función determinista para extraer los 20 kanjis únicos del día.
- **Archivos:**
  - `src/types/kanji.ts`
  - `src/types/index.ts`
  - `src/utils/kanji.ts`
- **Detalle de implementación:**
  1. Definir `StageAnswerRecord` con `kanjiId`, `kanjiCharacter`, `isCorrect`, `userAnswer` y `correctAnswer`.
  2. Actualizar `KanjiStageProgress` para incluir `score: number` (aciertos sobre 20) y `answers: StageAnswerRecord[]`.
  3. Actualizar `KanjiDailyState` incorporando `kanjiIds: string[]` (20 IDs del día), `currentQuestionIndex: number` (0 a 19) y `stages`.
  4. Implementar `getDailyKanjiList(allKanjis, dateStr, 20)` usando Fisher-Yates determinista sobre `rand-seed` (`YYYYMMDDkanji`).
  5. Asegurar que las opciones de selección múltiple se generen de manera determinista para cada uno de los 20 kanjis.
- **Criterio de Aceptación:** Build limpio de TypeScript y test de determinismo donde una fecha genera exactamente los mismos 20 kanjis.
- **Estado:** [x]

---

### 🟩 Tarea T2: Persistencia Granular en Repositorio y Store de Zustand para el Ciclo de 20 Ítems
- **Objetivo:** Implementar la máquina de estados y persistencia en `localStorage` capaz de registrar y restaurar el progreso exacto `(etapa, sub-pregunta)`.
- **Archivos:**
  - `src/services/kanjiRepository.ts`
  - `src/store/useKanjiStore.ts`
- **Detalle de implementación:**
  1. En `kanjiRepository`: adaptar serialización y carga de `KanjiDailyState` con array de 20 IDs y registro de respuestas.
  2. En `useKanjiStore`:
     - Estado con `dailyKanjis: KanjiN5[]` (20 ítems), `currentStageIndex` (0..3 o 4), `currentQuestionIndex` (0..19) y `stages`.
     - `kanjiTarget`: apuntador computado a `dailyKanjis[currentQuestionIndex]`.
     - `submitAnswer(answer)`: valida la respuesta para el kanji actual, actualiza score y respuestas de la etapa, abre feedback didáctico.
     - `advanceAfterFeedback()`: avanza a la siguiente pregunta (`currentQuestionIndex + 1`). Si llega a 20, transiciona a la siguiente etapa (`currentStageIndex + 1`, `currentQuestionIndex = 0`). Si concluye la etapa 4, finaliza el juego y calcula la racha.
- **Criterio de Aceptación:** El store maneja la secuencia de 20 preguntas con persistencia reactiva en cada respuesta.
- **Estado:** [x]

---

### 🟩 Tarea T3: Adaptación de Componentes de Etapas y Secuencia de 20 Trazos
- **Objetivo:** Refactorizar las 4 etapas de juego para consumir el kanji activo de los 20, con contador progresivo y gestión de memoria en HanziWriter.
- **Archivos:**
  - `src/components/games/kanji/KanjiProgressBar.tsx`
  - `src/components/games/kanji/stages/KanjiReadingStage.tsx`
  - `src/components/games/kanji/stages/KanjiMeaningStage.tsx`
  - `src/components/games/kanji/stages/KanjiRomajiStage.tsx`
  - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
  - `src/components/games/kanji/DailyKanjiGame.tsx`
- **Detalle de implementación:**
  1. `KanjiProgressBar`: mostrar etapa actual (`#1 Lectura`, etc.), sub-etiqueta `Pregunta X de 20`, aciertos acumulados (`X / 20`) y barra de progreso.
  2. `KanjiReadingStage`, `KanjiMeaningStage`, `KanjiRomajiStage`: mostrar kanji activo, botones/input de respuesta y feedback de acierto/fallo.
  3. `KanjiStrokeStage`: destruir la instancia previa de `HanziWriter` al cambiar de kanji (`writerRef.current.destroy()`) y cargar el siguiente hasta completar los 20 kanjis caligráficos.
  4. `DailyKanjiGame`: orquestar las vistas y transiciones fluidas.
- **Criterio de Aceptación:** Se pueden jugar las 20 preguntas de lectura, luego 20 significados, luego 20 romaji y 20 trazos continuos sin parpadeos ni errores.
- **Estado:** [x]

---

### 🟩 Tarea T4: Modal de Resumen Desglosado, Formateo Social y Verificación con Chrome DevTools
- **Objetivo:** Implementar la pantalla final de resultados con desglose de las 4 modalidades (sobre 20 cada una) y verificar la aplicación completa.
- **Archivos:**
  - `src/components/games/kanji/KanjiSummaryModal.tsx`
  - `src/utils/kanjiShare.ts`
- **Detalle de implementación:**
  1. `KanjiSummaryModal`: renderizar tarjetas de puntaje:
     - 📖 Lectura: `X / 20`
     - 💡 Significado: `Y / 20`
     - 🔤 Romaji: `Z / 20`
     - ✍️ Trazos: `20 / 20`
     - 🏆 Puntuación Total: `Total / 80`
     - Racha acumulada en días.
  2. `kanjiShare.ts`: generar texto para WhatsApp/portapapeles con el desglose sobre 20 y URL del juego.
  3. Ejecutar verificación interactiva con script DevTools Protocol y compilar con `npm run build`.
- **Criterio de Aceptación:** Modal de resultados correcto, build en verde y 0 errores de consola en el navegador.
- **Estado:** [x]
