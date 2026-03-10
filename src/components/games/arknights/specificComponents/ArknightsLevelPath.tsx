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

const PATH_CONFIG = {
  HORIZONTAL_SPACING: 140, // Distancia horizontal entre el centro de cada carta
  VERTICAL_AMPLITUDE: 80, // Qué tanto baja la carta en el zig-zag
  PADDING_X: 100, // Espacio inicial/final para que la carta no se corte
  PADDING_Y: 40, // Espacio superior para que la carta no se corte
};

export const getLevelCoordinate = (index: number) => {
  const isEven = index % 2 === 0;
  return {
    x: PATH_CONFIG.PADDING_X + index * PATH_CONFIG.HORIZONTAL_SPACING,
    y: PATH_CONFIG.PADDING_Y + (isEven ? 0 : PATH_CONFIG.VERTICAL_AMPLITUDE),
  };
};

export function LevelPath({ levels }: LevelPathProps) {
  if (!levels || levels.length === 0) return null;

  const containerWidth =
    PATH_CONFIG.PADDING_X * 2 +
    (levels.length - 1) * PATH_CONFIG.HORIZONTAL_SPACING;

  const containerHeight =
    PATH_CONFIG.PADDING_Y * 2 + PATH_CONFIG.VERTICAL_AMPLITUDE;
  return (
    <div
      className="relative w-full"
      style={{
        minWidth: containerWidth,
        height: containerHeight,
      }}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {levels.map((_, index) => {
          // No dibujamos línea desde el último elemento
          if (index === levels.length - 1) return null;

          const start = getLevelCoordinate(index);
          const end = getLevelCoordinate(index + 1);

          return (
            <line
              key={`line-${index}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="white"
              strokeWidth="2"
              className="opacity-50"
            />
          );
        })}
      </svg>

      {levels.map((level, index) => {
        const { x, y } = getLevelCoordinate(index);

        return (
          <div
            key={level.id}
            className="absolute"
            style={{
              top: y,
              left: x,
              transform: "translate(-50%, -50%)",
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
