// --- src/components/layout/Sidebar.tsx ---
import { useState, useEffect } from "react";
import type { NavigationLink } from "../types/navigation";
import { games } from "../data/games";

const links = games
  .filter((g) => g.url)
  .map((g) => ({ name: g.name, url: g.url }));

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón Toggle Flotante (Hamburger Menu) */}
      <button
        onClick={toggleSidebar}
        className="w-fit h-fit z-60 p-2 text-white rounded-md border border-accent hover:bg-accent transition-colors focus:outline-hidden focus:ring-2 focus:ring-accent"
        aria-label="Alternar menú de navegación"
        aria-expanded={isOpen}
      >
        <svg
          fill="currentColor"
          viewBox="0 0 100 100"
          width="30"
          stroke="currentColor"
        >
          {/* Fila Superior (Top) */}
          <rect
            className={`transition-all duration-300 origin-[30px_20px] ${
              isOpen ? "translate-y-2.5 rotate-45" : ""
            }`}
            width="40"
            height="10"
            x="10"
            y="15"
          />
          <rect
            className={`transition-all duration-300 origin-[70px_20px] ${
              isOpen ? " translate-y-2.5 -rotate-45" : ""
            }`}
            width="40"
            height="10"
            x="50"
            y="15"
          />

          {/* Fila Central (Middle) - Se esconden hacia los lados */}
          <rect
            className={`transition-all duration-300 ${
              isOpen ? "-translate-x-10 opacity-0" : ""
            }`}
            width="40"
            height="10"
            x="10"
            y="45"
          />
          <rect
            className={`transition-all duration-300 ${
              isOpen ? "translate-x-10 opacity-0" : ""
            }`}
            width="40"
            height="10"
            x="50"
            y="45"
          />

          {/* Fila Inferior (Bottom) */}
          <rect
            className={`transition-all duration-300 origin-[30px_80px] ${
              isOpen ? "-translate-y-2.5 -rotate-45" : ""
            }`}
            width="40"
            height="10"
            x="10"
            y="75"
          />
          <rect
            className={`transition-all duration-300 origin-[70px_80px] ${
              isOpen ? "-translate-y-2.5 rotate-45" : ""
            }`}
            width="40"
            height="10"
            x="50"
            y="75"
          />
        </svg>
      </button>

      {/* Overlay Oscuro (Cierra el menú al hacer clic fuera) */}
      {isOpen && (
        <div
          className="fixed top-0 h-screen w-screen bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Panel del Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-primary border-r border-secondary z-55 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 pt-20 border-b border-secondary">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-accent to-accent2">
            FabriGames
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-2 px-4">
            <li key="home">
              <a
                href="/"
                className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </a>
            </li>
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
