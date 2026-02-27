import { useState, useEffect, useCallback } from "react";
import { fetchOperators } from "@lib/arknights";
import type { OperatorDTO } from "src/types/index";

/**
 * Hook personalizado para cargar operadores y seleccionar uno aleatoriamente.
 *
 * @returns {{
 * randomName: string | null,
 * isLoading: boolean,
 * error: string | null,
 * pickRandom: () => void
 * }} Objeto que contiene el nombre seleccionado, estados de carga/error, y la función para elegir otro.
 * @sideEffects Ejecuta `fetchOperators` al montarse el componente (dispara actualización de estado de React).
 */
export const useRandomOperator = () => {
  const [operators, setOperators] = useState<OperatorDTO[]>([]);
  const [randomName, setRandomName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Selecciona un operador al azar del array almacenado en el estado
   * y actualiza el estado `randomName`.
   *
   * @returns {void} No retorna ningún valor.
   * @sideEffects Actualiza el estado `randomName` de React.
   */
  const pickRandom = useCallback(() => {
    if (operators.length === 0) return;
    const randomIndex = Math.floor(Math.random() * operators.length);
    setRandomName(operators[randomIndex].value.data.name);
  }, [operators]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOperators();
        if (isMounted) {
          setOperators(data);
          // Seleccionamos uno inicial al terminar la carga
          const randomIndex = Math.floor(Math.random() * data.length);
          setRandomName(data[randomIndex].value.data.name);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Error desconocido al cargar datos",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { randomName, isLoading, error, pickRandom };
};
