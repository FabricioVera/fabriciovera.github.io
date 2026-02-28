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
  className = "bg-primary border-accent text-white",
  playerName,
  score,
  gameId,
  pointsName = "Puntos",
  isDaily = false,
  ascending = false,
}: PointerProps) {
  return (
    <div
      className={`flex w-full justify-evenly items-center p-4 rounded-xl shadow border mx-auto ${className}`}
    >
      <div className="hidden sm:block">
        <span className="font-bold">{playerName}</span>
        <RemovePlayerName />
      </div>
      <div className="text-center">
        {pointsName}: <span className="font-bold">{score}</span>
      </div>

      <Leaderboard
        gameId={gameId}
        isDaily={isDaily}
        ascending={ascending}
        pointsName={pointsName}
      />
    </div>
  );
}
