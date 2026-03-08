interface CorrectBannerProps {
  imageURL: string;
  name: string;
}
export default function CorrectBanner({ imageURL, name }: CorrectBannerProps) {
  return (
    <div className="relative w-full h-[35vh] overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(74,222,128,0.5)] border-2 border-success">
      <img
        className={`w-full h-full object-cover object-top transition-transform duration-1000 ease-out`}
        src={imageURL}
        alt={`Respuesta correcta: ${name}`}
        loading="lazy"
      />
      <div className="absolute bottom-6 w-full flex justify-center pointer-events-none z-20">
        <h1
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-green-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          style={{ WebkitTextStroke: "1px rgba(0, 50, 0, 0.5)" }}
        >
          {name}!
        </h1>
      </div>
    </div>
  );
}
