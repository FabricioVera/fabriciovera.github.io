import { atom } from "nanostores";

// Intentamos recuperar el nombre del localStorage si estamos en el cliente
const initialName =
  typeof window !== "undefined" ? localStorage.getItem("playerName") : null;

export const $playerName = atom<string | null>(initialName);

// Escuchamos cambios para guardarlos automáticamente en el navegador
$playerName.listen((newName) => {
  if (newName && typeof window !== "undefined") {
    localStorage.setItem("playerName", newName);
  }
});
