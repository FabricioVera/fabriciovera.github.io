import { useState } from "react";
import {
  FEATURE_FLAG_META,
  useFeatureFlag,
  type FeatureFlag,
} from "@store/featureFlagsStore";
import { SettingsIcon } from "../../Icons";
import ToggleSwitch from "../General/ToggleSwitch";

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { flags, toggleFlag } = useFeatureFlag();

  const flagKeys = Object.keys(flags) as FeatureFlag[];

  return (
    <div className="relative">
      <button
        className="p-2 text-white hover:rotate-90 transition-transform duration-300"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <SettingsIcon />
      </button>
      {isOpen && (
        <div
          id="SettingsMenu"
          className="absolute right-0 w-64 p-4 bg-primary border border-secondary flex flex-col gap-3"
        >
          {flagKeys.map((flag) => {
            // Unimos la data de presentación con el valor del estado global
            const meta = FEATURE_FLAG_META[flag];
            const isActive = flags[flag];

            return (
              <ToggleSwitch
                key={flag}
                label={meta.label}
                checked={isActive}
                onChange={() => toggleFlag(flag)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
