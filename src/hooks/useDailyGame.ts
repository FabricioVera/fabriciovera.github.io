// src/hooks/useDailyGame.ts
import { useState, useCallback, useEffect } from "react";
import type { Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { logger } from "@services/logger";

/**
 * @description Hook base que gestiona el estado central de cualquier minijuego diario,
 * manejando la persistencia en el almacenamiento local y la transición entre modos de juego.
 * * @param {string} gameId - Identificador único del juego (ej: 'warframes', 'abilitydle') para aislar su almacenamiento.
 * @param {Warframe[]} warframes - Lista formateada de Warframes disponibles para hidratar los intentos guardados.
 * * @returns {Object} Objeto con el estado del juego y funciones para manipularlo.
 * @returns {GameMode} return.gameMode - Modo de juego actual ("daily" o "random").
 * @returns {Warframe[]} return.guesses - Lista de intentos realizados por el jugador.
 * @returns {Function} return.setGuesses - Mutador para actualizar la lista de intentos.
 * @returns {GameStatus} return.status - Estado actual de la partida ("playing", "won", "lost").
 * @returns {Function} return.setStatus - Mutador para actualizar el estado de la partida.
 * @returns {Function} return.startDailyMode - Función para iniciar o reiniciar el modo diario cargando el progreso.
 * @returns {Function} return.startRandomMode - Función para iniciar el modo aleatorio en blanco.
 * * @throws {Error} No lanza excepciones directas, pero captura y registra errores de parseo del localStorage mediante el logger.
 */
export function useDailyGame(gameId: string, warframes: Warframe[]) {
  const [gameMode, setGameMode] = useState<"daily" | "random">("daily");
  const [guesses, setGuesses] = useState<Warframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");

  const initializeDailyMode = useCallback(() => {
    try {
      const savedState = loadDailyProgress(gameId);

      if (savedState) {
        const rehydratedGuesses = savedState.guesses
          .map((name: string) => warframes.find((w) => w.name === name))
          .filter(Boolean) as Warframe[];

        logger.info(`Estado diario cargado exitosamente para ${gameId}`, {
          intentos: rehydratedGuesses.length,
          status: savedState.status,
        });

        setGuesses(rehydratedGuesses);
        setStatus(savedState.status);
      } else {
        setGuesses([]);
        setStatus("playing");
      }
    } catch (error) {
      logger.error(`Error al inicializar el modo diario en ${gameId}`, error);
      setGuesses([]);
      setStatus("playing");
    }
  }, [gameId, warframes]);

  // Hidratación inicial
  useEffect(() => {
    if (warframes.length > 0) {
      initializeDailyMode();
    }
  }, [initializeDailyMode, warframes.length]);

  // Persistencia automática
  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(gameId, guesses, status);
    }
  }, [gameId, guesses, status, gameMode]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    initializeDailyMode();
  }, [initializeDailyMode]);

  const startRandomMode = useCallback(() => {
    setGameMode("random");
    setGuesses([]);
    setStatus("playing");
  }, []);

  return {
    gameMode,
    guesses,
    status,
    setGuesses,
    setStatus,
    startDailyMode,
    startRandomMode,
  };
}
