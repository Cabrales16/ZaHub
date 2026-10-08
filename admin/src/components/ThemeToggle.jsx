import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getStoredTheme, toggleTheme } from "../utils/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md border border-slate-300 dark:border-slate-700 
                 hover:bg-slate-100 dark:hover:bg-slate-800 
                 transition flex items-center justify-center"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}
