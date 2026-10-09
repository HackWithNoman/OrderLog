import { ShoppingBag } from 'lucide-react';

/**
 * App header with the logo, title and a light/dark theme switch.
 * Props: `theme` ("light" | "dark") and `onToggleTheme`.
 */
export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="navbar bg-base-100 rounded-2xl shadow-sm px-4 sm:px-6 flex justify-between items-center border border-base-200">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Order Hub
          </h1>
          <p className="text-xs text-base-content/60 hidden sm:block">
            Paste, track and export customer orders
          </p>
        </div>
      </div>

      <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm sm:btn-md">
        <input
          type="checkbox"
          onChange={onToggleTheme}
          checked={theme === 'dark'}
        />
        <svg
          className="swap-off fill-current w-5 h-5 sm:w-6 sm:h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,0,1.41l.71.71A1,1,0,0,0,7.76,7.76L7.05,7.05A1,1,0,0,0,5.64,7.05Zm12.73,9.9a1,1,0,0,0,1.41,0l.71-.71a1,1,0,0,0-1.41-1.41l-.71.71A1,1,0,0,0,18.36,16.95ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-1.65-3.95a1,1,0,0,0-1.41,0l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,19.35,7.05ZM12,19a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM12,6a6,6,0,1,0,6,6A6.01,6.01,0,0,0,12,6Z" />
        </svg>
        <svg
          className="swap-on fill-current w-5 h-5 sm:w-6 sm:h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05A1,1,0,0,0,21.64,13Z" />
        </svg>
      </label>
    </header>
  );
}
