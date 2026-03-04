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

export const FlagIcon = ({
  size = 18,
  color = "currentColor",
}: {
  size?: string | number;
  color?: string;
}) => (
  <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path
      fill-rule="evenodd"
      d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
      clip-rule="evenodd"
    />
  </svg>
);

export const TrophyIcon = ({
  size = 18,
  color = "currentColor",
}: {
  size?: string | number;
  color?: string;
}) => (
  <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path
      fill-rule="evenodd"
      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
      clip-rule="evenodd"
    />
  </svg>
);
