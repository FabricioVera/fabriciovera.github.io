import { Leaderboard } from "@components/index";
import { RemovePlayerName } from "@auth/index";

export default function Pointer({
  playerName,
  score,
  gameId,
}: {
  playerName: string | null;
  score: number;
  gameId: string;
}) {
  return (
    <div className="flex w-[80%] justify-evenly items-center bg-primary p-4 rounded-xl shadow border border-accent text-text-primary mx-auto">
      <div className="hidden sm:block">
        Jugador: <span className="text-white font-bold">{playerName}</span>
        <RemovePlayerName />
      </div>
      <div className="text-center">
        Puntos: <span className="text-white font-bold">{score}</span>
      </div>

      <Leaderboard gameId={gameId} />
    </div>
  );
}
