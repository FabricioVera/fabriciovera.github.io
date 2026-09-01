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
- **Theming**: Paletas dinámicas por juego mediante atributos `data-theme`, tokens en `@theme` de Tailwind v4 y cursor temático retro.
- **Observabilidad / Logger**: `AppLogger` con reporte asíncrono de errores a Supabase (`app_errors`) en producción.

---

## 2. Características Incompletas o a Medias (Work In Progress)

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
| 🔴 **Alta** | `src/components/games/guess-anime/hooks/useAnimeGame.ts` | **Lógica de validación rota y endpoint faltante**: Llama a `/api/character` inexistente y ejecuta `normalizedName.split("").includes(normalizedGuess)`, lo que compara letras individuales en vez de palabras. |
| 🟠 **Media** | `src/store/useGameStorage.ts` vs `src/components/games/warframedle/hooks/useWarframedle.ts` vs `useArknightStore.tsx` | **Fragmentación de Arquitectura de Estado**: Existen 3 implementaciones distintas para gestionar el ciclo de vida de los juegos (custom hooks legacy, store custom de Arknights y factory genérica de Zustand). |
| 🟡 **Baja** | `src/config/gameModeConfig.ts` | **Archivo vacío huérfano**: Archivo de 0 bytes sin código ni exports. |
| 🟡 **Baja** | `src/hooks/useOperators.ts` | **Hook huérfano**: Hook no utilizado en ninguna parte del proyecto tras la migración a `useArknightStore`. |
| 🟡 **Baja** | `src/components/games/warframedle/hooks/useWarframedle.ts` | **Import no utilizado**: Importa `useDailyGame` pero no lo utiliza. |
| 🟡 **Baja** | `src/lib/arknights.ts` | **Funciones obsoletas no eliminadas**: `fetchOperators_awedtan` y `fetchOperators_rhodesapi` siguen en el archivo aunque la app ahora usa `fetchOperators` con datos locales de `operadores_arknightsV2.json`. |
