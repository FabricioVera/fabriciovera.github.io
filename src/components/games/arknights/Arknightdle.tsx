import React from "react";
import { useRandomOperator } from "./hooks/useRandomOperator";

/**
 * Componente funcional de React que muestra el nombre de un operador aleatorio.
 *
 * @returns {JSX.Element} El árbol de elementos React a renderizar.
 * @sideEffects Invoca el hook `useRandomOperator`, lo cual suscribe el componente a cambios de estado.
 */
export const RandomOperator: React.FC = () => {
  const { randomName, isLoading, error, pickRandom } = useRandomOperator();

  if (isLoading) {
    return <div style={styles.container}>Cargando datos desde la API...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Operador Aleatorio:</h2>
      <h1 style={styles.name}>
        {randomName || "No se encontraron operadores"}
      </h1>
      <button onClick={pickRandom} style={styles.button}>
        Obtener otro Operador
      </button>
    </div>
  );
};

// Estilos básicos en línea para mantener el componente autocontenido
const styles = {
  container: {
    padding: "2rem",
    textAlign: "center" as const,
    fontFamily: "sans-serif",
    backgroundColor: "#f4f4f5",
    borderRadius: "8px",
    maxWidth: "400px",
    margin: "2rem auto",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  name: {
    color: "#2563eb",
    fontSize: "2rem",
    margin: "1rem 0",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  error: {
    color: "#dc2626",
    padding: "1rem",
    border: "1px solid #f87171",
    backgroundColor: "#fef2f2",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
};
