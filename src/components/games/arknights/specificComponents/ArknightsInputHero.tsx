import { motion, AnimatePresence } from "framer-motion";
import { useAutocompleteStore } from "../ArknightsStore/useAutocompleteStorage";

interface HeroInputProps {
  className?: string;
  fallbackImage?: string;
  isDefault?: boolean;
}

export default function ArknightsHeroInput({
  className,
  fallbackImage,
  isDefault = false,
}: HeroInputProps) {
  const { filteredSuggestions, selectedSuggestionIndex, selectDirection } =
    useAutocompleteStore();

  const h1Variants = {
    initial: (selectDirection: number) => ({
      y: selectDirection > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (selectDirection: number) => ({
      y: selectDirection > 0 ? -40 : 40,
      opacity: 0,
    }),
  };
  const currentSelection =
    selectedSuggestionIndex >= 0
      ? filteredSuggestions[selectedSuggestionIndex]
      : null;

  if (!currentSelection) {
    return <div className="h-[25vh] md:h-[35vh]"></div>;
  }

  const itemName = isDefault ? "default" : currentSelection?.name;
  const thumbnailUrl = currentSelection?.imageURL;

  return (
    <section
      className={`relative w-auto ${isDefault ? "h-[25vh]" : "h-[25vh] md:h-[35vh]"} flex justify-center min-w-3xs aspect-square`}
    >
      <AnimatePresence custom={selectDirection}>
        <motion.div
          key={itemName}
          className="absolute inset-0 flex items-end justify-center w-full h-full"
        >
          {thumbnailUrl && !isDefault && (
            <motion.img
              custom={selectDirection}
              variants={h1Variants}
              initial="initial"
              animate="center"
              exit="exit"
              transition={{
                ease: [0.25, 0.8, 0.25, 1],
                duration: 0.4,
              }}
              className={` absolute inset-0 w-full h-full object-cover object-top ${className}`}
              src={thumbnailUrl || fallbackImage}
              alt=""
            />
          )}

          <motion.h1
            custom={selectDirection}
            variants={h1Variants}
            initial="initial"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.4,
              ease: "anticipate",
            }}
            className={`relative bottom-5 z-10 text-2xl md:text-4xl font-bold text-center px-4 drop-shadow-lg tracking-wider transition-colors duration-300 ${
              isDefault
                ? "bg-linear-to-r from-(--color-accent) via-accent2 to-(--highlight) bg-clip-text text-transparent drop-shadow-[0_0_20px_var(--color-accent)]"
                : "text-white drop-shadow-[0_0_15px_var(--color-accent)] css-3d-text"
            }`}
          >
            {itemName}
          </motion.h1>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
