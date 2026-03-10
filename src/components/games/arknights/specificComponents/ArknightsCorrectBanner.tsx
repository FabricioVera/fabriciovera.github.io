import { HexagonIcon } from "../../../Icons";

import { motion, type Variants } from "framer-motion";

interface MissionStarProps {
  isActive: boolean;
}
const starVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, translateY: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    translateY: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};
export function MissionStar({ isActive }: MissionStarProps) {
  const colorClass = isActive ? "text-blue-300/80" : "text-gray-700";
  const gradientClass = isActive
    ? "bg-gradient-to-b from-transparent via-current/20 to-transparent"
    : "";
  return (
    <motion.div
      variants={starVariants}
      className={`relative inline-flex items-center justify-center ${colorClass}`}
    >
      <div
        className={`absolute z-0 w-[90%] h-[160%] pointer-events-none ${gradientClass}`}
      />
      <div className="relative z-10">
        <HexagonIcon size={40} />
      </div>
    </motion.div>
  );
}

interface StarsContainerProps {
  stars: number;
}
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.4, // Espera a que el texto empiece a aparecer
      staggerChildren: 0.2, // Delay de 0.2s entre cada estrella
    },
  },
};
export function MissionStarsContainer({ stars }: StarsContainerProps) {
  const maxStars = [1, 2, 3];
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-row gap-2 mt-4"
    >
      {maxStars.map((index) => (
        <MissionStar key={index} isActive={stars >= index} />
      ))}
    </motion.div>
  );
}

interface Props {
  imageURL: string;
  name: string;
  stars: 0 | 1 | 2 | 3;
}
const SHADOW_TEXT = "drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]";
export function ArknightsCorrectBanner({ imageURL, name, stars }: Props) {
  const isSuccess = stars > 0;
  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-lg">
      <motion.img
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-contain object-right"
        src={imageURL}
        alt={`Respuesta correcta: ${name}`}
        loading="lazy"
      />
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="absolute top-8 left-8 z-20 w-full max-w-[60%] flex flex-col justify-center pointer-events-none whitespace-pre-wrap"
      >
        <h2
          className={`text-lg md:text-xl font-semibold ${SHADOW_TEXT} ${
            isSuccess ? "text-white" : "text-red-600"
          }`}
        >
          {isSuccess ? "Operation Complete" : "Operation Failed"}
        </h2>
        <h1
          className="text-4xl md:text-5xl font-black text-white drop-shadow-[1px_3px_3px_rgba(0,0,0,0.8)] mt-1"
          style={{ WebkitTextStroke: "1px rgba(0, 0, 0, 0.5)" }}
        >
          {name}
        </h1>

        <h2
          className={`text-xl md:text-2xl font-semibold text-white mt-4 ${SHADOW_TEXT}`}
        >
          Mission Results
        </h2>
        <MissionStarsContainer stars={stars} />
      </motion.div>
    </div>
  );
}
