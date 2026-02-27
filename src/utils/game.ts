import Rand from "rand-seed";

export const calculateDailyTarget = (listTarget: any[]) => {
  const today = new Date();
  const seed = (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  ).toString();

  const rand = new Rand(seed);
  const randomValue = rand.next();

  return listTarget[Math.floor(randomValue * listTarget.length)];
};

export const calculateRandomTarget = (listTarget: any[]) => {
  const randomIndex = Math.floor(Math.random() * listTarget.length);
  return listTarget[randomIndex];
};

// src/hooks/useAbilityVisuals.ts
import type { GameStatus } from "src/types/game";

/**
 * Configuración estática para los límites de las transformaciones visuales.
 */
const VISUAL_CONFIG = {
  MAX_ZOOM: 3,
  MIN_ZOOM: 1.0,
  ZOOM_DECREASE_PER_GUESS: 0.4,
};

/**
 * Hook para calcular las transformaciones visuales (zoom, rotación, espejado) de una imagen.
 * * @param {string} targetId - Identificador único del objetivo (usado como semilla).
 * @param {number} attempts - Cantidad de intentos realizados por el jugador.
 * @param {GameStatus | string} status - Estado actual de la partida ('playing', 'won', 'lost').
 * @returns {React.CSSProperties} Objeto con las propiedades CSS `transform` y `transition`.
 */
export const useAbilityVisuals = (
  targetId: string,
  targetImage: string,
  attempts: number,
  status: GameStatus | string,
): React.CSSProperties => {
  if (status !== "playing") {
    return {
      backgroundImage: `url(${targetImage})`,
      backgroundSize: "100%",
      backgroundPosition: "0% 0%",
      transform: "rotate(0)",
      transition: "all 0.8s ease-in-out",
    };
  }
  const today = new Date();
  const seed = (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  ).toString();

  const rand = new Rand(seed + "abilities");
  const randomValue = rand.next();

  // Rotación aleatoria completa (0 a 359 grados)
  const rotation = Math.floor(randomValue * 360);

  // Espejado horizontal aleatorio (50% de probabilidad)
  const scaleX = randomValue > 0.5 ? -1 : 1;

  // Calculamos el zoom actual reduciéndolo según los intentos fallidos
  const currentZoom = Math.max(
    VISUAL_CONFIG.MIN_ZOOM,
    VISUAL_CONFIG.MAX_ZOOM - attempts * VISUAL_CONFIG.ZOOM_DECREASE_PER_GUESS,
  );

  const positionX = Math.floor(randomValue * 100);
  const positionY = Math.floor(randomValue * 100);

  return {
    backgroundImage: `url(${targetImage})`,
    backgroundSize: `${currentZoom * 100}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
    transform: `rotate(${rotation}deg) scaleX(${scaleX})`,
    transition: "all 0.8s ease-in-out",
  };
};
