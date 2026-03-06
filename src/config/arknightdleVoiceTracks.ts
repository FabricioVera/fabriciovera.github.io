export interface VoiceTrackConfig {
  label: string;
  num: string;
  reqGuesses: number;
}

export const GAME_VOICE_TRACKS: VoiceTrackConfig[] = [
  { label: "Arknights", num: "35", reqGuesses: 0 },
  { label: "In Battle", num: "23", reqGuesses: 2 },
  { label: "Talk", num: "01", reqGuesses: 5 },
  { label: "Recruit", num: "11", reqGuesses: 10 },
];
