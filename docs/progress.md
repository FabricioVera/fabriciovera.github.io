# Memory Bank: Estado Actual del Desarrollo (progress.md)

## 1. Características Implementadas y Funcionando (Terminadas)

### 🎮 Juegos y Mecánicas
- **Arknightdle (Clásico)** (`/games/arknights`):
  - ✅ Comparación multicriterio por tabla: Género, Facción, Raza, Clase, Rareza (con indicadores ⬆️/⬇️), Tags (coincidencia exacta/intersección) y Arqueotipo.
  - ✅ Modos Diario (semilla determinista) e Infinito (con reroll y rendición).
  - ✅ Toggle de renderizado: imágenes estáticas vs. sprites animados en video (`showSprites`).
  - ✅ Autocompletado optimizado con preview del personaje (`HeroInput`) y animaciones en Framer Motion.
- **Arknightdle: VoiceLine** (`/games/arknightdlevoicelines`):
  - ✅ Reproductor de audio integrado con soporte de múltiples pistas (pista 1 de inicio, pistas 2 y 3 desbloqueadas a los 5 y 10 intentos).
  - ✅ Botón play/pause animado con morphing SVG, control de volumen y barra seek interactiva.
- **Arknightdle: Ability** (`/games/arknightdleability`):
  - ✅ Desbloqueo progresivo de los íconos de habilidades (Skill 1, 2 y 3) según intentos.
- **Arknightdle LevelPath**:
  - ✅ Barra de progreso y navegación entre sub-juegos (`AD-1`, `AD-2`, `AD-3`) con cálculo dinámico de estrellas (1 a 3 estrellas según el número de intentos).
- **WarframeDLE (Clásico)** (`/games/warframedle`):
  - ✅ Deducción de Warframe por atributos: Género, Variante Prime, Polaridad de Aura, Estilos de juego y Año de lanzamiento con comparadores numéricos.
  - ✅ Límite estricto de 10 intentos en modo diario.
  - ✅ Implementado y unificado sobre la factoría genérica de stores de Zustand (`createGameStore`).
- **WarframeDLE: Habilidades** (`/games/warframedleabilities`):
  - ✅ Transformaciones visuales dinámicas: rotación aleatoria, flip horizontal y zoom inicial (3x) que se aleja con cada intento fallido.
  - ✅ Implementado sobre la factoría genérica de stores de Zustand (`createGameStore`).
- **Adivina el MBTI** (`/games/guess-mbti`):
  - ✅ Tablero interactivo con 16 tipos organizados por cuadrantes de personalidad.
  - ✅ Sistema de racha de puntos continuos que reinicia ante errores y guarda récord personal.

### 🌐 Funcionalidades Globales
- **Perfil de Jugador**: Identificación por alias (`$playerName`) sincronizada reactivamente entre islas de Astro mediante Nanostores y guardada en `localStorage`.
- **Leaderboards**: Panel lateral (drawer) con Top 10 diario y global conectado a Supabase con reintentos automáticos.
- **Feature Flags**: Menú de configuración para alternar `showSprites` y `showMascot` persistido con Zustand `persist`.
- **Persistencia de GameMode Unificada**: Servicio centralizado `gameModeRepository` con cookies (`SameSite=Lax`) y caducidad al final del día (23:59:59).
- **Theming**: Paletas dinámicas por juego mediante atributos `data-theme`, tokens en `@theme` de Tailwind v4 y cursor temático retro.
- **Observabilidad / Logger**: `AppLogger` con reporte asíncrono de errores a Supabase (`app_errors`) en producción.
- **Metodología SDD (Spec-Driven Development)**: Infraestructura de skills en `.agents/skills/`, agentes especializados en `.agents/agents/` (`coordinator`, `planner`, `implementer`, `reviewer`), principios innegociables en `docs/constitution.md` y plantillas canónicas en `docs/specs/` preparadas para gobernar las nuevas features bajo el modelo de coexistencia.

---

## 2. Características Incompletas o a Medias (Work In Progress)

- 🟡 **Daily Kanji [/kanji] (Aprender Japonés)**:
  - En desarrollo activo bajo metodología SDD (`docs/specs/spec.md`, `plan.md`, `tasks.md`).
  - Progreso: 5/10 tareas completadas.
  - ✅ **T1 Completada:** Dependencia `hanzi-writer` (v3.7.3) instalada e integrada, y datasets estáticos creados en `src/data/kanji/kana.json` (104 kanas de cada tipo: Hiragana y Katakana) y `src/data/kanji/n5.json` (79 kanjis N5 esenciales estructurados con lecturas on/kun, significados y ejemplos).
  - ✅ **T2 Completada:** Contratos y tipos estrictos de dominio creados en `src/types/kanji.ts` (`KanaItem`, `KanjiWord`, `KanjiN5`, `KanjiStageKey`, `StageOutcome`, `InputMode`, `KanjiStageProgress`, `KanjiDailyState`, `KanjiStats`, `ShareResultPayload`, `KanjiRepositoryContract`) y re-exportados en `src/types/index.ts`.
  - ✅ **T3 Completada:** Funciones puras deterministas con `rand-seed` (`getDailyKanji`, `getMeaningOptions`, `getReadingOptions`, `getRomajiOptions`, `normalizeAnswer`, `isAnswerCorrect`) en `src/utils/kanji.ts` y motor conversor fonético en tiempo real (`convertRomajiToHiragana`, `convertRomajiToKatakana`, `normalizeRomaji`) en `src/utils/kanaConverter.ts`.
  - ✅ **T4 Completada:** Repositorio de persistencia incremental desacoplado `kanjiRepository` (`src/services/kanjiRepository.ts`) con soporte de guardado por etapa, cálculo puro e idempotente de racha, preferencias de modo de entrada, protección SSR y fallback volátil en memoria.
  - ✅ **T5 Completada:** Store reactivo de Zustand `useKanjiStore` (`src/store/useKanjiStore.ts`) con soporte para las 4 etapas, regla estricta de 1 solo intento por etapa, feedback educativo tras fallo, sincronización automática con `kanjiRepository` y gestión de trazos caligráficos.
  - ⏳ **Próxima Tarea:** T6 (Componentes de Cabecera y Toggle de Modalidad en `KanjiProgressBar.tsx` y `KanjiModeToggle.tsx`).
- 🟡 **Adivina el Anime por Imagen (`AnimeGame` / `character-by-image`)**:
  - El componente existe en `src/components/games/guess-anime/GameContainer.tsx` y está registrado condicionalmente en `GameRenderer.astro`.
  - **Incompleto**: No está habilitado en `src/data/games.ts` (no aparece en la home ni en el sidebar).
  - **Bloqueado**: Intenta consumir un endpoint `/api/character` que no existe en el servidor.
- 🟡 **Compartir Resultados en Redes (Social Share)**:
  - No existe generación de grid de emojis (estilo Wordle: `🟩🟩🟨🟥`) para copiar al portapapeles y compartir resultados diarios.
- 🟡 **Historial y Estadísticas de Jugador**:
  - No hay vista de estadísticas acumuladas (tasa de victoria, promedio de intentos, distribución de conjeturas).

---

## 3. Bugs y Problemas Evidentes Detectados en el Código

| Severidad | Archivo(s) Afectado(s) | Descripción del Problema / Bug |
| :--- | :--- | :--- |
| 🔴 **Alta** | `src/components/games/guess-anime/hooks/useAnimeGame.ts` | **Lógica de validación rota y endpoint faltante**: Llama a `/api/character` inexistente en SSG y ejecuta `normalizedName.split("").includes(normalizedGuess)`, lo que compara letras individuales en vez de palabras. Además, el estado de error es sobreescrito de inmediato por `setStatus("playing")`. |
| 🔴 **Alta** | Varios (`useGameStorage.ts`, `CorrectBanner.tsx`, `useArknightStore.tsx`, `warframedle`, `ability.ts`) | **Error TS6137 de resolución de tipos**: Uso del prefijo `@types/` en paths locales en conflicto con DefinitelyTyped. Requiere estandarización al alias `@appTypes/*`. |
| 🟠 **Media** | `src/components/ui/Autocomplete/useAutocomplete.ts` | **Fallo al seleccionar sugerencia con Enter**: No ejecuta `e.preventDefault()`, disparando el submit del form con el valor previo no actualizado y mostrando error de validación. |
| 🟠 **Media** | `src/store/useGameStorage.ts` y `useArknightStore.tsx` | **Pérdida de persistencia en Surrender diario**: Al rendirse en modo `daily`, no guarda el estado `"lost"` en `localStorage`, restableciendo la partida al recargar. |
| 🟡 **Baja** | `src/components/ui/Player/VoicePlayer.tsx` | **Bucle de peticiones en 404**: `handleError` no limitaba los reintentos al fallar un track de audio, pudiendo saturar la red. |
| 🟡 **Baja** | `src/utils/ability.ts` | **Variabilidad nula en transformaciones de habilidades**: No utiliza `targetId` en la semilla de `Rand`, generando idéntico recorte/rotación para todas las habilidades del día en modo aleatorio. |
| 🟡 **Baja** | `src/components/games/arknights/ArknightdleAbility.tsx` | **Propiedad `key` faltante**: Renderizado de lista de íconos de habilidad sin prop `key`. |
| 🟡 **Baja** | `src/styles/global.css` | **Sintaxis CSS `@import` anidada**: `@import` de fuentes Oswald dentro de selector `[data-theme="..."]`. |
| 🟡 **Baja** | `src/components/Icons.tsx` | **Propiedades SVG en kebab-case**: `fill-rule`, `clip-rule`, `stroke-width` provocan advertencias en consola de React. |
| 🟡 **Baja** | `src/layouts/GameLayout.astro` | **Error de sintaxis en meta viewport**: Comillas y coma mal formateadas en `<meta name="viewport" ...>`. |
