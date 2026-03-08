import { LevelCard } from "./LevelCard";

interface GameLevel {
  id: string | number;
  name: string;
  completed: boolean;
  active: boolean;
  url: string;
  title: string;
}

interface LevelPathProps {
  levels: GameLevel[];
}

export function LevelPath({ levels }: LevelPathProps) {
  // Configuraciones de la geometría del path
  const ROW_HEIGHT = 60; // Distancia vertical entre cada carta
  const ZIGZAG_OFFSET = 60; // Cuánto se desplaza la carta a la derecha en el zig-zag
  const START_PADDING = 100; // Espacio inicial desde la izquierda

  const containerHeight =
    levels.length > 0 ? (levels.length - 1) * ROW_HEIGHT + 50 : 0;

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {levels.map((_, index) => {
          // No dibujamos línea desde el último elemento
          if (index === levels.length - 1) return null;

          const isEven = index % 2 === 0;

          // Coordenadas de la carta actual (Origen)
          const startX = isEven ? START_PADDING : START_PADDING + ZIGZAG_OFFSET;
          const startY = index * ROW_HEIGHT;

          // Coordenadas de la carta siguiente (Destino)
          const endX = !isEven ? START_PADDING : START_PADDING + ZIGZAG_OFFSET;
          const endY = (index + 1) * ROW_HEIGHT;

          return (
            <line
              key={`line-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="white"
              strokeWidth="2"
              className="opacity-70"
            />
          );
        })}
      </svg>

      {/* CAPA 2: Nodos / Cartas */}
      {levels.map((level, index) => {
        const isEven = index % 2 === 0;

        return (
          <div
            key={level.id}
            className="absolute z-0 transition-transform duration-300"
            style={{
              top: index * ROW_HEIGHT,
              transform: "translateX(-50%) translateY(-50%)",
              left: isEven ? START_PADDING : START_PADDING + ZIGZAG_OFFSET,
            }}
          >
            <LevelCard
              completed={level.completed}
              active={level.active}
              name={level.name}
              url={level.url}
              title={level.title}
            />
          </div>
        );
      })}
    </div>
  );
}
