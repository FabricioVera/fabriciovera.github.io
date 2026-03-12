import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import { motion } from "framer-motion";
import Button from "@components/ui/General/Button";
import { logger } from "@services/logger";
import {
  GAME_VOICE_TRACKS,
  type VoiceTrackConfig,
} from "src/config/arknightdleVoiceTracks";
import type { GameStatus } from "../../../types/game";
import { AudioIcon, MuteIcon } from "../../Icons";

const cleanName = (name: string): string => {
  return name.replace(new RegExp("[ ]", "g"), "_");
};
const generateAudioNumber = (): string => {
  return Math.floor(Math.random() * 39)
    .toString()
    .padStart(2, "0");
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export const InputRange = ({ className, ...props }: InputProps) => {
  const val = Number(props.value) || 0;
  const max = Number(props.max) || 1; // Evitamos dividir por 0 si no hay max
  const percentage = (val / max) * 100;
  return (
    <input
      type="range"
      {...props}
      className={`
        appearance-none cursor-pointer outline-none 
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0
        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:border-0
        ${className || ""}
      `}
      style={{
        ...props.style,
        background: `linear-gradient(to right, #e5e7eb ${percentage}%, #374151 ${percentage}%)`,
      }}
    />
  );
};

export const AudioControl = ({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) => {
  const formatTime = (time: number) => {
    if (time == null) return "No Time :(";
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
      <InputRange
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full h-1.5"
      />
    </div>
  );
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

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setAudioNum(initialAudioNum);
    setStatus("loading");
    setIsPlaying(false);
    setCurrentTime(0);
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="flex flex-row justify-around items-center gap-2 w-full">
      <AnimatedPlayButton isPlaying={isPlaying} onClick={togglePlay} />
      <div className="flex flex-row w-[70%] gap-4">
        <AudioControl
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
        <div className="flex flex-row items-center gap-2 text-gray-400">
          {volume > 0 ? <AudioIcon /> : <MuteIcon />}
          <InputRange
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-4 h-20"
          />
          <span className="text-sm">{Math.round(volume * 100)}%</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        onCanPlayThrough={handleCanPlay}
        onError={handleError}
        onEnded={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
};

interface MultiVoiceProps {
  gameStatus: GameStatus;
  targetName: string;
  guessesCount: number;
  tracks?: VoiceTrackConfig[];
}

/**
 * Selector de pistas. P: props(MultiVoiceProps). R: JSX.
 * Efectos: Cambia estado activo. Excepciones: Ninguna.
 */
export default function MultiVoicePlayer({
  gameStatus,
  targetName,
  guessesCount,
  tracks = GAME_VOICE_TRACKS,
}: MultiVoiceProps) {
  const [activeTrack, setActiveTrack] = useState<string>(tracks[0].num);
  useEffect(() => {
    setActiveTrack(tracks[0].num);
  }, [targetName, tracks]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm p-2 bg-primary/20 backdrop-blur-2xl border border-secondary rounded-2xl ">
      <div className="flex gap-2 w-full justify-center">
        {tracks.map((track) => {
          const isUnlocked =
            guessesCount >= track.reqGuesses || gameStatus !== "playing";
          const isActive = activeTrack === track.num;
          return (
            <button
              key={track.num}
              disabled={!isUnlocked}
              onClick={() => setActiveTrack(track.num)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                !isUnlocked
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : isActive
                    ? "bg-accent text-primary"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {isUnlocked
                ? track.label
                : `${track.label} (${track.reqGuesses - guessesCount})`}
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
