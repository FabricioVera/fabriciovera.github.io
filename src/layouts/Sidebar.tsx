// --- src/components/layout/Sidebar.tsx ---
import { useState, useEffect } from "react";
import type { NavigationLink } from "../types/navigation";

interface SidebarProps {
  links: NavigationLink[];
}

export function Sidebar({ links }: SidebarProps) {
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
        className="fixed top-6 left-4 z-60 p-2 bg-primary text-white rounded-md border border-accent hover:bg-accent transition-colors focus:outline-hidden focus:ring-2 focus:ring-accent"
        aria-label="Alternar menú de navegación"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Overlay Oscuro (Cierra el menú al hacer clic fuera) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Panel del Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-primary border-r border-secondary z-55 transform transition-transform duration-300 ease-in-out ${
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
