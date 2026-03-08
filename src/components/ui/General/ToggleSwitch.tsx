import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeText?: string;
  inactiveText?: string;
}

export default function ToggleSwitch({
  label,
  checked,
  onChange,
  activeText = "Activados",
  inactiveText = "Desactivados",
}: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer my-2">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        aria-label={`Alternar estado de ${label.toLowerCase()}`}
      />
      <div
        className="w-11 h-6 bg-primary rounded-full peer-checked:after:translate-x-full border border-secondary
        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"
      ></div>
      {/* Corrección: text-white -> text-neutral-primary para soporte de temas claros/oscuros */}
      <span className="ml-3 text-sm font-medium text-neutral-primary">
        {label} {checked ? activeText : inactiveText}
      </span>
    </label>
  );
}
