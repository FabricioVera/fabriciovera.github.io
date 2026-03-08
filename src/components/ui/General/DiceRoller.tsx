import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { D1Icon, D2Icon, D3Icon, D4Icon, D5Icon, D6Icon } from "../../Icons";
import Button from "./Button";

type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
const VALID_FACES: DiceValue[] = [1, 2, 3, 4, 5, 6];

export interface DiceIconProps {
  size?: number | string;
  color?: string;
}

interface DiceFaceProps extends DiceIconProps {
  value: DiceValue;
}

const DICE_MAP: Record<DiceValue, React.FC<DiceIconProps>> = {
  1: D1Icon,
  2: D2Icon,
  3: D3Icon,
  4: D4Icon,
  5: D5Icon,
  6: D6Icon,
};

const rollDice = (current: DiceValue): DiceValue => {
  const availableFaces = VALID_FACES.filter((face) => face !== current);
  return availableFaces[Math.floor(Math.random() * availableFaces.length)];
};

export const DiceFace: React.FC<DiceFaceProps> = ({ value, ...props }) => {
  const Icon = DICE_MAP[value] || D1Icon;
  return <Icon {...props} />;
};

interface DiceRollerProps {
  onRoll?: () => void;
}

export const DiceRollerButton: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [currentFace, setCurrentFace] = useState<DiceValue>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const handleRoll = useCallback(async () => {
    if (isRolling) return;
    setIsRolling(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setCurrentFace((prev) => rollDice(prev));
    setIsRolling(false);
    if (onRoll) onRoll();
  }, [isRolling, onRoll]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        handleRoll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRoll]);
  return (
    <Button
      onClick={handleRoll}
      aria-label="Lanzar dado"
      title="Rollear (ctrl + R)"
      className={` rounded-xl flex flex-col items-center shadow-lg outline-none overflow-hidden`}
    >
      <motion.div
        animate={isRolling ? { rotate: 90, scale: 0 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="text-accent2 flex items-center justify-center p-1"
      >
        <DiceFace value={currentFace} size="100%" />
      </motion.div>
    </Button>
  );
};
