export default function App() { 
  return ( 
    <main className="min-h-dvh bg-gray-50 grid place-items-center p-6"> 
      <section className="w-full max-w-xl rounded-2xl border bg-white p-8 
shadow"> 
        <h1 className="text-3xl font-bold tracking-tight">React 19 + Tailwind 
v4</h1> 
        <p className="mt-2 text-gray-600"> 
          Setup moderno funcionando. Edita <code>src/App.jsx</code> y guarda 
para ver cambios. 
        </p> 
 
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"> 
          <div className="rounded-xl border p-4"> 
            <p className="text-sm text-gray-500">Estado</p> 
            <p className="text-lg font-semibold">OK ✅</p> 
          </div> 
          <div className="rounded-xl border p-4"> 
            <p className="text-sm text-gray-500">Tailwind</p> 
            <p className="text-lg font-semibold">v4 (CSS-first)</p> 
          </div> 
          <div className="rounded-xl border p-4"> 
            <p className="text-sm text-gray-500">Build</p> 
            <p className="text-lg font-semibold">Vite</p> 
          </div> 
        </div> 
 
        <button className="mt-6 inline-flex items-center justify-center 
rounded-xl border px-4 py-2 font-medium hover:bg-gray-50 active:scale
[0.98]"> 
          Botón Tailwind 
        </button> 
      </section> 
    </main> 
  ) 
}