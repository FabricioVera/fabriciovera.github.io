import { useEffect, useState } from "react";
import { $playerName } from "@store/playerStore";
import { useStore } from "@nanostores/react";

// componentes
import NameForm from "@components/auth/NameForm";
import Greeting from "@components/Greeting";

export function PlayerManager() {
  const [isMounted, setIsMounted] = useState(false);
  const playerName = useStore($playerName);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="text-white text-2xl text-bold flex justify-center items-center">
        Cargando perfil de jugador...
      </div>
    );
  }

  if (!playerName) {
    return <NameForm />;
  }

  return <Greeting />;
}
