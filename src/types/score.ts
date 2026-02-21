export interface ScoreEntry {
  id: string;
  game_id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export interface IScoreRepository {
  saveScore(entry: Omit<ScoreEntry, "id" | "created_at">): Promise<void>;
  getTopScores(gameId: string, limit?: number): Promise<ScoreEntry[]>;
}
