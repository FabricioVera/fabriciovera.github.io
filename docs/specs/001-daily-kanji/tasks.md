# Tareas de Implementación: Daily Kanji [/kanji] (20 Ítems por Modalidad)

- **Spec Asociada:** [`spec.md`](spec.md)
- **Plan Técnico:** [`plan.md`](plan.md)
- **Estado:** en progreso (T1-T7 completadas, planificando T8-T13)
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

---

### 🟩 Tarea T5: Navegación No Lineal y Selector Libre de Modalidades
- **Objetivo:** Permitir al usuario cambiar de etapa o modalidad en cualquier momento sin requerir terminar la actual.
- **Archivos:**
  - `src/store/useKanjiStore.ts`
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/components/games/kanji/KanjiProgressBar.tsx`
- **Detalle de implementación:**
  1. En `useKanjiStore`: añadir acción `setCurrentStage(stageIndex: number)`. Al activarse, ajusta `currentStageIndex` y sitúa `currentQuestionIndex` en el primer ejercicio pendiente de esa etapa (o 0 si ya concluyó o está vacía).
  2. En la UI: renderizar selector de pestañas o botones interactivos accesibles (`[📖 Lectura] [💡 Significado] [🔤 Romaji] [✍️ Trazos]`), reflejando la cantidad de respondidas / puntuación en cada una y permitiendo el cambio instantáneo.
- **Criterio de Aceptación:** Se puede alternar entre las 4 pestañas libremente en cualquier momento manteniendo intacto el progreso de cada una.
- **Estado:** [x]

---

### 🟩 Tarea T6: Paginación Interactiva (1..20) Integrada a KanjiProgressBar con Conteo de Aciertos
- **Objetivo:** Integrar la botonera de 20 ejercicios y el historial de aciertos directamente dentro de `KanjiProgressBar` (eliminando barras de progreso duplicadas) e incorporar el contador en vivo de aciertos en la misma cabecera de paginación junto a `Ejercicios (1-20)`.
- **Archivos:**
  - `src/store/useKanjiStore.ts`
  - `src/components/games/kanji/KanjiPaginationBar.tsx`
  - `src/components/games/kanji/KanjiProgressBar.tsx`
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/components/games/kanji/stages/KanjiReadingStage.tsx`
  - `src/components/games/kanji/stages/KanjiMeaningStage.tsx`
  - `src/components/games/kanji/stages/KanjiVocabStage.tsx`
  - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
- **Detalle de implementación:**
  1. En `useKanjiStore`: acción `goToQuestion(index: number)` para cambiar directamente `currentQuestionIndex`.
  2. En `KanjiPaginationBar.tsx`: renderizar 20 botones compactos numerados (1..20) con colores de estado (verde para aciertos, rojo para fallos, neutro para pendientes, anillo ámbar para activo) e incorporar en su cabecera `Ejercicios (1-20) • Aciertos: X/20` junto a la leyenda.
  3. En `KanjiProgressBar.tsx`: embeber `KanjiPaginationBar embedded stageIndex={activeStageIdx}` sustituyendo la sub-barra de progreso lineal redundante.
  4. En cada componente de etapa: detectar si `currentStage.answers` ya contiene una respuesta para el kanji activo:
     - Si está respondido: deshabilitar controles de respuesta, marcar la opción seleccionada, resaltar la correcta y mostrar tarjeta con el resultado histórico (`userAnswer`, `correctAnswer`, `isCorrect`).
     - Para trazos: si ya fue completado, indicar "Completado ✅" y permitir re-dibujar como práctica libre.
- **Criterio de Aceptación:** La barra de progreso y la paginación están unificadas en un solo componente cohesivo; los aciertos aparecen junto a `Ejercicios (1-20)` y el usuario puede saltar a cualquier ejercicio 1..20.
- **Estado:** [x]

---

### 🟩 Tarea T7: Fuentes Japonesas de Alta Legibilidad y Selector de Tipografía
- **Objetivo:** Cargar familias de Google Fonts optimizadas para kanjis japoneses y proveer un selector interactivo para probarlas y persistir la preferencia.
- **Archivos:**
  - `src/types/kanji.ts`
  - `src/styles/global.css`
  - `src/components/games/kanji/KanjiFontSelector.tsx` (Nuevo)
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/services/kanjiRepository.ts`
- **Detalle de implementación:**
  1. En `src/styles/global.css`: importar Noto Sans JP, Zen Kaku Gothic New, BIZ UDPGothic, Klee One y Zen Maru Gothic de Google Fonts con clases utilitarias (`font-noto-sans-jp`, `font-zen-kaku`, `font-biz-ud`, `font-klee-one`, `font-zen-maru`).
  2. En `src/types/kanji.ts`: definir `KanjiFontFamily`.
  3. Crear `KanjiFontSelector.tsx`: selector accesible que permite cambiar entre las fuentes en vivo con vista previa.
  4. En `DailyKanjiGame.tsx`: aplicar la clase de fuente seleccionada al contenedor del juego y persistir la elección en `localStorage`.
- **Criterio de Aceptación:** El usuario puede alternar entre las 5 tipografías en tiempo real y notar el cambio tipográfico inmediato en los kanjis y textos japoneses.
- **Estado:** [x]

---

### 🟩 Tarea T8: Catálogo Extendido de 1000 Kanjis con Vocabulario Compuesto
- **Objetivo:** Crear y cargar una base de datos estática con al menos 1000 kanjis más frecuentes (Jouyou) estructurados con lecturas, significados en español y palabras compuestas reales (`words: { japanese, kana, meaning }[]`).
- **Archivos:**
  - `src/data/kanji/top1000.json` (Nuevo)
  - `public/data/kanji/jouyou1000.json` (Nuevo)
  - `src/types/kanji.ts`
  - `src/store/useKanjiStore.ts`
- **Detalle de implementación:**
  1. Compilar o generar `public/data/kanji/jouyou1000.json` y `src/data/kanji/top1000.json` con los 1000 kanjis más utilizados de Japón conteniendo `id`, `kanji`, `unicode`, `readings` (`on`, `kun`), `meanings` (español) y `words` (lista de compuestos reales con kanji, kana y significado en español).
  2. Actualizar el cargador en `useKanjiStore` y `getDailyKanjiList` para utilizar este catálogo expandido, garantizando selección determinista PRNG de 20 kanjis diarios.
  3. Proveer fallback seguro a `n5.json` en caso de fallo de red o contingencia.
- **Criterio de Aceptación:** Dataset de 1000 kanjis válido, determinismo verificado sobre 1000 ítems y 0 errores de carga.
- **Estado:** [x]

---

### 🟩 Tarea T9: Modal y Botón de Referencia Rápida de Kanas (Hiragana y Katakana)
- **Objetivo:** Proveer un botón accesible en la cabecera del juego que abra un modal flotante con la tabla completa de caracteres Hiragana y Katakana junto a sus lecturas en Romaji.
- **Archivos:**
  - `src/components/games/kanji/KanaReferenceModal.tsx` (Nuevo)
  - `src/components/games/kanji/DailyKanjiGame.tsx`
- **Detalle de implementación:**
  1. Crear `KanaReferenceModal.tsx` leyendo de `public/data/kana.json`:
     - Pestañas accesibles para Hiragana y Katakana.
     - Grilla visual limpia y ordenada por filas fonéticas (a, ka, sa, ta, na, ha, ma, ya, ra, wa, n + dakuon y diptongos) mostrando el caracter japonés en grande y su romaji debajo.
     - Botón de cierre y cierre con tecla Escape o clic fuera.
  2. En `DailyKanjiGame.tsx`: añadir botón compacto (ej. `[あ/ア Silabario]`) en la barra de herramientas superior junto al selector de fuentes.
- **Criterio de Aceptación:** El modal se abre y cierra fluidamente sin perder el foco ni el estado de la pregunta activa.
- **Estado:** [x]

---

### 🟩 Tarea T10: Reemplazo de Modalidad Romaji por Vocabulario Compuesto (Jukugo)
- **Objetivo:** Sustituir la etapa de romaji por una modalidad pedagógica de vocabulario compuesto donde se presenta el kanji combinado con otros caracteres (ej. `大人` -> adulto).
- **Archivos:**
  - `src/types/kanji.ts`
  - `src/utils/kanji.ts`
  - `src/store/useKanjiStore.ts`
  - `src/components/games/kanji/stages/KanjiVocabStage.tsx` (Nuevo)
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/components/games/kanji/KanjiProgressBar.tsx`
  - `src/components/games/kanji/KanjiSummaryModal.tsx`
  - `src/utils/kanjiShare.ts`
- **Detalle de implementación:**
  1. En `src/types/kanji.ts`: actualizar `KanjiStageKey = "reading" | "meaning" | "vocabulary" | "strokes"`.
  2. En `useKanjiStore`: actualizar configuración de etapas para inicializar y evaluar `vocabulary` en lugar de `romaji`.
  3. Crear `KanjiVocabStage.tsx`:
     - Selecciona deterministamente una palabra compuesta del kanji activo (`kanjiTarget.words`).
     - Renderiza la palabra compuesta en tipografía destacada.
     - Genera 4 alternativas (1 significado correcto y 3 distractores de otras palabras del catálogo) en modo selección múltiple, o valida la respuesta en modo escritura directa.
     - Soporta modo revisión con respuestas históricas al navegar con la paginación.
  4. Actualizar `KanjiSummaryModal.tsx` y `kanjiShare.ts` para mostrar `📚 Vocabulario: X / 20`.
- **Criterio de Aceptación:** La etapa 3 evalúa palabras compuestas, registra aciertos y fallos, y actualiza el desglose en el resumen final.
- **Estado:** [x]

---

### 🟩 Tarea T11: Modalidad de Trazos Inversos (Español + Pronunciación ➔ Dibujar Kanji)
- **Objetivo:** Transformar la etapa de trazos en un desafío de memoria activa donde se proporciona la palabra en español y la lectura en kana/romaji, debiendo el jugador dibujar el kanji objetivo desde cero sin silueta previa.
- **Archivos:**
  - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
  - `src/store/useKanjiStore.ts`
- **Detalle de implementación:**
  1. En `KanjiStrokeStage.tsx`:
     - Ocultar la silueta inicial del kanji en el lienzo `HanziWriter` (`showOutline: false`, `showCharacter: false`).
     - Presentar como consigna principal: palabra en español destacada y lectura fonética de apoyo (`hiragana` y `romaji`).
     - Permitir al usuario trazar libremente en la cuadrícula de caligrafía.
     - Validación en vivo de orden y orientación: trazo correcto se plasma en el lienzo.
     - Ante error: animación ilustrativa del trazo correcto para guiar pedagógicamente al estudiante.
     - Botón de asistencia didáctica "Ver trazo" para animar el siguiente trazo si el usuario lo necesita.
     - Al completar todos los trazos: feedback de kanji dominado y avance al siguiente ítem.
     - En modo revisión: permitir volver a practicar el kanji trazado sin alterar el puntaje.
- **Criterio de Aceptación:** Se solicita el kanji a partir del español y la lectura, el lienzo comienza en blanco y guía correctamente ante errores.
- **Estado:** [x]

---

### 🟩 Tarea T12: Navegación Fluida por Teclado con Tecla Enter
- **Objetivo:** Permitir avanzar a la siguiente pregunta presionando la tecla `Enter` cuando la respuesta ya fue emitida (feedback visible) o cuando se revisa un ejercicio contestado.
- **Archivos:**
  - `src/components/games/kanji/DailyKanjiGame.tsx`
- **Detalle de implementación:**
  1. Registrar listener global `keydown` en `DailyKanjiGame.tsx`.
  2. Al presionar `Enter`:
     - Si hay feedback activo (`isFeedbackOpen`) o el ejercicio actual ya fue respondido (`hasAnsweredCurrent` en modo revisión):
       - Ejecutar `advanceAfterFeedback()`.
       - Prevenir comportamiento por defecto (`e.preventDefault()`).
  3. Asegurar limpieza del listener en el unmount del efecto.
- **Criterio de Aceptación:** Presionar Enter en teclado avanza instantáneamente a la siguiente pregunta tras responder.
- **Estado:** [x]

---

### 🟩 Tarea T13: Mantener la Interfaz Limpia y Directa (Cero Subtítulos Redundantes)
- **Objetivo:** Aplicar la regla de mantener la interfaz limpia eliminando todos los subtítulos y párrafos redundantes debajo de los encabezados en los componentes del juego Daily Kanji para una experiencia concisa y moderna.
- **Archivos:**
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/components/games/kanji/KanjiProgressBar.tsx`
  - `src/components/games/kanji/stages/KanjiReadingStage.tsx`
  - `src/components/games/kanji/stages/KanjiMeaningStage.tsx`
  - `src/components/games/kanji/stages/KanjiVocabStage.tsx`
  - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
  - `src/components/games/kanji/KanjiSummaryModal.tsx`
- **Detalle de implementación:**
  1. Eliminar textos secundarios explicativos bajo títulos (ej. descripciones redundantes o subtítulos de progreso).
  2. Mantener únicamente los encabezados esenciales, badges compactos y las consignas directas.
  3. Ejecutar `npm run build` y verificar que la UI luce limpia, sin subtítulos y compila sin errores.
- **Criterio de Aceptación:** Ningún componente o vista de Daily Kanji presenta subtítulos o párrafos descriptivos bajo sus encabezados.
- **Estado:** [x]

---

### 🟩 Tarea T14: Sidebar de Repaso de Kanjis con Errores (Cuaderno de Errores)
- **Objetivo:** Guardar automáticamente en almacenamiento persistente los kanjis en los que el usuario cometa un error (en cualquiera de las 4 modalidades) y desplegarlos en un panel lateral (sidebar) no intrusivo para repaso, con enlace a `japonesbasico.com`, significado en español, escritura en romaji y botón para eliminarlos individualmente con una pequeña `x`.
- **Archivos:**
  - `src/types/kanji.ts`
  - `src/services/kanjiRepository.ts`
  - `src/store/useKanjiStore.ts`
  - `src/components/games/kanji/KanjiReviewSidebar.tsx` (Nuevo)
  - `src/components/games/kanji/DailyKanjiGame.tsx`
  - `src/components/games/kanji/stages/KanjiStrokeStage.tsx`
- **Detalle de implementación:**
  1. En `src/types/kanji.ts`: definir la interfaz `ReviewKanjiItem` (`id`, `kanji`, `meaning`, `romaji`, `readingKana`, `mistakeCount`, `addedAt`).
  2. En `src/services/kanjiRepository.ts`: agregar `KANJI_STORAGE_KEYS.REVIEW_LIST` y métodos CRUD de persistencia en `localStorage` (`getReviewList`, `saveReviewList`, `addKanjiToReview`, `removeKanjiFromReview`, `clearReviewList`).
  3. En `src/store/useKanjiStore.ts`:
     - Agregar `reviewList: ReviewKanjiItem[]` al estado inicial.
     - En `submitAnswer`: ante respuesta incorrecta (`!isCorrect`), llamar a `kanjiRepository.addKanjiToReview(kanjiTarget)`.
     - Exponer acciones `addKanjiToReview`, `removeKanjiFromReview` y `clearReviewList`.
  4. En `KanjiStrokeStage.tsx`: en el callback `onMistake` de `HanziWriter`, registrar el kanji objetivo en la lista de repaso.
  5. Crear `KanjiReviewSidebar.tsx`:
     - Drawer lateral derecho no intrusivo (`fixed right-0 h-screen w-84 sm:w-96`) sin backdrop en desktop para permitir interacción con el juego activo.
     - Cabecera limpia sin subtítulos conforme a las directivas de diseño.
     - Elementos de lista con componente `KanjiLink` hacia `https://japonesbasico.com/kanji/{kanji}` respetando el estilo tipográfico exacto.
     - Despliegue de significado en español y pronunciación en romaji.
     - Pequeño botón `✕` accesible para eliminar individualmente kanjis repasados.
  6. En `DailyKanjiGame.tsx`: integrar el botón `[📝 Repaso]` con badge dinámico del total de kanjis pendientes e instanciar `<KanjiReviewSidebar />`.
- **Criterio de Aceptación:** Cualquier fallo en las etapas de lectura, significado, vocabulario o trazos almacena el kanji en el sidebar de repaso; se puede consultar en cualquier momento, visitar su ficha en japonesbasico.com y eliminar con la `x`.
- **Estado:** [x]

