# Spec 001 — Daily Kanji [/kanji] (Aprender Japonés)

- **Estado:** en revisión de tareas
- **Fecha:** 2026-10-04
- **Rama:** feat/daily-kanji-vocab-strokes-1000

---

## 🎯 1. Contexto y Objetivo
El aprendizaje de caracteres japoneses (kanji) requiere práctica constante y multisensorial: reconocimiento visual, memorización de lecturas (on'yomi y kun'yomi), comprensión de significado, vocabulario compuesto y motricidad en el orden de trazos desde el recuerdo activo.
El objetivo de **Daily Kanji** es integrar a FabriGames una experiencia exclusivamente diaria (**100% Daily**, sin modo infinito ni rerolls) estructurada en **4 modalidades de juego de 20 preguntas/ítems cada una** (20 lecturas, 20 significados, 20 vocabularios compuestos y 20 trazos inversos, para un total de 80 retos evaluativos diarios) basadas en una selección determinista de 20 kanjis diarios extraídos de un catálogo amplio de **al menos 1000 kanjis más utilizados**.
El usuario puede **navegar libremente entre las 4 modalidades** en cualquier momento, cuenta con una **barra de paginación interactiva del 1 al 20** sobre el kanji actual para saltar a cualquier ejercicio, puede **revisar lo que respondió en cada pregunta previa**, y dispone de un **panel de consulta rápida de silabarios Hiragana y Katakana** accesible mediante un botón compacto. Además, cuenta con **avance ágil mediante la tecla Enter** y una interfaz limpia con una directiva estricta de **cero subtítulos**.
La mecánica aplica una regla estricta de **1 solo intento por ítem**: ante un fallo, se prioriza el valor pedagógico revelando de inmediato la respuesta correcta.

---

## 👥 2. Usuarios y Actores
- **Estudiante Diario de Japonés:** Busca una sesión de práctica integral de 5 a 8 minutos para consolidar vocabulario y caligrafía de 20 kanjis cada día de entre los 1000 más frecuentes.
- **Jugador Competitivo de FabriGames:** Acude a medianoche local para mantener su racha activa, lograr el puntaje perfecto (80/80 aciertos) y compartir su resumen de aciertos por modalidad.
- **Usuario Táctil / Móvil:** Dibuja trazos con el dedo y alterna cómodamente entre tocar opciones de selección múltiple o tipear en el teclado virtual.
- **Usuario de Teclado Desktop:** Responde rápidamente y avanza a la siguiente pregunta usando `Enter`.

---

## 📖 3. Historias de Usuario
- **HU-1 (Reto Diario Unificado de 20 Kanjis):** Como jugador diario, quiero recibir la misma lista ordenada de 20 kanjis objetivo cada día sin rerolls, para competir en igualdad de condiciones con toda la comunidad.
- **HU-2 (Elección de Modalidad de Respuesta):** Como estudiante, quiero alternar entre Selección Múltiple (4 alternativas) y Escritura Directa (teclado con transcripción automática) para adaptar el desafío a mi nivel de dominio.
- **HU-3 (Intento Único con Avance y Navegación):** Como aprendiz, quiero tener 1 solo intento evaluativo por pregunta con feedback pedagógico inmediato, pudiendo avanzar secuencialmente o saltar a cualquier ejercicio.
- **HU-4 (Persistencia Continua por Pregunta y Etapa):** Como usuario móvil sujeto a interrupciones, quiero que cada una de las 20 preguntas resueltas se guarde al instante para reanudar mi partida exactamente donde me quedé sin perder progreso.
- **HU-5 (Etapa de Trazos Inversa y Recuerdo Activo):** Como estudiante, quiero recibir una palabra en español con su pronunciación (hiragana/romaji) y dibujar el kanji correspondiente desde cero en el lienzo interactivo, recibiendo asistencia animada ante fallos.
- **HU-6 (Racha Acumulada):** Como jugador constante, quiero mantener y visualizar mi contador de días consecutivos completados para medir mi constancia en el estudio.
- **HU-7 (Viralidad con Desglose de Puntaje):** Como usuario que completó su sesión, quiero compartir mi resultado desglosado (puntuación sobre 20 por cada una de las 4 modalidades) vía Web Share API o WhatsApp.
- **HU-8 (Navegación Libre entre Modalidades):** Como usuario, quiero poder cambiar a cualquier modalidad de juego (Lectura, Significado, Vocabulario, Trazos) en cualquier momento mediante pestañas/botones sin necesidad de haber concluido la modalidad anterior.
- **HU-9 (Paginación e Histórico de Respuestas):** Como usuario, quiero ver una barra de paginación del 1 al 20 sobre el kanji actual para saltar a cualquier ejercicio, y poder ver claramente qué respondí y cuál era la respuesta correcta en los ejercicios ya contestados.
- **HU-10 (Legibilidad y Variantes Tipográficas):** Como estudiante, quiero disponer de opciones tipográficas claras y legibles optimizadas para kanjis en pantalla (ej. Noto Sans JP, Zen Kaku Gothic, BIZ UDPGothic, Klee One, Zen Maru Gothic) para probar y elegir la que mejor se adapte a mi lectura.
- **HU-11 (Vocabulario de Kanjis Compuestos):** Como estudiante, quiero practicar palabras compuestas reales (jukugo / kanji + complemento, ej: 大人 -> adulto) para aprender cómo se usa el kanji en el vocabulario japonés real.
- **HU-12 (Panel de Consulta Rápida de Kanas):** Como estudiante, quiero abrir un panel accesible no intrusivo con las tablas de Hiragana y Katakana y sus lecturas en Romaji para consultarlo durante el estudio.
- **HU-13 (Avance con Tecla Enter):** Como usuario de teclado, quiero presionar Enter para pasar a la siguiente pregunta una vez que he respondido o mientras reviso.
- **HU-14 (Interfaz Limpia sin Subtítulos):** Como usuario, quiero una interfaz limpia y sin subtítulos o párrafos redundantes bajo los títulos para una experiencia más directa y enfocada.

---

## 📚 4. Definiciones
- **100% Modo Daily:** Modalidad única y obligatoria. La lista de 20 kanjis y sus preguntas es idéntica universalmente cada día.
- **Catálogo de 1000 Kanjis:** Base de datos con los 1000 kanjis más utilizados con lecturas (on/kun), significados en español y palabras compuestas.
- **Vocabulario Compuesto (Jukugo):** Palabra real formada por el kanji evaluado junto a otros caracteres (ej. `大人` [adulto] para el kanji `人`, `日本` [Japón] para `日`).
- **Trazos Inversos (Reverse Drawing):** Reto caligráfico donde se proporciona el significado en español y la lectura en kana/romaji, debiendo el jugador trazar el kanji en blanco sin la silueta previa por defecto.
- **Semilla Determinista:** Cadena con formato estricto `YYYYMMDD + "kanji"` calculada con la fecha local del jugador para alimentar el generador PRNG `rand-seed` y barajar/seleccionar los 20 kanjis del día sin repetición sobre los 1000 kanjis.
- **Tanda de 20 Ítems:** Serie de 20 desafíos correspondientes a una misma modalidad pedagógica (Lectura, Significado, Vocabulario o Trazos).
- **Intento Único por Pregunta:** Cada una de las 20 preguntas admite exactamente 1 respuesta evaluada. Una vez respondida, queda registrada y pasa a modo de revisión/lectura.
- **Feedback Educativo Inmediato:** Revelación visual de la solución oficial inmediatamente después de emitir una respuesta errónea.

---

## ⚙️ 5. Requisitos Funcionales (EARS en español)

### 5.1. Determinismo Diario y Selección de 20 Kanjis (Constitución Art. I)
- **RF-1:** CUANDO el usuario entra a `/kanji`, EL SISTEMA inicializa el generador PRNG `rand-seed` con la semilla exacta `YYYYMMDD + "kanji"` para barajar deterministamente el catálogo de al menos 1000 kanjis y seleccionar una lista ordenada de 20 kanjis únicos para el día.
- **RF-2:** EL SISTEMA garantiza de forma universal que dos usuarios que jueguen en la misma fecha local reciban la misma secuencia ordenada de 20 kanjis y las mismas opciones de selección múltiple.
- **RF-3:** EL SISTEMA restringe la interacción exclusivamente al reto diario, prohibiendo cualquier botón de reinicio, reroll o modalidad casual infinita.
- **RF-4:** SI la medianoche local es superada mientras la aplicación está abierta, ENTONCES EL SISTEMA detecta la nueva fecha y actualiza el reto diario al nuevo objetivo.

### 5.2. Modalidad de Respuesta y Toggle
- **RF-5:** EL SISTEMA proporciona un selector visible (toggle) que permite al usuario alternar en cualquier momento entre "Selección Múltiple" y "Escritura Directa" para las etapas evaluativas (Lectura, Significado, Vocabulario).
- **RF-6:** MIENTRAS el modo "Escritura Directa" esté seleccionado en la etapa de lectura o vocabulario, EL SISTEMA convierte automáticamente en tiempo real las combinaciones de teclas romaji introducidas en sus caracteres hiragana equivalentes.
- **RF-7:** MIENTRAS el modo "Selección Múltiple" esté seleccionado, EL SISTEMA renderiza 4 alternativas accesibles: la opción correcta y 3 distractores generados deterministamente de otros kanjis.

### 5.3. Navegación Libre entre Modalidades y Paginación 1..20
- **RF-8:** EL SISTEMA organiza el reto diario en 4 modalidades de juego (Lectura, Significado, Vocabulario, Trazos) y permite al usuario navegar y alternar libremente entre ellas en cualquier momento mediante un selector/pestañas accesibles, sin requerir haber finalizado la modalidad en curso.
- **RF-9:** EL SISTEMA muestra un indicador de avance de sub-pregunta visible (`Pregunta X de 20`) y una barra de progreso que refleja el avance dentro de la etapa activa y entre las 4 etapas globales.
- **RF-10:** EL SISTEMA restringe cada una de las preguntas individuales a exactamente 1 solo intento evaluativo por parte del usuario.
- **RF-11:** CUANDO el usuario responde correctamente una pregunta, EL SISTEMA registra el acierto (`🟩`), muestra feedback positivo breve y permite avanzar al siguiente ítem.
- **RF-12:** SI el usuario responde incorrectamente una pregunta, ENTONCES EL SISTEMA registra el fallo (`🟥`), resalta pedagógicamente la respuesta correcta y permite avanzar al siguiente ítem.
- **RF-13:** CUANDO concluyen las 20 preguntas de una modalidad, EL SISTEMA muestra el resumen de aciertos obtenido (`X / 20`) e invita a continuar con las modalidades restantes o consultar el resumen final si ya se completaron las 4.
- **RF-25:** EL SISTEMA renderiza una barra de paginación interactiva visible sobre el kanji actual con los números del 1 al 20. Cada número refleja visualmente su estado: pendiente/no respondido, respondido con acierto (`🟩`), respondido con fallo (`🟥`), y un indicador de enfoque para la pregunta actualmente activa. CUANDO el usuario hace clic en cualquiera de los números (1 a 20), EL SISTEMA navega de inmediato a ese ejercicio específico.
- **RF-26:** CUANDO el usuario navega a un ejercicio que ya fue respondido previamente, EL SISTEMA muestra los datos de la respuesta emitida por el usuario (`userAnswer`), si fue correcta o incorrecta, y la solución oficial (`correctAnswer`), manteniendo los controles en modo de revisión/solo lectura sin admitir nuevos envíos que alteren la puntuación.

### 5.4. Modalidad 3: Vocabulario Compuesto (Jukugo)
- **RF-28:** CUANDO el usuario accede a la etapa de Vocabulario, EL SISTEMA presenta una palabra compuesta que incorpora el kanji activo (ej. `大人` para `人`) y solicita identificar su significado o lectura.
- **RF-29:** EL SISTEMA genera 4 opciones deterministas para la palabra compuesta: 1 correcta y 3 distractores basados en el vocabulario del catálogo de kanjis.

### 5.5. Modalidad 4: Trazos Inversos (Dibujo Activo)
- **RF-14:** CUANDO el usuario ingresa a la Etapa de Trazos, EL SISTEMA presenta como consigna la palabra en español y su pronunciación en hiragana/romaji, solicitando dibujar el kanji correspondiente en el lienzo interactivo con cuadrícula de caligrafía.
- **RF-15:** EL SISTEMA oculta por defecto la silueta previa del kanji en el lienzo para exigir el recuerdo activo del trazo.
- **RF-16:** MIENTRAS el usuario dibuja sobre el lienzo, EL SISTEMA valida en tiempo real el orden secuencial del trazo y su orientación vectorial.
- **RF-17:** SI el usuario comete un error de trazo, ENTONCES EL SISTEMA reproduce una animación ilustrativa del trazo correcto y permite reintentarlo hasta completar el kanji.
- **RF-18:** CUANDO el usuario completa exitosamente el kanji, EL SISTEMA lo marca completado y permite avanzar al siguiente de la serie (`1 ➔ 2 ➔ ... ➔ 20`).

### 5.6. Panel de Consulta Rápida de Kanas (Hiragana y Katakana)
- **RF-30:** EL SISTEMA incorpora un botón compacto y accesible en la cabecera del juego que abre un modal con las tablas completas de Hiragana y Katakana y sus lecturas correspondientes en Romaji (Hepburn).
- **RF-31:** MIENTRAS el modal de consulta esté abierto, EL SISTEMA permite cambiar entre pestañas Hiragana y Katakana sin perder el estado de la pregunta activa.

### 5.7. Navegación por Teclado con Tecla Enter
- **RF-32:** CUANDO una pregunta ha sido respondida y el banner de feedback está visible, O cuando el usuario está en modo de revisión de una pregunta ya completada, AL PRESIONAR la tecla `Enter`, EL SISTEMA ejecuta la acción de avance a la siguiente pregunta.

### 5.8. Directiva de Diseño Sin Subtítulos
- **RF-33:** EL SISTEMA prohíbe de forma estricta el uso de subtítulos, descripciones secundarias o párrafos explicativos debajo de títulos y encabezados de la interfaz en todos los componentes del juego.

### 5.9. Persistencia Incremental y Rachas (Constitución Art. III)
- **RF-19:** CUANDO el usuario responde cualquiera de las preguntas (en cualquiera de las 4 etapas), EL SISTEMA persiste inmediatamente el estado incremental en el almacenamiento local a través de `kanjiRepository` (`currentStageIndex`, `currentQuestionIndex`, mapa de aciertos/fallos).
- **RF-20:** SI el usuario recarga el navegador o regresa más tarde durante el mismo día, ENTONCES EL SISTEMA restaura automáticamente la partida en la etapa y pregunta exacta pendiente.
- **RF-21:** CUANDO concluyen las 4 etapas completas (los 80 retos), EL SISTEMA actualiza la racha del usuario: incrementa en 1 día si la última partida registrada fue el día previo consecutivo, o reinicia a 1 si la diferencia es mayor a un día calendario.
- **RF-22:** MIENTRAS el reto diario ya haya sido completado en su totalidad, EL SISTEMA muestra la vista resumen bloqueada en modo de solo lectura.

### 5.10. Viralidad y Resumen Social
- **RF-23:** CUANDO el reto diario finaliza, EL SISTEMA presenta un modal con:
  - Racha acumulada en días.
  - Puntaje desglosado por modalidad:
    - 📖 Lectura: `X / 20`
    - 💡 Significado: `Y / 20`
    - 📚 Vocabulario: `Z / 20`
    - ✍️ Trazos: `20 / 20`
    - 🏆 Puntuación Total: `Total / 80`
  - Botón "Toque a un amigo" para compartir en redes.
- **RF-24:** CUANDO el usuario pulsa "Toque a un amigo", EL SISTEMA genera el texto resumen preformateado y utiliza la Web Share API nativa o redirección fallback a WhatsApp con opción de copiado al portapapeles.

### 5.11. Soporte y Selección de Tipografías Japonesas
- **RF-27:** EL SISTEMA incorpora tipografías web optimizadas para la legibilidad de caracteres japoneses (kanji y kana) —incluyendo *Noto Sans JP*, *Zen Kaku Gothic New*, *BIZ UDPGothic*, *Klee One* y *Zen Maru Gothic*— y provee un selector accesible para que el usuario pueda alternar entre ellas en caliente y persistir su preferencia.

---

## 🚀 6. Requisitos No Funcionales
- **Rendimiento:** Transición instantánea entre preguntas de la misma etapa (< 50ms) sin recargas ni parpadeos en pantalla.
- **Eficiencia de Memoria:** Destrucción y limpieza apropiada de las instancias de `HanziWriter` entre cada uno de los 20 kanjis de la etapa de trazos para evitar fugas de memoria (*memory leaks* en WebGL/SVG).
- **Responsive & Accesibilidad:** Diseño adaptable a pantallas móviles con controles de tamaño generoso para botones de opción, paginación responsiva de 20 botones y lienzo de trazos centrado.

---

## 🏛️ 7. Alineación con la Constitución (`docs/constitution.md`)
- **Art. I (Determinismo Diario):** Semilla única `YYYYMMDD + "kanji"` que alimenta un shuffle determinista de 20 kanjis sobre el catálogo de 1000 kanjis y sus opciones. Todos los jugadores reciben los mismos 20 kanjis en el mismo orden cada día.
- **Art. II (Arquitectura de Islas):** Isla React única (`DailyKanjiGame client:only="React"`) desacoplada con Zustand para el control de etapas, sub-preguntas y puntajes.
- **Art. III (Repository Pattern):** `kanjiRepository` abstrae el guardado y restauración de la sesión de 20 ítems en `localStorage`.
- **Art. IV (Resiliencia):** Funcionamiento 100% offline; fallback en memoria si `localStorage` no está disponible.
- **Art. V (Tipado Estricto):** Modelado de datos en `KanjiDailyState` tipado estrictamente sin `any`.

---

## ⚠️ 8. Casos Límite (Edge Cases)
- **Navegación a una pregunta ya respondida:** Los botones de opción o el input de texto no deben permitir alterar la respuesta ya emitida; deben mostrar el estado histórico en modo revisión (`isCorrect`, `userAnswer`, `correctAnswer`).
- **Kanji sin palabras compuestas en el dataset:** Si un kanji no tuviera palabras compuestas asociadas en el dataset, el generador debe poseer un fallback seguro para sintetizar una combinación válida o seleccionar una alternativa disponible sin lanzar excepciones en tiempo de ejecución.
- **Trazos inversos sin silueta previa:** El lienzo no muestra el kanji al inicio, pero si el usuario comete 2 errores consecutivos en un trazo o presiona el botón de pista, se renderiza la animación didáctica del trazo correcto.
- **Presión repetida de tecla Enter:** La escucha de `Enter` debe estar debounceada o validada de tal forma que no salte múltiples preguntas si se mantiene presionada la tecla.

---

## 🚫 9. Fuera de Alcance (Out of Scope)
- Modos infinitos o selección libre de kanjis individuales fuera del catálogo diario.
- Reintentos evaluativos en la misma pregunta (la regla pedagógica de 1 intento evaluativo se mantiene; solo se permite consultar la respuesta previa).

---

## ✅ 10. Criterios de Finalización
- [x] Selección determinista diaria de 20 kanjis únicos con semilla `YYYYMMDDkanji`.
- [x] Selector accesible de modalidades para alternar libremente entre Lectura, Significado, Vocabulario y Trazos en cualquier momento.
- [x] Barra de paginación interactiva del 1 al 20 sobre el kanji actual con salto directo a cada ejercicio y colores de estado (acierto `🟩`, fallo `🟥`, pendiente, activo).
- [x] Modo de revisión de respuestas previas: visualización clara de la respuesta emitida por el usuario y la solución correcta en ejercicios ya respondidos.
- [x] Tipografías japonesas optimizadas integradas con selector interactivo de fuentes (Noto Sans JP, Zen Kaku Gothic, BIZ UDPGothic, Klee One, Zen Maru Gothic).
- [ ] Catálogo de al menos 1000 kanjis más utilizados con lecturas, significados en español y vocabulario compuesto disponible.
- [ ] Modal y botón de referencia rápida de Kanas (Hiragana y Katakana con romaji).
- [ ] Modalidad de Vocabulario Compuesto (Jukugo: kanji + complemento) operativa reemplazando la etapa de romaji.
- [ ] Modalidad de Trazos Inversos (Español + pronunciación en Kana/Romaji ➔ dibujar kanji objetivo).
- [ ] Navegación fluida por teclado: tecla `Enter` para avanzar al responder o revisar.
- [ ] Directiva de diseño sin subtítulos aplicada rigurosamente en toda la interfaz.
- [ ] Compilación TypeScript limpia (`npm run build`).
