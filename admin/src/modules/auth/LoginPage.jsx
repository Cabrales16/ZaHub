import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isDemo } from '../../supabaseClient';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../../../shared/mock/seed.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const login = async (emailValue, passwordValue) => {
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">ZaHub Admin 🍕</h1>
        <p className="text-sm text-slate-500 mb-4 text-center">
          Inicia sesión como administrador, cajero o cocina.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-orange-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-orange-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {isDemo && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="mb-2 font-semibold">🧪 Demo: entra con una cuenta de prueba</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'cajero', 'cocina'].map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={loading}
                  onClick={() => login(DEMO_ACCOUNTS[k].email, DEMO_PASSWORD)}
                  className="rounded-md border border-amber-300 bg-white px-2 py-1.5 font-medium hover:bg-amber-100 disabled:opacity-60"
                >
                  {DEMO_ACCOUNTS[k].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-amber-800">
              {DEMO_ACCOUNTS.admin.email} · clave: {DEMO_PASSWORD}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
