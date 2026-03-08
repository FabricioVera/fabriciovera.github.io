import { motion } from "framer-motion";
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
    <div className="flex w-fit justify-center gap-1 p-1 mx-auto bg-primary backdrop-blur-md rounded-lg border border-accent/30">
      {gameModeCONF.map((config, index) => {
        const isActive = config.gameModeName === actualGameMode;

        return (
          <button
            key={config.gameModeName}
            onClick={config.gameModeHook}
            className={`relative px-4 py-2 rounded-md font-bold transition-colors ${
              isActive ? "text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeGameModeBckgrnd"
                className="absolute inset-0 bg-accent rounded-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {config.gameModeLabel || config.gameModeName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
