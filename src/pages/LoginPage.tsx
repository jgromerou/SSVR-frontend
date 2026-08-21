import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo autenticar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          <button type="submit" className="primary" disabled={submitting} style={{ width: '100%' }}>
            {mode === 'signin' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => setMode('signup')}>
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => setMode('signin')}>
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
