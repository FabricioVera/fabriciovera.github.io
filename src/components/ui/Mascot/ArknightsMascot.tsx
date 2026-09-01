import { imageCredits } from "public/imageCredits";

export function ArknightsMascot({ imageURL }: { imageURL: string }) {
  const imageCredit = imageCredits.find(
    (credit) => credit.imagePath === imageURL,
  );
  return (
    <div className="invisible lg:visible fixed bottom-0 right-0 h-[50vh] w-auto">
      <a href={imageCredit?.authorURL} target="_blank">
        <img src={imageURL} alt="mascot" className="w-full h-full" />
        <p className="absolute bottom-2 right-0 text-white hover:text-accent text-shadow-lg shadow-2xs font-black text-2xl w-full">
          Image Credit: {imageCredit?.author}
        </p>
      </a>
    </div>
  );
}
