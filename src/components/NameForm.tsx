import { useStore } from "@nanostores/react";
import { $playerName } from "@store/playerStore";
import RemovePlayerName from "./common/RemovePlayerName";

export default function NameForm() {
  const playerName = useStore($playerName);

  if (playerName)
    return (
      <h1 className="text-2xl text-center font-bold text-white mb-4">
        Bienvenido {playerName}
        <RemovePlayerName />, elije un juego!
      </h1>
    );
  else {
    return (
      <div className="max-w-md mx-auto p-8 bg-primary rounded-xl shadow-lg mt-10 my-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          ¿Quién está jugando?
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            if (name.trim()) $playerName.set(name.trim());
          }}
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Ingresa tu nombre o apodo"
            className="w-full p-3 rounded bg-secondary text-white border border-accent focus:outline-none focus:border-accent2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent2 text-white font-bold py-3 rounded transition-colors"
          >
            Comenzar a Jugar
          </button>
        </form>
      </div>
    );
  }
}
