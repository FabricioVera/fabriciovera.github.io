import { motion, AnimatePresence } from "framer-motion";

interface HeroInputProps {
  itemName: string;
  thumbnailUrl: string | undefined;
  selectDirection: number;
}

export default function HeroInput({
  itemName,
  thumbnailUrl,
  selectDirection,
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
  if (!itemName) {
    return;
  }

  return (
    <section className="relative w-auto h-[40vh] md:h-[50vh] flex items-end justify-center overflow-hidden rounded-2xl shadow-lg mb-5 bg-sidebar min-w-[300px]">
      {/* AnimatePresence gestiona el desmontaje de los componentes (exit) */}
      <AnimatePresence mode="wait" custom={selectDirection}>
        {/* Usamos itemName como key para que Framer sepa cuándo desmontar y montar */}
        <motion.div
          key={itemName}
          className="absolute inset-0 flex items-end justify-center w-full h-full"
        >
          {thumbnailUrl && (
            <motion.img
              variants={bgVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full object-cover brightness-75 mask-fade-bottom"
              src={thumbnailUrl}
              alt={itemName}
            />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <motion.h1
            custom={selectDirection}
            variants={h1Variants}
            initial="initial"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="relative z-10 text-4xl md:text-6xl font-bold text-white drop-shadow-lg text-center px-4 pb-12 css-3d-text"
          >
            {itemName}
          </motion.h1>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
