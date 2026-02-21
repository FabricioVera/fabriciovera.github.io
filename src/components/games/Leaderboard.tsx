import { useState, useEffect, useCallback } from "react";
import { getTopScores } from "../../services/scoreRepository";
import type { ScoreEntry } from "src/types/score";

interface LeaderboardProps {
  gameId: string;
}

export function Leaderboard({ gameId }: LeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchScores = useCallback(async () => {
    setIsLoading(true);
    try {
      const topScores = await getTopScores(gameId);
      setScores(topScores);
    } catch (error) {
      console.error("Error cargando puntajes", error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  // Bloquear el scroll del body cuando el panel está abierto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón Discreto en la UI */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent2 rounded-lg transition-colors border border-accent/30 font-medium text-sm"
        aria-label="Ver Ranking"
      >
        Ranking
      </button>

      {/* Overlay oscuro para enfocar el panel */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel Lateral Deslizante */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-primary border-l border-secondary shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-secondary">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Top 10
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent2"></div>
            </div>
          ) : scores.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              Aún no hay puntajes registrados. ¡Sé el primero!
            </p>
          ) : (
            <ul className="space-y-3">
              {scores.map((entry, index) => (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? "bg-primary/10 border-primary/30" : index === 1 ? "bg-secondary/10 border-secondary/30" : index === 2 ? "bg-accent2/10 border-accent2/30" : "bg-primary border-secondary"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold w-6 text-center ${index < 3 ? "text-lg" : "text-gray-500"}`}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : `${index + 1}.`}
                    </span>
                    <span
                      className="text-white font-medium truncate max-w-30"
                      title={entry.player_name}
                    >
                      {entry.player_name}
                    </span>
                  </div>
                  <span className="font-bold text-accent2">
                    {entry.score} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
