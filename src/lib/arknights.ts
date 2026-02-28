import type { OperatorDTO } from "src/types/index";
import { logger } from "@services/logger";

const API_ARKNIGHTS = "https://awedtan.ca/api/";

/**
 * Obtiene la lista completa de operadores desde la API remota.
 *
 * @returns {Promise<OperatorResponse[]>} Promesa que resuelve con el array de operadores.
 * @throws {Error} Lanza un error si la respuesta de red no es exitosa (ej. 404, 500).
 * @sideEffects Realiza una petición HTTP (fetch) al endpoint externo de Arknights.
 */
export const fetchOperators = async (): Promise<OperatorDTO[]> => {
  const response = await fetch(API_ARKNIGHTS + "operator?include=data.name");

  if (!response.ok) {
    logger.error(
      `Error en la petición: ${response.status} ${response.statusText}`,
    );
  }

  const data: OperatorDTO[] = await response.json();
  return data;
};
