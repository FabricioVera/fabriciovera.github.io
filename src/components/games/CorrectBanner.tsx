export default function CorrectBanner({
  imageURL,
  name,
}: {
  imageURL: string;
  name: string;
}) {
  return (
    <div className="relative w-auto mx-auto flex flex-col justify-center items-center text-center">
      <img
        className={`w-full h-[35vh] object-cover object-top pointer-events-none bg-primary/50 border border-accent text-white rounded-lg p-4`}
        src={imageURL}
        alt=""
      />
      <h1
        className={`absolute bottom-5 text-2xl md:text-4xl font-bold text-center px-4 tracking-wider transition-colors duration-300 "absolute text-white drop-shadow-[0_0_15px_var(--color-accent)] css-3d-text"
                `}
      >
        {name}
      </h1>
    </div>
  );
}
