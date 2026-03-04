import type { ReactElement } from "react";

export interface GameModeCONF {
  gameModeLabel?: ReactElement;
  gameModeName: string;
  gameModeHook: () => void;
}

export interface GameModeSelectorProps {
  gameModeCONF: GameModeCONF[];
  actualGameMode: string;
}

export default function GameModeSelector({
  gameModeCONF,
  actualGameMode,
}: GameModeSelectorProps) {
  return (
    <div className="flex w-fit justify-center gap-1 p-1 mx-auto bg-primary/60 backdrop-blur-md rounded-lg border border-accent/30">
      {gameModeCONF.map((config, index) => (
        <button
          key={config.gameModeName + "-" + index}
          onClick={config.gameModeHook}
          className={`px-4 py-2 rounded-md font-bold transition-colors ${config.gameModeName === actualGameMode ? "bg-accent text-black" : "text-gray-300 hover:text-white"}`}
        >
          {config.gameModeLabel || config.gameModeName}
        </button>
      ))}
    </div>
  );
}
