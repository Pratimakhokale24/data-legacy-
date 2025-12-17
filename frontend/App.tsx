
import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegisterPage from './components/RegisterPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
        setView('dashboard');
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    setIsAuthReady(true);
  }, []);

  const handleLoginSuccess = useCallback((email: string) => {
    try {
        sessionStorage.setItem('currentUser', email);
        setCurrentUser(email);
        setView('dashboard');
    } catch (error) {
        console.error("Could not set session storage:", error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
        setView('login');
    } catch (error) {
        console.error("Could not remove from session storage:", error);
    }
  }, []);

  if (!isAuthReady) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-950"></div>; // Or a splash screen
  }

  return (
    <div className="min-h-screen w-full font-sans">
      {currentUser ? (
        <DashboardPage userEmail={currentUser} onLogout={handleLogout} />
      ) : view === 'register' ? (
        <RegisterPage onRegistered={() => setView('login')} onGoToLogin={() => setView('login')} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setView('register')} />
      )}
    </div>
  );
};

export default App;
