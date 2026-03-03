import type { DiceIconProps } from "./ui/General/DiceRoller";

export const CalendarIcon = ({ size = 18, color = "currentColor" }) => {
  return (
    <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
      <path
        fill-rule="evenodd"
        d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
        clip-rule="evenodd"
      />
    </svg>
  );
};

export const InfinityIcon = ({ size = 18, color = "currentColor" }) => {
  return (
    <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
      <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z"></path>{" "}
    </svg>
  );
};

const DiceBase: React.FC<DiceIconProps & { children: React.ReactNode }> = ({
  size = 18,
  color = "currentColor",
  children,
}) => (
  <svg viewBox="0 0 100 100" fill={color} width={size} height={size}>
    {children}
  </svg>
);

/** Cara 1. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 1 punto). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D1Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="50" cy="50" r="12" />
  </DiceBase>
);

/** Cara 2. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 2 puntos). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D2Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="25" cy="25" r="12" />
    <circle cx="75" cy="75" r="12" />
  </DiceBase>
);

/** Cara 3. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 3 puntos). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D3Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="25" cy="75" r="12" />
    <circle cx="50" cy="50" r="12" />
    <circle cx="75" cy="25" r="12" />
  </DiceBase>
);

/** Cara 4. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 4 puntos). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D4Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="25" cy="25" r="12" />
    <circle cx="75" cy="25" r="12" />
    <circle cx="25" cy="75" r="12" />
    <circle cx="75" cy="75" r="12" />
  </DiceBase>
);

/** Cara 5. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 5 puntos). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D5Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="25" cy="25" r="12" />
    <circle cx="75" cy="25" r="12" />
    <circle cx="50" cy="50" r="12" />
    <circle cx="25" cy="75" r="12" />
    <circle cx="75" cy="75" r="12" />
  </DiceBase>
);

/** Cara 6. P:size(num|str)tam, color(str)color.
 * R:JSX(Dado 6 puntos). 0 excepciones / 0 efectos sec.
 * @param {DiceIconProps} props @returns {JSX.Element} */
export const D6Icon: React.FC<DiceIconProps> = (props) => (
  <DiceBase {...props}>
    <circle cx="25" cy="20" r="12" />
    <circle cx="75" cy="20" r="12" />
    <circle cx="25" cy="50" r="12" />
    <circle cx="75" cy="50" r="12" />
    <circle cx="25" cy="80" r="12" />
    <circle cx="75" cy="80" r="12" />
  </DiceBase>
);
