# GEMINI.md — Directivas y Reglas del Sistema (Memory Bank & SDD)

Este archivo define las instrucciones operativas, directivas de seguridad, estándares de código y reglas de arquitectura para cualquier asistente o desarrollador que trabaje en el repositorio **FabriGames** (`fabriciovera.github.io`).

---

## 🧠 1. Flujo de Trabajo y Metodología (Memory Bank & SDD)

El proyecto opera bajo un modelo híbrido: **Memory Bank** para la gobernanza global del repositorio y **Spec-Driven Development (SDD)** para el ciclo de vida de nuevas funcionalidades.

### 1.1. Lectura Previa Obligatoria (Contexto en Silencio)
> **Directiva Obligatoria:**
> Antes de proponer cualquier cambio estructural o escribir código nuevo, debes revisar en silencio:
> 1. [`docs/constitution.md`](docs/constitution.md) (Principios innegociables de ingeniería).
> 2. [`docs/design.md`](docs/design.md) (Arquitectura y stack técnico).
> 3. [`docs/progress.md`](docs/progress.md) (Estado actual y lecciones aprendidas).

### 1.2. Regla de Coexistencia: Nuevas Features vs. Código Legacy
- **Nuevas Features (SDD Obligatorio):**
  - Toda nueva funcionalidad, modo de juego adicional o mecánica mayor debe gestionarse mediante **Spec-Driven Development** en su propia carpeta: `docs/specs/NNN-{nombre}/`.
  - El ciclo de desarrollo es estricto: `spec.md` ➔ `plan.md` ➔ `tasks.md` ➔ implementación paso a paso con verificación.
  - Se debe utilizar el set de skills de `.agents/skills/` (`/sdd`, `/sdd-spec`, `/sdd-clarify`, `/sdd-plan`, `/sdd-tasks`, `/sdd-implement`, `/sdd-validate`, `/sdd-change`, `/sdd-status`).
- **Features Consolidadas y Código Preexistente (Legacy):**
  - Las características ya implementadas permanecen documentadas en [`docs/specs.md`](docs/specs.md) y [`docs/task.md`](docs/task.md).
  - **NO se deben migrar retroactivamente a SDD** las features antiguas salvo que se encare un rediseño estructural, una refactorización de gran impacto o un cambio de alcance mayor sobre las mismas.
  - Corrección de bugs menores o parches de estabilidad sobre features legacy continúan registrándose en [`docs/task.md`](docs/task.md) y [`docs/progress.md`](docs/progress.md).

### 1.3. Regla Estricta e Inviolable de Estructura de Carpetas SDD (`NNN-{nombre}`)
> **Directiva Obligatoria de Aislamiento de Specs:**
> 1. **Toda spec DEBE residir obligatoriamente en su propia subcarpeta numerada secuencialmente:** `docs/specs/NNN-{nombre-de-la-spec}/` (ej. `docs/specs/001-daily-kanji/`, `docs/specs/002-social-share/`).
> 2. **Queda terminantemente PROHIBIDO** crear o alojar `spec.md`, `plan.md` o `tasks.md` directamente en la raíz de `docs/specs/`. La raíz de `docs/specs/` únicamente aloja las plantillas (`_template.md`, `_template_plan.md`, `_template_tasks.md`).
> 3. Si una spec se inicia a partir de una descripción o archivo suelto, el primer paso OBLIGATORIO del agente o desarrollador es determinar el siguiente número secuencial (ej. `001`, `002`), crear el directorio `docs/specs/NNN-{nombre}/` y ubicar todos sus artefactos (`spec.md`, `plan.md`, `tasks.md`) allí dentro.

### 1.4. Mantenimiento y Actualización Continua de `docs/progress.md`
> **Directiva de Sincronización:**
> Cada vez que se resuelva un bug, se complete una tarea de una spec o se finalice una funcionalidad:
> 1. Actualiza inmediatamente el archivo [`docs/progress.md`](docs/progress.md) reflejando el nuevo estado de las características y eliminando los bugs que hayan sido resueltos.
> 2. Si la tarea pertenece a una spec SDD, márcala con `[x]` en su respectivo `docs/specs/NNN-{nombre}/tasks.md`. Si pertenece a la hoja de ruta legacy, márcala en [`docs/task.md`](docs/task.md).

---

## 🛡️ 2. Reglas de Seguridad e Integridad

1. **Nunca borrar archivos sin confirmación explícita:**
   - Queda estrictamente prohibido ejecutar comandos destructivos (`rm`, `git clean`, etc.) o eliminar archivos/directorios existentes del proyecto sin antes solicitar y recibir la aprobación explícita del usuario.
2. **Protección de Secretos y Variables de Entorno:**
   - Nunca escribas credenciales, tokens o API keys quemadas (hardcoded) en el código fuente.
   - Utiliza siempre variables de entorno expuestas mediante `import.meta.env.PUBLIC_*` (definidas en `.env`).
3. **Consistencia de Saltos de Línea (CRLF / LF):**
   - El proyecto cuenta con normalización en `.gitattributes` (`* text=auto`). Mantén siempre los archivos de texto en formato LF o respeta la configuración de Git para evitar falsos positivos en el control de versiones.

---

## 🎨 3. Estilo de Código y Convenciones

### 3.1. Formato y Sintaxis
- **Indentación:** 2 espacios (sin tabulaciones duras).
- **Comillas:** Comillas dobles (`"`) en archivos TypeScript, TSX y JSON; comillas simples o dobles consistentes en imports y plantillas Astro.
- **Punto y coma:** Uso consistente de `;` al final de cada sentencia.
- **Tipado Estricto:** TypeScript en modo estricto (`astro/tsconfigs/strict`). Prohibido el uso indiscriminado de `any` salvo en transformaciones dinámicas justificadas de DTOs externos.
- **Idioma del Código:** Identificadores en **inglés** (variables, funciones, componentes, types, interfaces). Documentación, especificaciones y comentarios explicativos en **español**.

### 3.2. Convenciones de Nomenclatura
- **Componentes React / Astro:** `PascalCase` (ej. `GuessesTable.tsx`, `ArknightdleAbility.tsx`, `GameLayout.astro`).
- **Hooks personalizados:** `camelCase` con prefijo `use` (ej. `useDailyStorage.ts`, `useGameScore.ts`).
- **Servicios, Repositorios y Utilidades:** `camelCase` (ej. `scoreRepository.ts`, `dailyStorageRepository.ts`, `abilityVisuals.ts`).
- **Stores:**
  - Nanostores: Prefijo `$` para átomos (ej. `$playerName`).
  - Zustand: Prefijo `use` (ej. `useArknightStore`, `useFeatureFlag`).
- **Tipos e Interfaces:** `PascalCase` (ej. `OperatorDTO`, `Warframe`, `ColumnDef<T>`, `DailyGameState`).

### 3.3. Path Aliases (TypeScript & Bundler)
Utiliza siempre los alias configurados en `tsconfig.json` en lugar de rutas relativas profundas (`../../`):
- `@components/*` ➔ `src/components/*`
- `@layouts/*` ➔ `src/layouts/*`
- `@data/*` ➔ `src/data/*`
- `@hooks/*` ➔ `src/hooks/*`
- `@store/*` ➔ `src/store/*`
- `@lib/*` ➔ `src/lib/*`
- `@types/*` ➔ `src/types/*`
- `@services/*` ➔ `src/services/*`
- `@utils/*` ➔ `src/utils/*`
- `@auth/*` ➔ `src/components/auth/*`
- `@config/*` ➔ `src/config/*`

---

## 🏗️ 4. Reglas Técnicas y Arquitectura del Stack

### 4.1. Arquitectura de Islas de Astro
- Mantén las páginas de Astro (`src/pages/`) lo más ligeras posible, delegando la interactividad a las islas React con las directivas de hidratación adecuadas:
  - `client:load`: Para componentes críticos visibles de inmediato (ej. el juego principal o el `Sidebar`).
  - `client:visible`: Para componentes secundarios fuera del viewport inicial o interactivos bajo demanda (ej. `SettingsMenu`, `PlayerManager`).
  - `client:only="React"`: Para juegos que dependen estrictamente de APIs exclusivas del navegador (`localStorage`, `window`, Web Audio API).

### 4.2. Separación de Responsabilidades de Estado
- **Nanostores (`$playerName`):** Exclusivo para compartir datos ligeros entre islas independientes de Astro y React sin provocar re-renders del layout completo.
- **Zustand (`useArknightStore`, `createGameStore`):** Para la máquina de estados del juego (intentos, objetivo, victoria/derrota, modo diario vs. aleatorio) y configuraciones del usuario (`useFeatureFlag`).
- **Capa de Servicios y Repositorios:** Ningún componente de React debe llamar directamente a `supabase.from()` o acceder a claves crudas de `localStorage`; toda interacción debe pasar por `scoreRepository.ts`, `dailyStorageRepository.ts` o los servicios de dominio.

### 4.3. Algoritmo Determinista Diario
- Todo modo diario debe calcular su objetivo usando la librería `rand-seed` con la semilla determinista `YYYYMMDD + gameId` provista por `calculateDailyTarget` en `src/utils/game.ts`.

### 4.4. Theming y Estilos (Tailwind CSS v4)
- Respeta los tokens definidos en `@theme` en `src/styles/global.css`.
- Para estilos específicos de un juego (ej. Warframe o Arknights), utiliza selectores basados en atributos de datos: `[data-theme="nombre-del-juego"]` aplicados en el `<body>` por `GameLayout.astro`.
