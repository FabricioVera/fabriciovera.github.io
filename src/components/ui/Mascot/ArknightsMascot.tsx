export function ArknightsMascot({ imageURL }: { imageURL: string }) {
  return (
    <div className="invisible lg:visible fixed bottom-0 right-5 h-[50vh] w-auto pointer-events-none">
      <img src={imageURL} alt="" className="w-full h-full" />
    </div>
  );
}
