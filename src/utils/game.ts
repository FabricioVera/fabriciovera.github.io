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
import { useMemo } from "react";
import type { GameStatus } from "src/types/game";

/**
 * Genera un número pseudoaleatorio determinista basado en una semilla de texto.
 * Esto asegura que en el modo diario todos los jugadores vean la misma rotación/espejado.
 * * @param {string} seed - Semilla textual para inicializar el generador.
 * @returns {number} Valor decimal pseudoaleatorio entre 0 y 1.
 */
const generateSeededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  }
  return (Math.sin(hash) + 1) / 2;
};

/**
 * Configuración estática para los límites de las transformaciones visuales.
 */
const VISUAL_CONFIG = {
  MAX_ZOOM: 3.5,
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
  attempts: number,
  status: GameStatus | string,
): React.CSSProperties => {
  return useMemo(() => {
    // Si el juego terminó, revelamos la imagen original sin alteraciones.
    if (status !== "playing") {
      return {
        transform: "scale(1) rotate(0deg) scaleX(1)",
        transition: "transform 0.8s ease-in-out",
      };
    }

    // Generamos valores pseudoaleatorios consistentes para la habilidad actual
    const randomRotationSeed = generateSeededRandom(targetId);
    const randomMirrorSeed = generateSeededRandom(targetId + "_mirror");

    // Rotación aleatoria completa (0 a 359 grados)
    const rotation = Math.floor(randomRotationSeed * 360);

    // Espejado horizontal aleatorio (50% de probabilidad)
    const scaleX = randomMirrorSeed > 0.5 ? -1 : 1;

    // Calculamos el zoom actual reduciéndolo según los intentos fallidos
    const currentZoom = Math.max(
      VISUAL_CONFIG.MIN_ZOOM,
      VISUAL_CONFIG.MAX_ZOOM - attempts * VISUAL_CONFIG.ZOOM_DECREASE_PER_GUESS,
    );

    return {
      transform: `scale(${currentZoom}) rotate(${rotation}deg) scaleX(${scaleX})`,
      transition: "transform 0.5s ease-in-out",
    };
  }, [targetId, attempts, status]);
};
