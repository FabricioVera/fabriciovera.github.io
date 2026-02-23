import { $playerName } from "@store/playerStore";
export default function NameForm() {
  return (
    <div className="max-w-md mx-auto p-8 bg-primary border border-accent rounded-xl shadow-lg mt-10 my-4 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">
        Para empezar a jugar dime tu nombre o apodo
      </h2>
      <h3 className="font-light text-gray-300 mb-4">
        Este apodo servirá para el ranking
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const name = formData.get("name") as string;
          if (name.trim()) $playerName.set(name.trim());
        }}
      >
        <input
          className="w-full p-3 rounded bg-secondary text-white border border-secondary focus:outline-none focus:border-accent mb-4"
          type="text"
          name="name"
          required
          placeholder="Ingresa tu nombre o apodo"
        />
        <button
          type="submit"
          className="w-full bg-secondary hover:bg-accent text-white font-bold py-3 rounded transition-colors"
        >
          Comenzar a Jugar
        </button>
      </form>
    </div>
  );
}
