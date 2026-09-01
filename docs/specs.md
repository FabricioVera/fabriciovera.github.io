# Memory Bank: Especificaciones del Proyecto (specs.md)

## 1. Resumen Ejecutivo
**FabriGames** (`fabriciovera.github.io`) es una plataforma web interactiva de minijuegos diarios y de deducción estilo *Wordle* / *-dle*, orientada a comunidades de videojuegos y anime. El proyecto combina mecánicas de adivinanza mediante pistas progresivas, comparaciones de atributos, audio, imágenes alteradas y tableros interactivos con un sistema de progresión diaria, récords y clasificaciones globales.

---

## 2. Público Objetivo
- Jugadores y fanáticos de franquicias específicas (**Arknights**, **Warframe**, **Anime / Manga**).
- Entusiastas de juegos de deducción diarios y trivias (estilo *Loldle*, *Wordle*, *Pokedle*).
- Usuarios que buscan desafíos rápidos diarios o sesiones infinitas para poner a prueba su conocimiento del lore, estadísticas, mecánicas y habilidades de sus juegos favoritos.

---

## 3. Catálogo de Juegos y Mecánicas

### 3.1. Arknightdle (Ecosistema Arknights)
Suite de minijuegos basados en el universo de *Arknights* con datos enriquecidos de operadores extraídos de la wiki:

- **Arknightdle (Clásico)**:
  - **Objetivo**: Adivinar el operador objetivo mediante comparaciones en una tabla de atributos.
  - **Atributos comparados**: Género, Afiliación/Facción, Raza, Clase, Rareza (con pistas direccionales ⬆️ / ⬇️), Tags (coincidencia parcial/total) y Arqueotipo/Rama.
  - **Feedback visual**:
    - 🟩 Verde (`MATCH`): Coincidencia exacta o conjunto idéntico.
    - 🟨 Amarillo (`PARTIAL_MATCH`): Coincidencia parcial (intersección en listas de tags).
    - 🟥 Rojo (`NOT_MATCH`): Sin coincidencia.
  - **Opciones**: Soporte para renderizado de avatares estáticos o sprites animados en video (`showSprites`).

- **Arknightdle: VoiceLine (Líneas de Voz)**:
  - **Objetivo**: Identificar al operador escuchando sus archivos de audio originales en japonés.
  - **Mecánica**: Pistas de voz progresivas que se desbloquean al acumular intentos fallidos (Pista 1 disponible de inicio, Pista 2 a los 5 intentos, Pista 3 a los 10 intentos).
  - **Reproductor de audio integrado**: Control de reproducción con botón animado SVG, barra de búsqueda (seek) interactiva y control de volumen.

- **Arknightdle: Ability (Habilidades)**:
  - **Objetivo**: Descubrir al operador a partir de los íconos de sus habilidades (Skills 1, 2 y 3).
  - **Mecánica**: El primer ícono de habilidad se muestra de inmediato; las habilidades subsecuentes se desbloquean conforme aumentan los intentos (a los 5 y 10 intentos).

- **Progresión Arknightdle (LevelPath)**:
  - Sistema de navegación entre niveles (`AD-1`, `AD-2`, `AD-3`) con estado de completitud diario visible en tiempo real.
  - Calificación por estrellas al ganar según la cantidad de intentos empleados (3 estrellas: <5 intentos, 2 estrellas: <10 intentos, 1 estrella: >=10 intentos).

---

### 3.2. WarframeDLE (Ecosistema Warframe)
Minijuegos temáticos basados en los Warframes del juego de Digital Extremes:

- **WarframeDLE: Warframes (Clásico)**:
  - **Objetivo**: Adivinar el Warframe objetivo evaluando propiedades.
  - **Atributos**: Género, Variante Prime (Prime / No Prime), Polaridad de Aura, Estilo de juego (Playstyle), Año de lanzamiento (con comparador ⬆️ / ⬇️).
  - **Límite**: En modo diario cuenta con un límite estricto de 10 intentos.

- **WarframeDLE: Habilidades (Abilities)**:
  - **Objetivo**: Adivinar el Warframe dueño de una habilidad a partir de su ícono recortado.
  - **Mecánica visual dinámica**: La imagen del ícono se genera con rotación aleatoria, inversión horizontal (flip) y un zoom inicial extremo (3x). Con cada intento fallido, el zoom disminuye gradualmente (0.4x por intento) hasta revelar el ícono completo al ganar o perder.

---

### 3.3. Adivina el MBTI (Guess MBTI)
- **Objetivo**: Deducir la personalidad de 16 tipos (MBTI) de un personaje ficticio/anime a partir de su ficha e imagen.
- **Mecánica**: Tablero interactivo dividido por grupos de personalidad (Analistas `_NT_`, Diplomáticos `_NF_`, Centinelas `_S_J`, Exploradores `_S_P`).
- **Sistema de Puntuación**: Modo racha (streak) donde un acierto suma puntos y un fallo reinicia el contador, enviando el récord personal a la base de datos si supera la puntuación previa.

---

### 3.4. Adivina el Anime por Imagen (AnimeGame - Jikan API)
- **Objetivo**: Identificar personajes de anime a partir de imágenes dinámicas consumidas desde la API REST de Jikan (MyAnimeList).
- **Mecánica**: Autocompletado y validación de texto contra la respuesta correcta con botón para pasar al siguiente personaje aleatorio.

---

## 4. Funcionalidades Transversales

### 4.1. Modos de Juego
1. **Modo Diario (`daily`)**:
   - Objetivo único del día generado mediante un generador pseudoaleatorio determinista (`rand-seed`) basado en la fecha local del usuario (`YYYYMMDD` + `gameId`).
   - Todos los jugadores en el mundo juegan el mismo objetivo cada día.
   - El progreso y estado de la partida se guardan en `localStorage` con expiración automática al cambiar el día.
   - Envío automático de puntuaciones al Leaderboard diario de Supabase al ganar o perder.

2. **Modo Infinito / Aleatorio (`random`)**:
   - Generación de objetivos aleatorios ponderados o uniformes para juego casual continuo.
   - Botón de re-roll (Tirada de dado) para cambiar de objetivo sin restricciones.
   - Botón de rendición (*Surrender* / Bandera blanca) para revelar la solución inmediatamente.

### 4.2. Perfil de Jugador (Auth Ligero)
- Sistema sin contraseñas: el usuario ingresa un alias/nombre de jugador (`$playerName`).
- Almacenado localmente en `localStorage` y sincronizado en tiempo real entre componentes mediante **Nanostores**.
- Bloqueo de vistas de juego mediante el componente `<RequirePlayer>` si el usuario no tiene nombre registrado.
- Botón de cierre de sesión / cambio de nombre en cualquier momento desde el componente `Pointer` o el menú inicial.

### 4.3. Leaderboards (Clasificaciones Globales y Diarias)
- Panel deslizante lateral (drawer) con el Top 10 de jugadores por juego.
- Pestaña de clasificación diaria (filtrada por el rango de fechas de hoy) o histórica.
- Soporte para ordenamiento ascendente (menor cantidad de intentos gana, ej: Arknightdle / Warframedle) o descendente (mayor puntuación gana, ej: MBTI).
- Manejo de reintentos automáticos (`withRetry`) y respaldo contra errores de conexión.

### 4.4. Feature Flags y Personalización
- Menú de ajustes accesible desde la barra superior (`SettingsMenu`).
- Flags persistentes en `localStorage` mediante Zustand:
  - `showSprites`: Alternar entre imágenes estáticas y sprites animados en video para las tablas de resultados.
  - `showMascot`: Mostrar u ocultar la ilustración flotante de la mascota temática con sus respectivos créditos de autor.

### 4.5. Sistema de Telemetría y Errores
- Logger unificado con discriminación de entornos (desarrollo vs producción).
- En producción, los errores no controlados se reportan de forma asíncrona (*fire-and-forget*) a la tabla `app_errors` en Supabase.
