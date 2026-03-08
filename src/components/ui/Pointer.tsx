import { Leaderboard } from "@components/ui/Leaderboard";
import { RemovePlayerName } from "@auth/index";

interface PointerProps {
  className?: string;
  playerName: string | null;
  score: number;
  gameId: string;
  pointsName?: string;
  isDaily?: boolean;
  ascending?: boolean;
}

export default function Pointer({
  className = "",
  playerName,
  score,
  gameId,
  pointsName = "Puntos",
  isDaily = false,
  ascending = false,
}: PointerProps) {
  return (
    <div
      className={`grid grid-cols-3 items-center w-full max-w-xl p-2 px-8 mx-auto ${className}`}
    >
      <div className="flex justify-start">
        <span className="font-bold">{playerName}</span>
        <RemovePlayerName />
      </div>
      <div className="text-center">
        {pointsName}: <span className="font-bold">{score}</span>
      </div>
      <div className="flex justify-end">
        <Leaderboard
          gameId={gameId}
          isDaily={isDaily}
          ascending={ascending}
          pointsName={pointsName}
        />
      </div>
    </div>
  );
}
