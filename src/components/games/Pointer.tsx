import { Leaderboard } from "@components/index";

export default function Pointer({
  playerName,
  score,
}: {
  playerName: string;
  score: number;
}) {
  return (
    <div className="flex w-[80%] justify-evenly items-center bg-primary p-4 rounded-xl shadow border border-accent text-gray-300 mx-auto">
      <div className="hidden sm:block">
        Jugador: <span className="text-white font-bold">{playerName}</span>
      </div>
      <div className="text-center">
        Puntos: <span className="text-accent font-bold">{score}</span>
      </div>

      <Leaderboard gameId="guess-mbti" />
    </div>
  );
}
