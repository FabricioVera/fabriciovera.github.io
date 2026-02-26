import { Leaderboard } from "@components/ui/Leaderboard";
import { RemovePlayerName } from "@auth/index";

export default function Pointer({
  playerName,
  score,
  gameId,
  pointsName = "Puntos",
  isDaily = false,
  ascending = false,
}: {
  playerName: string | null;
  score: number;
  gameId: string;
  pointsName?: string;
  isDaily?: boolean;
  ascending?: boolean;
}) {
  return (
    <div className="flex w-[80%] justify-evenly items-center bg-primary p-4 rounded-xl shadow border border-accent text-text-primary mx-auto">
      <div className="hidden sm:block">
        Jugador: <span className="text-white font-bold">{playerName}</span>
        <RemovePlayerName />
      </div>
      <div className="text-center">
        {pointsName}: <span className="text-white font-bold">{score}</span>
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
