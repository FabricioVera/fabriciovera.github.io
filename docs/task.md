# Memory Bank: Hoja de Ruta y Tareas Pendientes (task.md)

## 📌 Fase 1: Corrección de Bugs Críticos, Tipado y Estabilidad (Auditoría Actual)

- [ ] **Estandarizar Alias `@appTypes/*` y resolver errores TS6137**
  - **Archivos**: `tsconfig.json`, `src/store/useGameStorage.ts`, `src/components/games/CorrectBanner.tsx`, `src/components/games/arknights/ArknightsStore/useArknightStore.tsx`, `src/components/games/warframedle/*`, `src/utils/ability.ts`
  - **Acción**: Mapear `@appTypes/*` en `tsconfig.json` y actualizar imports para eliminar el conflicto de DefinitelyTyped.
- [ ] **Corregir selección de sugerencia con `Enter` en `AutocompleteInput`**
  - **Archivo**: `src/components/ui/Autocomplete/useAutocomplete.ts`
  - **Acción**: Agregar `e.preventDefault()` en la pulsación de `Enter` y procesar el guess del item seleccionado directamente.
- [ ] **Persistir estado de rendición (`surrender`) en modo diario**
  - **Archivos**: `src/store/useGameStorage.ts` y `src/components/games/arknights/ArknightsStore/useArknightStore.tsx`
  - **Acción**: Llamar a `saveDailyProgress(gameId, guesses, "lost")` al rendirse en modo diario para no perder el estado al recargar.
- [ ] **Proteger reproductor de audio contra bucle infinito y desincronización**
  - **Archivo**: `src/components/ui/Player/VoicePlayer.tsx`
  - **Acción**: Añadir límite de 5 reintentos en `onError`, corregir `onEnded` a `setIsPlaying(false)` y capturar promesas de `play()`.
- [ ] **Incorporar `targetId` en la semilla PRNG de transformaciones de habilidades**
  - **Archivo**: `src/utils/ability.ts`
  - **Acción**: Sembrar `Rand(seed + "-abilities-" + targetId)` para que habilidades aleatorias tengan transformaciones únicas.
- [ ] **Corregir warning de `@import` en `global.css` y sintaxis de viewport en `GameLayout.astro`**
  - **Archivos**: `src/styles/global.css`, `src/layouts/GameLayout.astro`
  - **Acción**: Mover `@import` de Oswald al inicio de `global.css` y arreglar comillas en el `<meta name="viewport" ...>`.
- [ ] **Corregir atributos SVG en JSX a camelCase**
  - **Archivo**: `src/components/Icons.tsx`
  - **Acción**: Convertir `fill-rule`, `clip-rule`, `stroke-width`, `stroke-linecap`, `stroke-linejoin` a camelCase.
- [ ] **Reubicar configuración de créditos de mascotas**
  - **Archivos**: `src/config/imageCredits.ts`, `src/components/ui/Mascot/ArknightsMascot.tsx`
  - **Acción**: Crear `src/config/imageCredits.ts` e importar con alias `@config/imageCredits`.

---

## 🧹 Fase 2: Limpieza de Código Muerto y Deuda Técnica (Prioridad Media)

- [x] **Eliminar o poblar archivos vacíos**
  - **Archivo**: `src/config/gameModeConfig.ts`
  - **Acción**: Eliminado el archivo vacío tras confirmación explícita del usuario.
- [x] **Remover Hooks y funciones huérfanas**
  - **Archivos**: `src/hooks/useOperators.ts`, `src/hooks/useDailyGame.ts`, `src/components/games/warframedle/hooks/useWarframedle.ts`
  - **Acción**: Eliminados los hooks obsoletos huérfanos `useOperators.ts` y `useDailyGame.ts` (con confirmación explícita) y limpiados todos los imports huérfanos y rutas relativas en `useWarframedle.ts`.
- [x] **Depurar `src/lib/arknights.ts`**
  - **Acción**: Eliminadas las funciones remotas obsoletas `fetchOperators_awedtan` y `fetchOperators_rhodesapi` junto a las constantes de API externa, manteniendo la carga optimizada desde el dataset local.
- [x] **Estandarizar tipos de `rarity`**
  - **Archivos**: `src/types/operatorDTO.ts`, `src/utils/game.ts`, `src/components/games/arknights/ArknightsStore/useArknightStore.tsx`, `src/hooks/useGameHelpers.ts`
  - **Acción**: Tipado estricto con `OperatorDTO[]` y comparación numérica estricta `op.rarity === randomRarity`. Tipado genérico en `calculateDailyTarget<T>` y `calculateRandomTarget<T>`. Corregida la selección aleatoria de `arknightdleability` en `initializeGame` y `setGameMode`.

---

## 🏗️ Fase 3: Unificación de la Arquitectura de Estado (Refactorización)

- [x] **Migrar `WarframedleGame` a la Factoría Genérica `createGameStore`**
  - **Archivos**: `src/components/games/warframedle/WarframedleGame.tsx`, `src/components/games/warframedle/hooks/useWarframedle.ts`
  - **Acción**: Reemplazada la composición legacy de hooks manuales por `useWarframedleStore = createGameStore<Warframe, Warframe>`, unificando el ciclo de vida, persistencia y límite de 10 intentos con la arquitectura Zustand genérica.
- [x] **Estandarizar persistencia de `GameMode`**
  - **Archivos**: `src/services/gameModeRepository.ts`, `src/hooks/useGameModeStorage.ts`, `src/components/games/arknights/ArknightsStore/useArknightStore.tsx`, `src/store/useGameStorage.ts`
  - **Acción**: Creado el servicio unificado `gameModeRepository` con persistencia mediante cookies seguras (`SameSite=Lax`) y expiración automática a las 23:59:59 del día en curso, consumido de forma consistente por todos los stores y hooks.

---

## 🚀 Fase 4: Finalización del Juego de Anime (Jikan API)

- [ ] **Completar la integración de `AnimeGame`**
  - **Opción A (Recomendada - SSR Endpoint en Astro)**: Crear `src/pages/api/character.ts` que consulte la API de Jikan con caching y entregue `{ name, image, anime }`.
  - **Opción B (Cliente Directo)**: Usar las funciones ya escritas en `src/lib/jikan.ts` (`getRandomTopCharacter`) directamente en el hook `useAnimeGame`.
- [ ] **Corregir lógica de validación de respuestas**
  - **Archivo**: `src/components/games/guess-anime/hooks/useAnimeGame.ts`
  - **Acción**: Reemplazar el `split("")` roto por comparación de similitud de cadenas (usando `normalizeString` o coincidencia por palabras).
- [ ] **Habilitar el juego en el menú principal**
  - **Archivo**: `src/data/games.ts`
  - **Acción**: Agregar la tarjeta del juego con `isAvailable: true` y sus imágenes asociadas para que aparezca en la Home y Sidebar.

## ⚙️ Infraestructura y Metodología

- [x] **Adopción de Infraestructura Metodológica SDD (Spec-Driven Development)**
  - **Archivos**: `.agents/skills/*`, `docs/constitution.md`, `docs/specs/_template*.md`, `GEMINI.md`, `docs/design.md`
  - **Acción**: Adaptadas las 10 skills de `.agents/skills/` al stack técnico y arquitectónico de FabriGames (Astro, React, Zustand, determinismo PRNG y repositorios). Establecida la Constitución de 5 artículos y plantillas canónicas. Configurado el modelo de coexistencia donde las nuevas features se desarrollan con SDD mientras las consolidadas se mantienen estables.

---

## ✨ Fase 5: Nuevas Funcionalidades y Mejoras de Producto (Gobernadas por SDD)

> [!NOTE]
> Siguiendo la regla de coexistencia definida en `GEMINI.md`, toda nueva funcionalidad de esta fase se gestionará de forma independiente mediante el ciclo SDD (`docs/specs/NNN-{nombre}/`) utilizando las skills correspondientes (`/sdd-spec`, `/sdd-plan`, `/sdd-tasks`, `/sdd-implement`, `/sdd-validate`).

- [ ] **Botón "Compartir Resultado" (Social Share Wordle-style)**
  - Generar un texto con emojis representativo del desempeño diario:
    ```
    FabriGames - Arknightdle Diario #20260901
    ⭐ ⭐ ⭐ Intentos: 4/10
    🟩🟩🟨🟥🟩
    https://fabriciovera.github.io/games/arknightdle
    ```
  - Copiar automáticamente al portapapeles con feedback tipo toast / tooltip.
- [ ] **Modal de Estadísticas del Jugador**
  - Guardar estadísticas en `localStorage`: Partidas jugadas, % de victorias, racha actual, mejor racha y gráfico de distribución de intentos.
- [ ] **Feedback visual y cuenta regresiva para el siguiente desafío diario**
  - Mostrar un contador regresivo (*"Próximo juego diario en: HH:MM:SS"*) cuando la partida diaria ya fue completada.

---

## 🎨 Fase 6: Optimización, UX y Accesibilidad

- [ ] **Accesibilidad en `AutocompleteInput`**
  - Añadir soporte para navegación completa con flechas de teclado (`ArrowUp`, `ArrowDown`), `Enter` para seleccionar, `Escape` para cerrar lista y atributos `aria-expanded`, `aria-autocomplete`.
- [ ] **Optimización de Assets e Imágenes**
  - Comprimir imágenes PNG/JPG en `/public/img/` a formato WebP optimizado.
  - Asegurar `loading="lazy"` y tamaños explícitos en todos los avatares para evitar saltos de layout (CLS).
- [ ] **Manejo de estado offline / Fallback de Supabase**
  - Mostrar aviso no intrusivo si la conexión con Supabase falla al guardar un puntaje, reintentando en segundo plano.
