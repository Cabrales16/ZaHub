import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { resetDemoData } from '../../../shared/mock/mockSupabase.js';

// Franja fija que avisa que es una demo y permite restaurar los datos de ejemplo.
export default function DemoBanner() {
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    resetDemoData();
    window.location.hash = '#/login';
    window.location.reload();
  };

  return (
    <div className="fixed bottom-3 left-3 z-[60] flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs text-amber-900 shadow-md">
      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">
        Modo demo: los datos se guardan solo en tu navegador y se comparten con la app cliente.
      </span>
      <span className="sm:hidden">Modo demo</span>
      {confirming ? (
        <>
          <button onClick={reset} className="font-semibold underline">Confirmar</button>
          <button onClick={() => setConfirming(false)} className="underline">Cancelar</button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="font-semibold underline">
          Restaurar datos
        </button>
      )}
    </div>
  );
}
