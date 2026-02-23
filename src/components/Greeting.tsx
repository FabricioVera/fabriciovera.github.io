import { useStore } from "@nanostores/react";
import { $playerName } from "@store/playerStore";
import { RemovePlayerName } from "@auth/index";

export default function Greeting() {
  const playerName = useStore($playerName);
  return (
    <h1 className="text-2xl text-center font-bold text-white mb-4">
      Bienvenido {playerName}
      <RemovePlayerName />, ¡elige un juego!
    </h1>
  );
}
