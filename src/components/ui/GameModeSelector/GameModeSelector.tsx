export interface GameModeCONF {
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
    <div className="flex w-fit justify-center gap-4 p-2 mx-auto bg-primary/30 rounded-lg border border-secondary">
      {gameModeCONF.map((config) => (
        <button
          onClick={config.gameModeHook}
          className={`px-4 py-2 rounded-md font-bold transition-colors ${config.gameModeName === actualGameMode ? "bg-accent text-white" : "text-gray-400 hover:text-white"}`}
        >
          {config.gameModeName}
        </button>
      ))}
    </div>
  );
}
