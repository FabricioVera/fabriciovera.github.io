import type { ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { $playerName } from "@store/playerStore";
import NameForm from "@components/auth/NameForm";

interface RequirePlayerProps {
  children: ReactNode;
}

export function RequirePlayer({ children }: RequirePlayerProps) {
  const playerName = useStore($playerName);

  if (!playerName) {
    return <NameForm />;
  }

  return <>{children}</>;
}
