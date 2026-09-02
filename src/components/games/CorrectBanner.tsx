import type { GameStatus } from "@types/game";

interface CorrectBannerProps {
  imageURL: string;
  name: string;
  status?: GameStatus;
}

export default function CorrectBanner({
  imageURL,
  name,
  status = "won",
}: CorrectBannerProps) {
  const isWon = status === "won";

  return (
    <div
      className={`relative w-full h-[35vh] overflow-hidden rounded-2xl border-2 transition-all ${
        isWon
          ? "border-success shadow-[0_0_30px_rgba(74,222,128,0.5)]"
          : "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
      }`}
    >
      <img
        className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out"
        src={imageURL}
        alt={`Respuesta: ${name}`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-4 w-full flex flex-col items-center justify-center pointer-events-none z-20 px-2 text-center">
        <span
          className={`text-sm md:text-base font-bold uppercase tracking-wider ${
            isWon ? "text-green-400" : "text-red-400"
          }`}
        >
          {isWon ? "¡Misión Cumplida!" : "Misión Fallida — La respuesta era"}
        </span>
        <h1
          className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${
            isWon
              ? "bg-linear-to-b from-white to-green-300"
              : "bg-linear-to-b from-white to-red-400"
          }`}
          style={{
            WebkitTextStroke: isWon
              ? "1px rgba(0, 50, 0, 0.5)"
              : "1px rgba(50, 0, 0, 0.5)",
          }}
        >
          {name}!
        </h1>
      </div>
    </div>
  );
}
