# Memory Bank: Hoja de Ruta y Tareas Pendientes (task.md)

## 📌 Fase 1: Corrección de Bugs Críticos y Seguridad (Prioridad Alta)

- [x] **Corregir inconsistencia en el ID de Voicelines**
  - **Archivos**: `src/components/games/arknights/ArknightsStore/useArknightStore.tsx` y `src/hooks/useGameHelpers.ts`
  - **Acción**: Reemplazado `"arknightdlevoiceline"` por `"arknightdlevoicelines"` en todas las comprobaciones para que el cálculo ponderado por rareza en modo aleatorio funcione correctamente.
- [x] **Migrar credenciales a Variables de Entorno en Supabase**
  - **Archivo**: `src/lib/supabase.ts` y `.github/workflows/astro.yml`
  - **Acción**: Reemplazados los strings hardcodeados por `import.meta.env.PUBLIC_SUPABASE_URL` e `import.meta.env.PUBLIC_SUPABASE_ANON_KEY`, e inyectados en el step de build de GitHub Actions.
- [x] **Corregir imports y dependencias en Hooks**
  - **Archivo**: `src/components/games/guess-anime/hooks/useAnimeGame.ts`
    - Eliminado el import erróneo `import { set } from "astro:schema";`.
  - **Archivo**: `src/components/games/guess-mbti/hooks/useMbtiGame.ts`
    - Agregados `onCorrectGuess` y `onIncorrectGuess` al array de dependencias del `useCallback` en `handleGuess`.

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

---

## ✨ Fase 5: Nuevas Funcionalidades y Mejoras de Producto

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
