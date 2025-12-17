
import React, { useState } from 'react';
import { LayersIcon } from './icons';
import * as api from '../services/apiService';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  onGoToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || password.trim() === '') {
      setError(`Please enter both email and password.`);
      return;
    }

    try {
      const { token, email: returnedEmail } = await api.login(email, password);
      sessionStorage.setItem('authToken', token);
      setError('');
      onLoginSuccess(returnedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-sky-500/10 p-3 rounded-full mb-4 border border-sky-500/20">
              <LayersIcon className="w-8 h-8 text-sky-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Legacy Data Extractor AI</h1>
            <p className="text-slate-400 mt-2">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onGoToRegister} className="text-sm text-sky-400 hover:text-sky-300 hover:underline">
              {"Don't have an account? Create company account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
