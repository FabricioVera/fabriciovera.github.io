import { $playerName } from "@store/playerStore";

export function RemovePlayerName() {
  return (
    <button
      className="w-4 h-4 top-0 left-0 cursor-pointer font-bold"
      onClick={() => $playerName.set(null)}
      title="Cambiar nombre"
    >
      <svg fill="none" viewBox="0 0 100 100" width="12" stroke="currentColor">
        <circle cx="50" cy="50" r="50" strokeWidth="10" />
        <line x1="30" y1="30" x2="70" y2="70" strokeWidth="10" />
        <line x1="70" y1="30" x2="30" y2="70" strokeWidth="10" />
      </svg>
    </button>
  );
}
