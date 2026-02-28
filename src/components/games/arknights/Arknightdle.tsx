import React from "react";
import { useRandomOperator } from "./hooks/useRandomOperator";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  const { randomName, isLoading, error, pickRandom } = useRandomOperator();

  if (isLoading) {
    return <div>Cargando datos desde la API...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Operador Aleatorio:</h2>
      <h1>{randomName || "No se encontraron operadores"}</h1>
      <button onClick={pickRandom}>Obtener otro Operador</button>
    </div>
  );
}
