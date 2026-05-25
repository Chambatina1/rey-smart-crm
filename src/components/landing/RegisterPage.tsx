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
import { Shield, Eye, EyeOff, Loader2, Globe, ArrowLeft } from 'lucide-react';

export function RegisterPage() {
  const { t, language, setLanguage } = useT();
  const navigate = useNavigationStore(s => s.navigate);
  const register = useAuthStore(s => s.register);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError(language === 'es' ? 'Por favor complete los campos requeridos' : 'Please fill in required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(language === 'es' ? 'Las contrasenas no coinciden' : 'Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError(language === 'es' ? 'La contrasena debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      return;
    }
    if (!terms) {
      setError(language === 'es' ? 'Debe aceptar los terminos' : 'You must accept the terms');
      return;
    }

    setLoading(true);
    const success = await register(form.name, form.email, form.password);
    setLoading(false);

    if (success) {
      navigate('dashboard');
    } else {
      const msg = language === 'es' ? 'Error al crear la cuenta' : 'Failed to create account';
      setError(msg);
      toast({ title: msg, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-8">
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
          <h1 className="text-2xl font-bold text-gray-900">{t.auth.register}</h1>
          <p className="mt-2 text-sm text-gray-500">{t.auth.registerSubtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reg-name">{t.auth.fullName} *</Label>
              <Input
                id="reg-name"
                value={form.name}
                onChange={updateField('name')}
                placeholder={language === 'es' ? 'Juan Garcia' : 'John Doe'}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">{t.auth.email} *</Label>
              <Input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="name@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone">{t.auth.phone}</Label>
              <Input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={updateField('phone')}
                placeholder="(407) 123-4567"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">{t.auth.password} *</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField('password')}
                  placeholder="••••••••"
                  className="h-11 pr-10"
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

            <div className="space-y-2">
              <Label htmlFor="reg-confirm">{t.auth.confirmPassword} *</Label>
              <Input
                id="reg-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                placeholder="••••••••"
                className="h-11"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="reg-terms"
                checked={terms}
                onCheckedChange={(v) => setTerms(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="reg-terms" className="text-sm text-gray-600 cursor-pointer leading-snug">
                {t.auth.termsAgree}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.auth.register}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t.auth.hasAccount}{' '}
              <button
                onClick={() => navigate('login')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                {t.auth.signIn}
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
