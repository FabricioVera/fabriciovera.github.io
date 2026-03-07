import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import Button from "@components/ui/General/Button";
import { logger } from "@services/logger";
import {
  GAME_VOICE_TRACKS,
  type VoiceTrackConfig,
} from "src/config/arknightdleVoiceTracks";

/**
 * Limpia el nombre. P: name(string). R: string (limpio).
 * Efectos: Reemplaza espacios. Excepciones: Ninguna.
 */
const cleanName = (name: string): string => {
  return name.replace(new RegExp("[ ]", "g"), "_");
};

/**
 * Genera ID de audio. P: Ninguno. R: string.
 * Efectos: Usa Math.random. Excepciones: Ninguna.
 */
const generateAudioNumber = (): string => {
  return Math.floor(Math.random() * 39)
    .toString()
    .padStart(2, "0");
};

const playPath = "M 19 12 L 8 19 V 5 Z L 8 5";
const pausePath = "M5 6 5 10 19 10 19 6 5 6ZM5 14 5 18 19 18 19 14 5 14Z";

interface AnimatedButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

/**
 * Botón animado. P: props(AnimatedButtonProps). R: JSX.
 * Efectos: Anima SVG. Excepciones: Ninguna.
 */
const AnimatedPlayButton = ({ isPlaying, onClick }: AnimatedButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="relative w-12 h-12 flex justify-center items-center rounded-full"
      aria-label={isPlaying ? "Pausar" : "Reproducir"}
    >
      <motion.svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        initial={false}
        animate={{ rotate: isPlaying ? -90 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.path
          d={isPlaying ? pausePath : playPath}
          initial={false}
          animate={{ d: isPlaying ? pausePath : playPath }}
          transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.svg>
    </Button>
  );
};

interface SingleVoiceProps {
  targetName: string;
  initialAudioNum: string;
}

/**
 * Reproductor base. P: props(SingleVoiceProps). R: JSX.
 * Efectos: Muta HTMLAudioElement. Exc: Falla de red en carga.
 */
const SingleVoicePlayer = ({
  targetName,
  initialAudioNum,
}: SingleVoiceProps) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [audioNum, setAudioNum] = useState<string>(initialAudioNum);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setAudioNum(initialAudioNum);
    setStatus("loading");
    setIsPlaying(false);
  }, [initialAudioNum]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = `https://arknights.wiki.gg/images/${cleanName(targetName)}-0${audioNum}.ogg`;
    audioRef.current.volume = volume;
  }, [audioNum, targetName, volume]);

  const handleCanPlay = () => setStatus("ready");

  const handleError = () => {
    logger.warn(`Audio ${audioNum} no existe, recalculando...`);
    setAudioNum(generateAudioNumber());
  };

  const togglePlay = () => {
    if (!audioRef.current || status !== "ready") return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="flex flex-row justify-center items-center gap-2 w-full">
      <div className="w-24">
        <AnimatedPlayButton isPlaying={isPlaying} onClick={togglePlay} />
      </div>
      <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={handleVolumeChange}
        className="w-full text-accent accent-current"
      />
      <audio
        ref={audioRef}
        preload="metadata"
        onCanPlayThrough={handleCanPlay}
        onError={handleError}
        onEnded={togglePlay}
      />
    </div>
  );
};

interface MultiVoiceProps {
  targetName: string;
  guessesCount: number;
  tracks?: VoiceTrackConfig[];
}

/**
 * Selector de pistas. P: props(MultiVoiceProps). R: JSX.
 * Efectos: Cambia estado activo. Excepciones: Ninguna.
 */
export default function MultiVoicePlayer({
  targetName,
  guessesCount,
  tracks = GAME_VOICE_TRACKS,
}: MultiVoiceProps) {
  const [activeTrack, setActiveTrack] = useState<string>(tracks[0].num);
  useEffect(() => {
    setActiveTrack(tracks[0].num);
  }, [targetName, tracks]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex gap-2 w-full justify-center">
        {tracks.map((track) => {
          const isUnlocked = guessesCount >= track.reqGuesses;
          const isActive = activeTrack === track.num;
          return (
            <button
              key={track.num}
              disabled={!isUnlocked}
              onClick={() => setActiveTrack(track.num)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                !isUnlocked
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : isActive
                    ? "bg-accent text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {isUnlocked
                ? track.label
                : `${track.label} (${track.reqGuesses})`}
            </button>
          );
        })}
      </div>
      <SingleVoicePlayer
        targetName={targetName}
        initialAudioNum={activeTrack}
      />
    </div>
  );
}
