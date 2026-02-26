import { atom } from "nanostores";
import { logger } from "../services/logger";

const STORAGE_KEY = "playerName";

/**
 * busca en local el nombre de usuario
 * @returns nombre de usuario o null
 */
const getInitialPlayer = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    logger.info("Obteniendo el nombre de usuario");
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    logger.error(
      "El acceso a localStorage está bloqueado en este navegador. ",
      error,
    );
    return null;
  }
};

export const $playerName = atom<string | null>(getInitialPlayer());

$playerName.listen((newName) => {
  if (typeof window === "undefined") return;

  try {
    if (newName) {
      logger.info("Guardando nuevo nombre de usuario: ", { newName: newName });
      localStorage.setItem(STORAGE_KEY, newName);
    } else {
      logger.info("Eliminando nombre de usuario...");
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    logger.error("No se pudo guardar el progreso en localStorage.", error);
  }
});
