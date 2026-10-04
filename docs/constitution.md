# Constitución de Ingeniería — FabriGames

Este documento define los principios innegociables e inmutables de ingeniería, arquitectura y calidad para el desarrollo y evolución de **FabriGames** (`fabriciovera.github.io`). Toda nueva especificación, plan técnico o implementación debe estar en estricta conformidad con estos cinco artículos.

---

## 🏛️ Artículo I — Determinismo Diario y Reproducibilidad Universal
1. El desafío del modo diario (`daily`) para cualquier juego de la plataforma debe ser idéntico para todos los usuarios del mundo en la misma fecha local.
2. La selección determinista del objetivo debe realizarse exclusivamente a través de la librería `rand-seed` inicializada con la semilla estándar `YYYYMMDD + gameId`, implementada en `calculateDailyTarget` (`src/utils/game.ts`).
3. Queda prohibido el uso de `Math.random()` para la generación del objetivo o pistas fijas en desafíos diarios.

---

## 🏝️ Artículo II — Arquitectura de Islas y Desacoplamiento de Estado
1. Las páginas de Astro (`src/pages/`) deben ser ultraligeras, estáticas (SSG) y libres de dependencias de renderizado cliente innecesarias.
2. Toda interactividad compleja debe residir en islas React con la directiva de hidratación adecuada (`client:load`, `client:visible` o `client:only="React"` para código dependiente del DOM/APIs de navegador).
3. **Separación de Estado:**
   - **Nanostores (`$playerName`):** Exclusivo para compartir datos ligeros entre islas independientes sin provocar re-renders en el árbol global de Astro.
   - **Zustand (`createGameStore`, `useArknightStore`):** Para la máquina de estados local e interactiva de cada juego (intentos, objetivo, condiciones de victoria/derrota y selector de modo).

---

## 🗄️ Artículo III — Abstracción de Datos y Persistencia (Repository Pattern)
1. Queda estrictamente prohibido que los componentes visuales de React interactúen directamente con APIs de bases de datos (`supabase.from(...)`) o manipulen claves crudas de `localStorage` / cookies.
2. Todo acceso a datos, sincronización o persistencia debe canalizarse mediante la capa de repositorios y servicios de dominio (`scoreRepository`, `dailyStorageRepository`, `gameModeRepository`).
3. La lógica de negocio y cálculo (comparadores de atributos, matrices de pistas, cálculo de estrellas) debe implementarse como funciones puras desacopladas de la UI.

---

## 🛡️ Artículo IV — Resiliencia, Tolerancia a Fallos y Observabilidad
1. Todas las peticiones asíncronas hacia Supabase deben implementar el mecanismo de reintentos con backoff exponencial (`withRetry`).
2. La plataforma debe ofrecer degradación elegante: si Supabase o una API externa no responde, el juego debe continuar en modo local/offline sin congelar la interfaz ni bloquear al usuario.
3. Los errores no controlados en producción deben reportarse de forma asíncrona (*fire-and-forget*) a la tabla `app_errors` a través de `AppLogger`.
4. **Seguridad:** Queda estrictamente prohibido exponer credenciales o tokens en el cliente; cualquier acceso público debe estar restringido a variables de entorno `import.meta.env.PUBLIC_*`.

---

## 📐 Artículo V — Tipado Estricto y Coexistencia Progresiva de Documentación
1. Todo el código TypeScript debe adherirse al modo estricto (`astro/tsconfigs/strict`). Se prohíbe el uso indiscriminado de `any`.
2. **Coexistencia SDD / Memory Bank y Regla de Carpetas:**
   - El flujo SDD (Spec-Driven Development: `spec.md` ➔ `plan.md` ➔ `tasks.md`) es de uso **obligatorio exclusivamente para nuevas features** o rediseños/refactorizaciones mayores de características existentes.
   - **Regla Estricta de Directorio:** Toda spec DEBE crearse en su propia subcarpeta numerada secuencialmente `docs/specs/NNN-{feature}/` (ej. `docs/specs/001-daily-kanji/`). Queda prohibido situar documentos de una spec directamente en la raíz de `docs/specs/`.
   - Las características previas y consolidadas del proyecto permanecen documentadas en su formato actual (`docs/specs.md`, `docs/design.md`, `docs/progress.md` y `docs/task.md`), prohibiendo migraciones retroactivas forzadas a SDD salvo cuando una feature sea rediseñada o modificada sustancialmente.
