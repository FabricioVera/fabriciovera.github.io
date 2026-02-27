import { motion, AnimatePresence } from "framer-motion";

interface HeroInputProps {
  className?: string;
  itemName?: string;
  thumbnailUrl: string | undefined;
  fallbackImage?: string;
  selectDirection: number;
  isDefault?: boolean;
}

export default function HeroInput({
  className,
  itemName = "default",
  thumbnailUrl,
  fallbackImage,
  selectDirection,
  isDefault = false,
}: HeroInputProps) {
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

  const bgVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <section
      className={`relative w-auto ${isDefault ? "h-20" : "h-[25vh] md:h-[35vh]"} flex justify-center mb-2 min-w-3xs aspect-square`}
    >
      <AnimatePresence custom={selectDirection}>
        <motion.div
          key={itemName}
          className="absolute inset-0 flex items-end justify-center w-full h-full"
        >
          {false && (
            <div className="absolute inset-0 bg-linear-to-t from-red-500/30 via-white/20 to-transparent rounded-2xl" />
          )}

          {thumbnailUrl && !isDefault && (
            <motion.img
              variants={bgVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
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
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className={`relative bottom-5 z-10 text-2xl md:text-4xl font-bold text-center px-4 drop-shadow-lg tracking-wider transition-colors duration-300 ${
              isDefault
                ? "bg-linear-to-r from-accent to-accent2 bg-clip-text text-transparent"
                : "text-white css-3d-text"
            }`}
          >
            {itemName}
          </motion.h1>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
