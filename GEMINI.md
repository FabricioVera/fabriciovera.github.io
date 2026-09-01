# GEMINI.md — Directivas y Reglas del Sistema (Memory Bank)

Este archivo define las instrucciones operativas, directivas de seguridad, estándares de código y reglas de arquitectura para cualquier asistente o desarrollador que trabaje en el repositorio **FabriGames** (`fabriciovera.github.io`).

---

## 🧠 1. Flujo de Trabajo y Protocolo del Memory Bank

### 1.1. Lectura Previa Obligatoria (Contexto en Silencio)
> **Directiva Obligatoria:**
> Antes de proponer cualquier cambio estructural o escribir código nuevo, debes revisar en silencio `docs/design.md` y `docs/progress.md` para mantener el contexto del estado actual, las convenciones arquitectónicas y las tareas en curso.

### 1.2. Mantenimiento y Actualización Continua de `docs/progress.md` y `docs/task.md`
> **Directiva de Sincronización:**
> Cada vez que se resuelva un bug, se complete una funcionalidad o se introduzca una modificación relevante en la arquitectura:
> 1. Actualiza inmediatamente el archivo `docs/progress.md` reflejando el nuevo estado de las características y eliminando los bugs que hayan sido resueltos.
> 2. Marca con `[x]` las tareas completadas en `docs/task.md` y añade nuevas subtareas si surgen durante el desarrollo.

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
