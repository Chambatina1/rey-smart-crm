'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Eye, EyeOff, Loader2, Globe, ArrowLeft, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { t, language, setLanguage } = useT();
  const navigate = useNavigationStore(s => s.navigate);
  const login = useAuthStore(s => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(language === 'es'
        ? 'Por favor complete todos los campos'
        : 'Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(language === 'es'
        ? 'Ingrese un correo electronico valido'
        : 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      toast({
        title: language === 'es' ? 'Bienvenido de vuelta' : 'Welcome back',
        description: language === 'es' ? 'Inicio de sesion exitoso' : 'Successfully signed in',
      });
      // Navigate to dashboard after successful login
      navigate('dashboard');
    } else {
      const serverError = result.error || '';
      setError(serverError);
      toast({
        title: language === 'es' ? 'Error de inicio de sesion' : 'Sign in failed',
        description: serverError,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/25">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.welcomeBack}</h1>
          <p className="mt-2 text-sm text-gray-500">{t.auth.loginSubtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">{t.auth.email}</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  {t.auth.rememberMe}
                </label>
              </div>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t.auth.forgotPassword}
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'es' ? 'Iniciando sesion...' : 'Signing in...'}
                </span>
              ) : (
                t.auth.login
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t.auth.noAccount}{' '}
              <button
                onClick={() => navigate('register')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                {t.auth.signUp}
              </button>
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('landing')}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.common.back}
            </button>
          </div>
        </div>

        {/* Language toggle */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="text-sm text-gray-500 hover:text-teal-600 flex items-center gap-1"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'Espanol' : 'English'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
