# Spec 001 — Daily Kanji [/kanji] (Aprender Japonés)

- **Estado:** aprobada
- **Fecha:** 2026-10-04
- **Rama:** feat/daily-kanji

---

## 🎯 1. Contexto y Objetivo
El aprendizaje de caracteres japoneses (kanji) requiere práctica constante y multisensorial: reconocimiento visual, memorización de lecturas (on'yomi y kun'yomi), comprensión de significado y motricidad en el orden de trazos.
El objetivo de **Daily Kanji** es integrar a FabriGames una experiencia exclusivamente diaria (**100% Daily**, sin modo infinito ni rerolls) estructurada en 4 etapas complementarias basadas en kanjis de nivel básico (JLPT N5). La mecánica aplica una regla estricta de **1 solo intento por etapa**: ante un fallo, se prioriza el valor pedagógico revelando de inmediato la respuesta correcta y avanzando a la etapa siguiente. Se ofrece versatilidad cognitiva mediante un toggle entre selección múltiple y escritura directa con conversión automática, persistencia incremental por etapa y viralidad social con una grilla de 4 emojis (`🟩`/`🟥`).

---

## 👥 2. Usuarios y Actores
- **Estudiante Diario de Japonés:** Busca un microaprendizaje diario estructurado y riguroso de 2 a 3 minutos para consolidar vocabulario y caligrafía básica N5.
- **Jugador Competitivo de FabriGames:** Acude a medianoche local para mantener su racha activa, lograr la partida perfecta (4 aciertos: 🟩🟩🟩🟩) y compartir su desempeño con sus contactos.
- **Usuario Táctil / Móvil:** Dibuja trazos con el dedo y alterna cómodamente entre tocar opciones de selección múltiple o tipear en el teclado virtual.

---

## 📖 3. Historias de Usuario
- **HU-1 (Reto Diario Unificado y Exclusivo):** Como jugador diario, quiero recibir exactamente el mismo kanji y las mismas opciones que todos los demás usuarios cada día sin posibilidad de rerolls ni modo casual, para competir en igualdad de condiciones.
- **HU-2 (Elección de Modalidad de Respuesta):** Como estudiante, quiero alternar entre Selección Múltiple (4 alternativas) y Escritura Directa (teclado con transcripción automática) para adaptar el desafío a mi nivel de dominio.
- **HU-3 (Intento Único con Valor Pedagógico):** Como aprendiz, quiero tener 1 solo intento por etapa pero conocer la respuesta correcta inmediatamente si fallo, para aprender del error sin quedarme bloqueado.
- **HU-4 (Persistencia Continua por Etapa):** Como usuario móvil sujeto a interrupciones, quiero que cada etapa resuelta se guarde al instante para poder recargar o reanudar mi partida en la misma etapa sin perder lo avanzado.
- **HU-5 (Etapa de Trazos Interactiva):** Como estudiante, quiero trazar el kanji en un lienzo interactivo que valide orden y orientación en tiempo real para asimilar la caligrafía formal.
- **HU-6 (Racha Acumulada):** Como jugador constante, quiero mantener y visualizar mi contador de días consecutivos completados para medir mi constancia en el estudio.
- **HU-7 (Viralidad "Toque a un amigo"):** Como usuario que completó su sesión, quiero compartir mi resultado de 4 emojis por WhatsApp o redes nativas con un solo toque para desafiar a mis amigos.

---

## 📚 4. Definiciones
- **100% Modo Daily:** Modalidad única y obligatoria del juego. No existen modos infinitos, dados de reroll ni partidas de práctica en esta versión.
- **Semilla Determinista:** Cadena con formato estricto `YYYYMMDD + "kanji"` calculada con la fecha local del jugador para alimentar el generador PRNG `rand-seed`.
- **Intento Único por Etapa:** Cada etapa evaluativa admite exactamente 1 respuesta. No hay reintentos en la misma etapa.
- **Feedback Educativo Inmediato:** Revelación visual de la solución oficial inmediatamente después de emitir una respuesta errónea.
- **Modo Selección Múltiple:** Presentación de 4 botones con opciones (1 correcta y 3 distractores deterministas).
- **Modo Escritura Directa:** Campo de texto interactivo con motor de conversión fonética en tiempo real (romaji ➔ hiragana/katakana para lecturas, o normalización alfabética).
- **Grilla de Desempeño:** Representación compacta de 4 caracteres emoji donde cada posición refleja el desenlace de la etapa: `🟩` (acierto) o `🟥` (fallo pedagógico).

---

## ⚙️ 5. Requisitos Funcionales (EARS en español)

### 5.1. Determinismo Diario y Exclusividad (Constitución Art. I)
- **RF-1:** CUANDO el usuario entra a `/kanji`, EL SISTEMA inicializa el generador PRNG `rand-seed` con la semilla exacta `YYYYMMDD + "kanji"` (usando la fecha local del navegador) para seleccionar el kanji del día y sus distractores.
- **RF-2:** EL SISTEMA garantiza de forma universal que dos usuarios que jueguen en la misma fecha local reciban idéntico kanji objetivo, idénticas opciones y el mismo orden de distractores.
- **RF-3:** EL SISTEMA restringe la interacción exclusivamente al reto diario, prohibiendo cualquier botón de reinicio, reroll o modalidad casual infinita.
- **RF-4:** SI la medianoche local es superada mientras la aplicación está abierta, ENTONCES EL SISTEMA detecta la nueva fecha y actualiza el reto diario al nuevo objetivo.

### 5.2. Modalidad de Respuesta y Toggle
- **RF-5:** EL SISTEMA proporciona un selector visible (toggle) que permite al usuario alternar en cualquier momento entre "Selección Múltiple" y "Escritura Directa" para las etapas evaluativas (Lectura, Significado, Romanización).
- **RF-6:** MIENTRAS el modo "Escritura Directa" esté seleccionado en la etapa de lectura, EL SISTEMA convierte automáticamente en tiempo real las combinaciones de teclas romaji introducidas en sus caracteres hiragana equivalentes.
- **RF-7:** MIENTRAS el modo "Selección Múltiple" esté seleccionado, EL SISTEMA renderiza 4 alternativas accesibles: la opción correcta y 3 distractores generados deterministamente de otros kanjis N5.

### 5.3. Regla de Intento Único y Etapas Evaluativas (1 a 3)
- **RF-8:** EL SISTEMA restringe cada una de las etapas a exactamente 1 (un) solo intento definitivo por parte del usuario, bloqueando los controles tras el envío para evitar envíos múltiples.
- **RF-9:** CUANDO el usuario acierta la lectura en hiragana (Etapa 1) en su único intento, EL SISTEMA califica la etapa con `🟩`, reproduce confirmación de éxito y avanza a la Etapa 2.
- **RF-10:** SI el usuario falla la lectura en hiragana (Etapa 1) en su único intento, ENTONCES EL SISTEMA califica la etapa con `🟥`, muestra en pantalla la lectura correcta con fines pedagógicos y habilita el paso a la Etapa 2.
- **RF-11:** CUANDO el usuario acierta el significado en español (Etapa 2) en su único intento, EL SISTEMA califica la etapa con `🟩`, resalta la respuesta correcta y avanza a la Etapa 3.
- **RF-12:** SI el usuario falla el significado en español (Etapa 2) en su único intento, ENTONCES EL SISTEMA califica la etapa con `🟥`, resalta visualmente la opción correcta pedagógica y avanza a la Etapa 3.
- **RF-13:** CUANDO el usuario ingresa la transcripción romaji (Etapa 3) correcta en su único intento, EL SISTEMA califica la etapa con `🟩` y avanza a la Etapa 4 (Trazos).
- **RF-14:** SI el usuario introduce una transcripción romaji incorrecta en su único intento, ENTONCES EL SISTEMA califica la etapa con `🟥`, muestra la transcripción Hepburn correcta y avanza a la Etapa 4.
- **RF-15:** EL SISTEMA normaliza la comparación de texto eliminando espacios extremos e ignorando diferencias entre mayúsculas y minúsculas.

### 5.4. Etapa 4: Trazos Interactivos (Canvas y Validación)
- **RF-16:** CUANDO el usuario ingresa a la Etapa 4, EL SISTEMA renderiza un lienzo interactivo con cuadrícula de caligrafía y silueta guía del kanji del día.
- **RF-17:** MIENTRAS el usuario dibuja sobre el lienzo con puntero o dedo, EL SISTEMA valida en tiempo real el orden secuencial del trazo y su orientación vectorial (inicio y fin).
- **RF-18:** SI el usuario comete un error de orden u orientación en un trazo, ENTONCES EL SISTEMA rechaza el trazo, reproduce una animación ilustrativa del trazo correcto y permite reintentarlo sobre el lienzo hasta completar el kanji.
- **RF-19:** CUANDO el usuario completa exitosamente el último trazo del kanji, EL SISTEMA califica la etapa con `🟩` y declara el reto diario completamente finalizado.

### 5.5. Persistencia Incremental y Rachas (Constitución Art. III)
- **RF-20:** CUANDO el usuario concluye cualquiera de las 4 etapas (sea acierto `🟩` o fallo `🟥`), EL SISTEMA persiste inmediatamente el estado incremental en el almacenamiento local a través de la capa de repositorio.
- **RF-21:** SI el usuario recarga el navegador o regresa más tarde durante el mismo día, ENTONCES EL SISTEMA restaura automáticamente la partida en la etapa pendiente conservando los resultados previos (`🟩`/`🟥`) ya emitidos.
- **RF-22:** CUANDO concluyen las 4 etapas, EL SISTEMA actualiza la racha del usuario: incrementa en 1 día si la última partida registrada fue el día consecutivo previo, o reinicia a 1 si la diferencia es mayor a un día calendario.
- **RF-23:** MIENTRAS el reto del día ya esté completado en su totalidad, EL SISTEMA muestra la vista resumen bloqueada en modo de solo lectura con las estadísticas finales.

### 5.6. Viralidad y Botón "Toque a un amigo"
- **RF-24:** CUANDO el reto diario finaliza, EL SISTEMA presenta un modal con la racha acumulada, la grilla de 4 emojis representativos (`🟩`/`🟥`) correspondientes al resultado de cada una de las 4 etapas, y el botón "Toque a un amigo".
- **RF-25:** CUANDO el usuario pulsa "Toque a un amigo" en un entorno con soporte de Web Share API, EL SISTEMA invoca el diálogo nativo para compartir el mensaje preformateado (Racha + Grilla de 4 emojis + URL).
- **RF-26:** SI la Web Share API no está disponible o el usuario rechaza la ventana nativa, ENTONCES EL SISTEMA ejecuta la redirección fallback a WhatsApp (`https://api.whatsapp.com/send?text=...`) con el mensaje codificado y provee un botón directo de copiado al portapapeles.

---

## 🚀 6. Requisitos No Funcionales
- **Rendimiento:** Carga inicial de datos de kanjis y kanas optimizada para paquetes livianos (< 100 KB gzipped). Animaciones de trazo fluidas a 60 FPS sin retraso perceptible de entrada (*input latency* < 50ms).
- **Responsive & Accesibilidad:** Soporte fluido tanto para pantallas móviles compactas (375px) como de escritorio. Controles accesibles por teclado y etiquetas aria para el toggle de modo.
- **Theming & Estética:** Coherencia visual con los tokens retro de FabriGames y legibilidad tipográfica máxima para caracteres japoneses complejos.

---

## 🏛️ 7. Alineación con la Constitución (`docs/constitution.md`)
- **Art. I (Determinismo Diario):** Semilla calculada estrictamente como `YYYYMMDD + "kanji"`, consumida exclusivamente a través de la función `calculateDailyTarget` o la librería `rand-seed`. Cero uso de `Math.random()`.
- **Art. II (Arquitectura de Islas):** Página Astro SSG ultraestática con isla React interactiva hidratada en cliente (`client:only="React"`). Estado administrado con Zustand sin polucionar el árbol global de Astro.
- **Art. III (Repository Pattern):** Todo acceso a `localStorage` (progreso incremental por etapa, racha, estadísticas) se canaliza mediante `kanjiRepository`. Los componentes de React no tocan APIs de almacenamiento directamente.
- **Art. IV (Resiliencia y Tolerancia):** Funcionamiento local/offline autónomo sin dependencia de backend. Degradación elegante si `localStorage` está bloqueado (mantiene el progreso en memoria de sesión) y reporte de errores asíncrono con `AppLogger`.
- **Art. V (Tipado Estricto y Coexistencia):** TypeScript en modo estricto sin `any`. La spec gobierna la nueva sección sin alterar la documentación histórica de otros juegos.

---

## ⚠️ 8. Casos Límite (Edge Cases)
- **Recarga de página a mitad de partida:** Gracias a la persistencia incremental por etapa, el usuario retoma exactamente la etapa no resuelta sin poder alterar los aciertos o fallos ya emitidos.
- **Cambio de toggle durante una etapa:** Si el usuario alterna entre Selección Múltiple y Escritura Directa antes de confirmar, se conserva el estado limpio del campo o la selección activa sin penalización.
- **Pulsación múltiple rápida (Double Submit):** El sistema deshabilita inmediatamente los botones o el botón de envío tras la primera interacción para impedir dobles llamadas.
- **Cambio de día mientras la partida está abierta:** Si la medianoche ocurre con una partida iniciada, el usuario puede terminar el kanji de esa fecha, y al concluir se le notifica que el reto del nuevo día está listo.
- **Dispositivo sin soporte táctil o con pantalla táctil híbrida:** El canvas interactivo de trazos responde de manera unificada a eventos Pointer (`pointerdown`, `pointermove`, `pointerup`).

---

## 🚫 9. Fuera de Alcance (Out of Scope)
- Modo infinito, casual o selector de kanjis libres (el juego es 100% diario).
- Botones de reroll o reinicio de partida diaria.
- Niveles superiores a N5 (N4, N3, N2, N1).
- Reconocimiento de voz para lectura hablada.
- Sincronización multi-dispositivo en la nube o autenticación requerida.

---

## ✅ 10. Criterios de Finalización
- [ ] Implementación de las 4 etapas con regla estricta de 1 solo intento por etapa.
- [ ] Comprobación del valor pedagógico: revelación de la respuesta correcta ante fallo y avance de etapa.
- [ ] Toggle funcional entre "Modo Selección Múltiple" y "Modo Escritura Directa" con conversión romaji ➔ hiragana en tiempo real.
- [ ] Persistencia incremental verificada: recargar la página en etapa 2 o 3 restaura el estado exacto.
- [ ] Determinismo universal comprobado con semilla estricta `YYYYMMDD + "kanji"`.
- [ ] Modal de cierre con racha, grilla de 4 emojis (`🟩`/`🟥`) y acción "Toque a un amigo" (Web Share API y fallback a WhatsApp).
- [ ] Compilación TypeScript limpia (`npm run build`).

---

## ❓ 11. Dudas Abiertas
*(Todas las dudas resueltas y auditadas por el equipo de diseño y reviewer).*
