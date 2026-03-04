import { useCallback, useEffect, useState } from "react";
import { D1Icon, D2Icon, D3Icon, D4Icon, D5Icon, D6Icon } from "../../Icons";
import Button from "./Button";

const VALID_FACES: DiceValue[] = [1, 2, 3, 4, 5, 6];
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

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
  const randomIndex = Math.floor(Math.random() * availableFaces.length);
  return availableFaces[randomIndex];
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

  const handleRoll = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    const previousFace = currentFace;

    setTimeout(() => {
      const finalFace = rollDice(previousFace);
      setCurrentFace(finalFace);
      setIsRolling(false);
      if (onRoll) onRoll();
    }, 400);
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
      className={` rounded-xl transition-all flex flex-col items-center shadow-lg outline-none ${
        isRolling ? "scale-95 opacity-80 cursor-wait" : "cursor-pointer"
      }`}
    >
      <div
        className={` text-white flex items-center justify-center transition-transform duration-400 ease-in-out p-1 ${
          isRolling ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      >
        <DiceFace value={currentFace} size="100%" />
      </div>
    </Button>
  );
};
