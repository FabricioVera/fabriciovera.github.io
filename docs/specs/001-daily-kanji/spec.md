# Spec 001 — Daily Kanji [/kanji] (Aprender Japonés)

- **Estado:** implementada
- **Fecha:** 2026-10-04
- **Rama:** feat/daily-kanji-20-items

---

## 🎯 1. Contexto y Objetivo
El aprendizaje de caracteres japoneses (kanji) requiere práctica constante y multisensorial: reconocimiento visual, memorización de lecturas (on'yomi y kun'yomi), comprensión de significado y motricidad en el orden de trazos.
El objetivo de **Daily Kanji** es integrar a FabriGames una experiencia exclusivamente diaria (**100% Daily**, sin modo infinito ni rerolls) estructurada en **4 etapas o modalidades consecutivas de 20 preguntas/ítems cada una** (20 lecturas, 20 significados, 20 romaji y 20 trazos, para un total de 80 retos evaluativos diarios) basadas en una selección determinista de 20 kanjis N5 esenciales.
La mecánica aplica una regla estricta de **1 solo intento por ítem**: ante un fallo, se prioriza el valor pedagógico revelando de inmediato la respuesta correcta y avanzando al siguiente ítem. Se ofrece versatilidad cognitiva mediante un toggle entre selección múltiple y escritura directa con conversión automática, persistencia incremental granular (etapa + pregunta activa) y viralidad social con puntaje acumulado por juego (ej. `Lectura: 18/20`, etc.).

---

## 👥 2. Usuarios y Actores
- **Estudiante Diario de Japonés:** Busca una sesión de práctica integral de 5 a 8 minutos para consolidar vocabulario y caligrafía de 20 kanjis N5 cada día.
- **Jugador Competitivo de FabriGames:** Acude a medianoche local para mantener su racha activa, lograr el puntaje perfecto (80/80 aciertos) y compartir su resumen de aciertos por modalidad.
- **Usuario Táctil / Móvil:** Dibuja trazos con el dedo y alterna cómodamente entre tocar opciones de selección múltiple o tipear en el teclado virtual.

---

## 📖 3. Historias de Usuario
- **HU-1 (Reto Diario Unificado de 20 Kanjis):** Como jugador diario, quiero recibir la misma lista ordenada de 20 kanjis objetivo cada día sin rerolls, para competir en igualdad de condiciones con toda la comunidad.
- **HU-2 (Elección de Modalidad de Respuesta):** Como estudiante, quiero alternar entre Selección Múltiple (4 alternativas) y Escritura Directa (teclado con transcripción automática) para adaptar el desafío a mi nivel de dominio.
- **HU-3 (Intento Único con Avance Progresivo):** Como aprendiz, quiero tener 1 solo intento por pregunta con feedback pedagógico inmediato al fallar, avanzando fluidamente a través de los 20 ítems de cada etapa.
- **HU-4 (Persistencia Continua por Pregunta y Etapa):** Como usuario móvil sujeto a interrupciones, quiero que cada una de las 20 preguntas resueltas se guarde al instante para reanudar mi partida exactamente donde me quedé sin perder progreso.
- **HU-5 (Etapa de Trazos Interactiva en Serie):** Como estudiante, quiero trazar secuencialmente los 20 kanjis del día en el lienzo interactivo con validación de orden y orientación en tiempo real.
- **HU-6 (Racha Acumulada):** Como jugador constante, quiero mantener y visualizar mi contador de días consecutivos completados para medir mi constancia en el estudio.
- **HU-7 (Viralidad con Desglose de Puntaje):** Como usuario que completó su sesión, quiero compartir mi resultado desglosado (puntuación sobre 20 por cada una de las 4 modalidades) vía Web Share API o WhatsApp.

---

## 📚 4. Definiciones
- **100% Modo Daily:** Modalidad única y obligatoria. La lista de 20 kanjis y sus preguntas es idéntica universalmente cada día.
- **Semilla Determinista:** Cadena con formato estricto `YYYYMMDD + "kanji"` calculada con la fecha local del jugador para alimentar el generador PRNG `rand-seed` y barajar/seleccionar los 20 kanjis del día sin repetición.
- **Tanda de 20 Ítems:** Serie de 20 desafíos consecutivos correspondientes a una misma modalidad pedagógica (Lectura, Significado, Romaji o Trazos).
- **Intento Único por Pregunta:** Cada una de las 20 preguntas admite exactamente 1 respuesta definitiva. No hay reintentos en la misma pregunta.
- **Feedback Educativo Inmediato:** Revelación visual de la solución oficial inmediatamente después de emitir una respuesta errónea.
- **Modo Selección Múltiple:** Presentación de 4 botones con opciones (1 correcta y 3 distractores deterministas).
- **Modo Escritura Directa:** Campo de texto interactivo con motor de conversión fonética en tiempo real (romaji ➔ hiragana).
- **Puntaje por Etapa:** Número de aciertos sobre 20 obtenidos en cada una de las 4 etapas (`X / 20`).

---

## ⚙️ 5. Requisitos Funcionales (EARS en español)

### 5.1. Determinismo Diario y Selección de 20 Kanjis (Constitución Art. I)
- **RF-1:** CUANDO el usuario entra a `/kanji`, EL SISTEMA inicializa el generador PRNG `rand-seed` con la semilla exacta `YYYYMMDD + "kanji"` para barajar deterministamente el catálogo de kanjis N5 y seleccionar una lista ordenada de 20 kanjis únicos para el día.
- **RF-2:** EL SISTEMA garantiza de forma universal que dos usuarios que jueguen en la misma fecha local reciban la misma secuencia ordenada de 20 kanjis y las mismas opciones de selección múltiple.
- **RF-3:** EL SISTEMA restringe la interacción exclusivamente al reto diario, prohibiendo cualquier botón de reinicio, reroll o modalidad casual infinita.
- **RF-4:** SI la medianoche local es superada mientras la aplicación está abierta, ENTONCES EL SISTEMA detecta la nueva fecha y actualiza el reto diario al nuevo objetivo.

### 5.2. Modalidad de Respuesta y Toggle
- **RF-5:** EL SISTEMA proporciona un selector visible (toggle) que permite al usuario alternar en cualquier momento entre "Selección Múltiple" y "Escritura Directa" para las etapas evaluativas (Lectura, Significado, Romanización).
- **RF-6:** MIENTRAS el modo "Escritura Directa" esté seleccionado en la etapa de lectura, EL SISTEMA convierte automáticamente en tiempo real las combinaciones de teclas romaji introducidas en sus caracteres hiragana equivalentes.
- **RF-7:** MIENTRAS el modo "Selección Múltiple" esté seleccionado, EL SISTEMA renderiza 4 alternativas accesibles: la opción correcta y 3 distractores generados deterministamente de otros kanjis N5.

### 5.3. Estructura de 4 Etapas Consecutivas de 20 Preguntas
- **RF-8:** EL SISTEMA organiza el reto diario en 4 etapas ejecutadas estrictamente en orden secuencial:
  1. **Etapa 1: Lecturas (20 preguntas):** Identificar la lectura en hiragana de los 20 kanjis del día.
  2. **Etapa 2: Significados (20 preguntas):** Identificar el significado en español de los 20 kanjis del día.
  3. **Etapa 3: Romaji (20 preguntas):** Transcribir la lectura en romaji (Hepburn) de los 20 kanjis del día.
  4. **Etapa 4: Trazos (20 kanjis):** Trazar interactivamente en lienzo caligráfico los 20 kanjis del día.
- **RF-9:** EL SISTEMA muestra un indicador de avance de sub-pregunta visible (`Pregunta X de 20`) y una barra de progreso que refleja el avance dentro de la etapa activa y entre las 4 etapas globales.
- **RF-10:** EL SISTEMA restringe cada una de las preguntas individuales a exactamente 1 solo intento por parte del usuario.
- **RF-11:** CUANDO el usuario responde correctamente una pregunta, EL SISTEMA registra el acierto (`🟩`), muestra feedback positivo breve y transiciona al siguiente ítem (`k + 1`).
- **RF-12:** SI el usuario responde incorrectamente una pregunta, ENTONCES EL SISTEMA registra el fallo (`🟥`), resalta pedagógicamente la respuesta correcta y permite avanzar al siguiente ítem.
- **RF-13:** CUANDO concluye la pregunta 20 de una etapa, EL SISTEMA muestra un resumen intermedio de la etapa con el puntaje obtenido (`X / 20`) y habilita la transición a la siguiente etapa.

### 5.4. Etapa 4: Trazos Interactivos en Serie (20 Kanjis)
- **RF-14:** CUANDO el usuario ingresa a la Etapa 4, EL SISTEMA presenta el primer kanji (1/20) en el lienzo interactivo con cuadrícula de caligrafía.
- **RF-15:** MIENTRAS el usuario dibuja sobre el lienzo, EL SISTEMA valida en tiempo real el orden secuencial del trazo y su orientación vectorial.
- **RF-16:** SI el usuario comete un error de orden u orientación en un trazo, ENTONCES EL SISTEMA rechaza el trazo, reproduce una animación ilustrativa del trazo correcto y permite reintentarlo hasta completar el kanji.
- **RF-17:** CUANDO el usuario completa exitosamente el kanji actual de la serie de trazos, EL SISTEMA lo marca completado y carga el siguiente kanji (`1 ➔ 2 ➔ ... ➔ 20`).
- **RF-18:** CUANDO se completa el vigésimo kanji de trazos (20/20), EL SISTEMA declara el reto diario completamente finalizado y despliega el modal de resumen general.

### 5.5. Persistencia Incremental y Rachas (Constitución Art. III)
- **RF-19:** CUANDO el usuario responde cualquiera de las preguntas (en cualquiera de las 4 etapas), EL SISTEMA persiste inmediatamente el estado incremental en el almacenamiento local a través de `kanjiRepository` (`currentStageIndex`, `currentQuestionIndex`, mapa de aciertos/fallos).
- **RF-20:** SI el usuario recarga el navegador o regresa más tarde durante el mismo día, ENTONCES EL SISTEMA restaura automáticamente la partida en la etapa y pregunta exacta pendiente.
- **RF-21:** CUANDO concluyen las 4 etapas completas (los 80 retos), EL SISTEMA actualiza la racha del usuario: incrementa en 1 día si la última partida registrada fue el día previo consecutivo, o reinicia a 1 si la diferencia es mayor a un día calendario.
- **RF-22:** MIENTRAS el reto diario ya haya sido completado en su totalidad, EL SISTEMA muestra la vista resumen bloqueada en modo de solo lectura.

### 5.6. Viralidad y Resumen Social
- **RF-23:** CUANDO el reto diario finaliza, EL SISTEMA presenta un modal con:
  - Racha acumulada en días.
  - Puntaje desglosado por modalidad:
    - 📖 Lectura: `X / 20`
    - 💡 Significado: `Y / 20`
    - 🔤 Romaji: `Z / 20`
    - ✍️ Trazos: `20 / 20`
    - 🏆 Puntuación Total: `Total / 80`
  - Botón "Toque a un amigo" para compartir en redes.
- **RF-24:** CUANDO el usuario pulsa "Toque a un amigo", EL SISTEMA genera el texto resumen preformateado y utiliza la Web Share API nativa o redirección fallback a WhatsApp con opción de copiado al portapapeles.

---

## 🚀 6. Requisitos No Funcionales
- **Rendimiento:** Transición instantánea entre preguntas de la misma etapa (< 50ms) sin recargas ni parpadeos en pantalla.
- **Eficiencia de Memoria:** Destrucción y limpieza apropiada de las instancias de `HanziWriter` entre cada uno de los 20 kanjis de la etapa de trazos para evitar fugas de memoria (*memory leaks* en WebGL/SVG).
- **Responsive & Accesibilidad:** Diseño adaptable a pantallas móviles con controles de tamaño generoso para botones de opción y lienzo de trazos centrado.

---

## 🏛️ 7. Alineación con la Constitución (`docs/constitution.md`)
- **Art. I (Determinismo Diario):** Semilla única `YYYYMMDD + "kanji"` que alimenta un shuffle determinista de 20 kanjis y sus opciones. Todos los jugadores reciben los mismos 20 kanjis en el mismo orden cada día.
- **Art. II (Arquitectura de Islas):** Isla React única (`DailyKanjiGame client:only="React"`) desacoplada con Zustand para el control de etapas, sub-preguntas y puntajes.
- **Art. III (Repository Pattern):** `kanjiRepository` abstrae el guardado y restauración de la sesión de 20 ítems en `localStorage`.
- **Art. IV (Resiliencia):** Funcionamiento 100% offline; fallback en memoria si `localStorage` no está disponible.
- **Art. V (Tipado Estricto):** Modelado de datos en `KanjiDailyState` tipado estrictamente sin `any`.

---

## ⚠️ 8. Casos Límite (Edge Cases)
- **Recarga de página en la pregunta 14 de 20:** El sistema restaura exactamente la pregunta 14 con los aciertos/fallos de las preguntas 1 a 13 preservados.
- **Dataset N5 disponible:** El catálogo `src/data/kanji/n5.json` cuenta con 79 kanjis, garantizando una muestra suficiente para extraer 20 kanjis únicos sin repetición deterministamente cada día.
- **Limpieza de canvas de trazos:** Al pasar de un kanji al siguiente dentro de la Etapa 4, el canvas previo debe ser reseteado (`writer.destroy()`) antes de instanciar el nuevo kanji.

---

## 🚫 9. Fuera de Alcance (Out of Scope)
- Modos infinitos o selección libre de kanjis individuales.
- Botón de reinicio de la partida diaria (el reto diario se juega una sola vez).

---

## ✅ 10. Criterios de Finalización
- [ ] Selección determinista diaria de 20 kanjis únicos con semilla `YYYYMMDDkanji`.
- [ ] Etapa 1 completa: 20 preguntas de lectura con avance 1 a 20 e indicador visual.
- [ ] Etapa 2 completa: 20 preguntas de significado en español con avance 1 a 20.
- [ ] Etapa 3 completa: 20 preguntas de romaji con avance 1 a 20.
- [ ] Etapa 4 completa: 20 kanjis de trazo interactivo sucesivos con limpieza de canvas.
- [ ] Persistencia granular por etapa y sub-pregunta verificada en `localStorage`.
- [ ] Modal de resumen final con desglose sobre 20 por modalidad y puntaje global sobre 80.
- [ ] Viralidad y compartir ("Toque a un amigo") adaptado al formato de 20 ítems.
- [ ] Compilación TypeScript limpia (`npm run build`).
