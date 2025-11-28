import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Configuración de apariencia
      </h1>

      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {isDark ? (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Modo oscuro
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Activa o desactiva el modo oscuro del panel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={
            'relative inline-flex h-6 w-11 items-center rounded-full transition ' +
            (isDark ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')
          }
        >
          <span
            className={
              'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ' +
              (isDark ? 'translate-x-5' : 'translate-x-1')
            }
          />
        </button>
      </div>
    </div>
  );
}
