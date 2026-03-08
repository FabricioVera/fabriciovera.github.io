import { HexagonIcon } from "../../../Icons";

interface LevelCardProps {
  completed: boolean;
  active: boolean;
  name: string;
  url: string;
  title: string;
}

export function LevelCard({
  completed,
  active,
  name,
  url,
  title,
}: LevelCardProps) {
  return (
    <a
      href={url}
      title={title}
      className={`relative flex flex-col justify-center items-center h-fit w-fit ${active ? "bg-gray-500" : "bg-white"}`}
    >
      <div
        className="w-full bg-black text-white px-4"
        style={{ fontSize: "10px" }}
      >
        {title}
      </div>
      <div className="absolute left-0 -translate-x-[50%] text-white">
        <HexagonIcon size={22} />
      </div>
      <div
        className={`absolute left-0 -translate-x-[50%] ${completed ? "text-blue-500" : "text-gray-700"}`}
      >
        <HexagonIcon />
      </div>
      <div className="ml-3 font-semibold">{name}</div>
    </a>
  );
}
