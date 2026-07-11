'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, CheckCircle2, Loader2, PhoneCall, Lock } from 'lucide-react';

/* ── validation schema ─────────────────────────────────────────── */
const leadSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  state: z.string().optional(),
  goal: z.string().optional(),
  creditScore: z.string().optional(),
  message: z.string().optional(),
  consent: z.literal(true, {
    message: 'Please accept to continue',
  }),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LandingForm() {
  const { t, language } = useT();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      state: '',
      goal: '',
      creditScore: '',
      message: '',
    },
  });

  const consent = watch('consent');

  const onSubmit = async (data: LeadFormData) => {
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language, source: 'landing' }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  /* ── success state ────────────────────────────────────────────── */
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-xl ring-1 ring-black/5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)]/15"
        >
          <CheckCircle2 className="h-9 w-9 text-[var(--color-gold)]" />
        </motion.div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">
          {language === 'es' ? '¡Solicitud recibida!' : 'Request received!'}
        </h3>
        <p className="max-w-sm text-muted-foreground">{t.landing.formSuccess}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setStatus('idle')}
        >
          {language === 'es' ? 'Enviar otra' : 'Submit another'}
        </Button>
      </motion.div>
    );
  }

  /* ── form ─────────────────────────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-8"
      noValidate
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* First name */}
        <div>
          <Label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            {t.landing.formFirstName}
          </Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            className={errors.firstName ? 'border-destructive' : ''}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last name */}
        <div>
          <Label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            {t.landing.formLastName}
          </Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            className={errors.lastName ? 'border-destructive' : ''}
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            {t.landing.formEmail}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className={errors.email ? 'border-destructive' : ''}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            {t.landing.formPhone}
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={errors.phone ? 'border-destructive' : ''}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <Label htmlFor="state" className="mb-1.5 block text-sm font-medium">
            {t.landing.formState}
          </Label>
          <Input id="state" autoComplete="address-level1" {...register('state')} />
        </div>

        {/* Goal */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium">{t.landing.formGoal}</Label>
          <Select onValueChange={(v) => setValue('goal', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.landing.formSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_repair">{t.landing.goalCreditRepair}</SelectItem>
              <SelectItem value="consolidation">{t.landing.goalConsolidation}</SelectItem>
              <SelectItem value="home_buying">{t.landing.goalHomeBuying}</SelectItem>
              <SelectItem value="business_credit">{t.landing.goalBusinessCredit}</SelectItem>
              <SelectItem value="education">{t.landing.goalEducation}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Credit score */}
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-sm font-medium">{t.landing.formCreditScore}</Label>
          <Select onValueChange={(v) => setValue('creditScore', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.landing.formSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<580">{t.landing.scoreUnder580}</SelectItem>
              <SelectItem value="580-669">{t.landing.score580669}</SelectItem>
              <SelectItem value="670-739">{t.landing.score670739}</SelectItem>
              <SelectItem value="740-799">{t.landing.score740799}</SelectItem>
              <SelectItem value="800+">{t.landing.score800}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <Label htmlFor="message" className="mb-1.5 block text-sm font-medium">
            {t.landing.formMessage}
          </Label>
          <Textarea
            id="message"
            rows={3}
            className="resize-none"
            {...register('message')}
          />
        </div>
      </div>

      {/* Consent checkbox */}
      <div className="mb-5">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={!!consent}
            onCheckedChange={(v) => setValue('consent', (v === true) as true, { shouldValidate: true })}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            {t.landing.formConsent}
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1 text-xs text-destructive">{errors.consent.message}</p>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {t.landing.formError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <Button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-[var(--color-gold)] text-[var(--gold-foreground)] shadow-lg shadow-[var(--color-gold)]/25 transition hover:brightness-110 active:scale-[0.98]"
        size="lg"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.landing.formSubmitting}
          </>
        ) : (
          t.landing.formSubmit
        )}
      </Button>

      {/* Trust microcopy */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gold)]" />
          {language === 'es' ? 'Datos seguros' : 'Secure data'}
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[var(--color-gold)]" />
          {language === 'es' ? 'Sin compromiso' : 'No obligation'}
        </span>
        <a
          href="tel:+14074328872"
          className="flex items-center gap-1.5 font-medium text-foreground hover:text-[var(--color-gold)]"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          (407) 432-8872
        </a>
      </div>
    </form>
  );
}
