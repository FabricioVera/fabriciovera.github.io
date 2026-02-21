import { $playerName } from "../../store/playerStore";

export default function RemovePlayerName() {
  return (
    <button
      className="w-4 h-4 top-0 left-0 cursor-pointer font-bold"
      onClick={() => $playerName.set("")}
      title="Cambiar nombre"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    </button>
  );
}
