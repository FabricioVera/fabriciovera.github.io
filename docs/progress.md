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
- **Daily Kanji (Aprender Japonés)** (`/kanji`):
  - ✅ Reto diario 100% determinista con semilla `YYYYMMDD + "kanji"` sobre kanjis y 208 kanas (`kana.json`).
  - ✅ Expansión a 20 desafíos por modalidad (80 retos diarios en total): 20 Lecturas, 20 Significados, 20 Vocabularios (en desarrollo) y 20 Trazos.
  - ✅ Navegación no lineal y selector libre de modalidades: cambio instantáneo entre las 4 etapas mediante pestañas interactivas sin necesidad de haber concluido la anterior.
  - ✅ Barra de paginación interactiva del 1 al 20 sobre el kanji activo con salto directo a cada ejercicio y colores de estado (acierto `🟩`, fallo `🟥`, pendiente, activo).
  - ✅ Modo revisión e histórico de respuestas: visualización completa de la respuesta emitida por el usuario y la solución correcta en ejercicios ya respondidos (solo lectura, sin reintentos evaluativos).
  - ✅ Catálogo de 5 tipografías japonesas de alta legibilidad (*Noto Sans JP*, *Zen Kaku Gothic New*, *BIZ UDPGothic*, *Klee One*, *Zen Maru Gothic*) con selector interactivo en vivo y persistencia.
  - ✅ **Fase Vocabulario, Trazos Inversos y 1000 Kanjis (T8-T13 Completada y Perfeccionada)**:
    - ✅ `T8`: Catálogo extendido de 1000 kanjis Jouyou de alta frecuencia con compuestos y determinismo verificado (`top1000.json` y `jouyou1000.json`).
    - ✅ `T9`: Silabario Kana en panel lateral no intrusivo (sidebar drawer) ordenado en 5 columnas canónicas (`a, i, u, e, o`) para consulta simultánea sin bloquear el juego.
    - ✅ `T10`: Modalidad de Vocabulario Compuesto (Jukugo) con furigana individual desglosado por cada kanji (`splitWordFurigana`).
    - ✅ `T11`: Modo Trazos Inversos (Español + pronunciación ➔ dibujar kanji objetivo desde cero sin silueta previa).
    - ✅ `T12`: Navegación ágil por teclado con tecla `Enter` tras responder en selección múltiple y modo revisión (sin bloqueo de foco ni dependencias obsoletas).
    - ✅ `T13`: Mantener la interfaz limpia y directa (cero subtítulos redundantes, preservando personalizaciones de interfaz del usuario).
    - ✅ `T14`: Sidebar de Repaso de Kanjis con Errores (Cuaderno de Errores): captura automática de fallos en cualquiera de las 4 modalidades, persistencia en `localStorage`, drawer no intrusivo con enlace a `japonesbasico.com`, significado en español, romaji y botón de descarte individual `✕`.
    - ✅ `KanjiLink`: Todos los kanjis en pantalla enlazan a `https://japonesbasico.com/kanji/{kanji}` manteniendo exactamente su estilo tipográfico y visual.
  - ✅ Selección determinista de 20 kanjis diarios sin duplicados con barajado PRNG reproducibles universalmente.
  - ✅ Regla innegociable de 1 solo intento evaluativo por desafío con revelación inmediata de feedback didáctico.
  - ✅ Persistencia incremental por pregunta desacoplada con `kanjiRepository` en `localStorage` (restauración exacta ante recargas o cierres de pestaña).
  - ✅ Trazos interactivos con Hanzi Writer adaptados al kanji activo con limpieza de memoria SVG, cuadrícula mizu-grid y animación de trazo correcto.
  - ✅ Modal de resumen con desglose detallado de aciertos por modalidad y viralidad social ("Toque a un amigo" con Web Share API, WhatsApp y portapapeles).
  - ✅ Toggle de accesibilidad entre modalidades "Selección Múltiple" y "Escritura Directa".
  - ✅ Gobernanza bajo Spec-Driven Development en carpeta aislada `docs/specs/001-daily-kanji/`.
  - ✅ Integrado en catálogo general de juegos (`src/data/games.ts`), ruta Astro (`/kanji`) y ruta dinámica (`/games/daily-kanji`).

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

- 🟡 **Adivina el Anime por Imagen (`AnimeGame` / `character-by-image`)**:
  - El componente existe en `src/components/games/guess-anime/GameContainer.tsx` y está registrado condicionalmente en `GameRenderer.astro`.
  - **Incompleto**: No está habilitado en `src/data/games.ts` (no aparece en la home ni en el sidebar).
  - **Bloqueado**: Intenta consumir un endpoint `/api/character` que no existe en el servidor.
- 🟡 **Compartir Resultados en Redes (Social Share en Otros Juegos)**:
  - Implementado para Daily Kanji (`kanjiShare.ts`); pendiente extender al resto de juegos (`guess-mbti`, `arknightdle`, `warframedle`).
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
