import { HexagonIcon } from "../../../Icons";

interface Props {
  imageURL: string;
  name: string;
  stars: 0 | 1 | 2 | 3;
}

export function ArknightsCorrectBanner({ imageURL, name, stars }: Props) {
  return (
    <div className="relative w-full h-full">
      <img
        className={`w-full h-[70vh] object-contain object-right transition-transform duration-1000 ease-out`}
        src={imageURL}
        alt={`Respuesta correcta: ${name}`}
        loading="lazy"
      />
      <div className="absolute top-5 w-full whitespace-break-spaces max-w-[60%] flex flex-col justify-center pointer-events-none z-20">
        {stars === 0 ? (
          <h2 className="text-lg md:text-xl font-semibold text-red-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            Operation Failed
          </h2>
        ) : (
          <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            Operation Complete
          </h2>
        )}
        <h1
          className="text-4xl md:text-5xl font-black text-white drop-shadow-[1px_3px_3px_rgba(0,0,0,0.8)]"
          style={{ WebkitTextStroke: "1px rgba(0, 0, 0, 0.5)" }}
        >
          {name}
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          Mission Results
        </h2>
        <div className="flex flex-row">
          <div
            className={`relative inline-flex items-center justify-center ${
              stars > 0 ? "text-blue-300" : "text-gray-700"
            }`}
          >
            <div
              className={`absolute z-0 w-[90%] h-[120%] ${
                stars > 0
                  ? "bg-linear-to-b from-transparent via-current/50 to-transparent"
                  : ""
              } pointer-events-none`}
            ></div>
            <div className="relative z-10">
              <HexagonIcon size={40} />
            </div>
          </div>
          <div
            className={`relative inline-flex items-center justify-center ${
              stars > 1 ? "text-blue-300" : "text-gray-700"
            }`}
          >
            <div
              className={`absolute z-0 w-[90%] h-[120%] ${
                stars > 1
                  ? "bg-linear-to-b from-transparent via-current/50 to-transparent"
                  : ""
              } pointer-events-none`}
            ></div>
            <div className="relative z-10">
              <HexagonIcon size={40} />
            </div>
          </div>
          <div
            className={`relative inline-flex items-center justify-center ${
              stars > 2 ? "text-blue-300" : "text-gray-700"
            }`}
          >
            <div
              className={`absolute z-0 w-[90%] h-[120%] ${
                stars > 2
                  ? "bg-linear-to-b from-transparent via-current/50 to-transparent"
                  : ""
              } pointer-events-none`}
            ></div>
            <div className="relative z-10">
              <HexagonIcon size={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
