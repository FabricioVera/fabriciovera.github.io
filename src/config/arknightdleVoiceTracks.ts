export interface VoiceTrackConfig {
  label: string;
  num: string;
  reqGuesses: number;
}

export const GAME_VOICE_TRACKS: VoiceTrackConfig[] = [
  { label: "Audio 1", num: "35", reqGuesses: 0 },
  { label: "Audio 2", num: "21", reqGuesses: 5 },
  { label: "Audio 3", num: "01", reqGuesses: 10 },
];
