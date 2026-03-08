import { $playerName } from "@store/playerStore";
import Button from "@components/ui/General/Button";
export default function NameForm() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-linear-to-br from-primary to-secondary border border-accent rounded-xl shadow-lg mt-10 mb-4 text-center">
      <h2 className="text-xl font-bold text-neutral-primary">
        Para empezar a jugar dime tu nombre o apodo
      </h2>
      <h3 className="font-light text-muted mb-4">
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
          className="w-full mb-4 p-3 rounded bg-primary text-neutral-primary border border-accent/70 focus:outline-none focus:border-accent"
          type="text"
          name="name"
          required
          placeholder="Momazos Diego, Giacomino Guardiano delle Galassie e dell'Iperspazio..."
        />
        <Button type="submit">Jugar</Button>
      </form>
    </div>
  );
}
