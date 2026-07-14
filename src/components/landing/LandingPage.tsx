'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  DollarSign,
  GraduationCap,
  Users,
  Phone,
  Mail,
  MapPin,
  Globe,
  Menu,
  X,
  ChevronRight,
  Star,
  Clock,
  BookOpen,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  PhoneCall,
  FileSearch,
  Rocket,
  Home,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { LandingForm } from '@/components/landing/LandingForm';

/* ── animated counter ──────────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let current = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, startCounting]);
  return count;
}

function AnimatedCounter({ end, suffix }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(end, 2000, inView);
  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── main component ────────────────────────────────────────────── */
export function LandingPage() {
  const { t, language, setLanguage } = useT();
  const navigate = useNavigationStore(s => s.navigate);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const testimonials = [
    {
      name: language === 'es' ? 'Maria Garcia' : 'Maria Garcia',
      role: language === 'es' ? 'Cliente desde 2023' : 'Client since 2023',
      text: language === 'es'
        ? 'Rey Smart Solution transformo mi vida financiera. Mi puntaje subio 120 puntos en solo 6 meses.'
        : 'Rey Smart Solution transformed my financial life. My score went up 120 points in just 6 months.',
      rating: 5,
    },
    {
      name: language === 'es' ? 'Carlos Rodriguez' : 'Carlos Rodriguez',
      role: language === 'es' ? 'Cliente desde 2022' : 'Client since 2022',
      text: language === 'es'
        ? 'El equipo es profesional y dedicado. Me guiaron paso a paso en todo el proceso.'
        : 'The team is professional and dedicated. They guided me step by step through the entire process.',
      rating: 5,
    },
    {
      name: language === 'es' ? 'Ana Martinez' : 'Ana Martinez',
      role: language === 'es' ? 'Cliente desde 2024' : 'Client since 2024',
      text: language === 'es'
        ? 'Gracias a sus cursos educativos, ahora entiendo como funciona el credito. Pude comprar mi primera casa.'
        : 'Thanks to their educational courses, I now understand how credit works. I was able to buy my first home.',
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const navLinks = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.courses, href: '#how-it-works' },
    { label: t.nav.courses, href: '#courses' },
  ];

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Carousel auto-play logic
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      carouselApi?.scrollNext();
    }, 4000);
  }, [carouselApi]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    startAutoPlay();
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    return () => {
      stopAutoPlay();
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi, startAutoPlay, stopAutoPlay]);

  const carouselServices = [
    {
      icon: Shield,
      title: t.landing.creditRepair,
      desc: t.landing.creditRepairLongDesc,
      shortDesc: t.landing.creditRepairDesc,
      gradient: 'from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-accent)]',
      iconBg: 'bg-[var(--color-gold)]/30',
      btnClass: 'bg-white text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10',
    },
    {
      icon: DollarSign,
      title: t.landing.consolidation,
      desc: t.landing.consolidationLongDesc,
      shortDesc: t.landing.consolidationDesc,
      gradient: 'from-[var(--color-accent)] via-[var(--color-accent)] to-[var(--color-accent)]',
      iconBg: 'bg-[var(--color-accent)]/20',
      btnClass: 'bg-white text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10',
    },
    {
      icon: GraduationCap,
      title: t.landing.education,
      desc: t.landing.educationLongDesc,
      shortDesc: t.landing.educationDesc,
      gradient: 'from-amber-500 via-amber-600 to-orange-500',
      iconBg: 'bg-amber-400/30',
      btnClass: 'bg-white text-amber-800 hover:bg-amber-50',
    },
    {
      icon: Users,
      title: t.landing.counseling,
      desc: t.landing.counselingLongDesc,
      shortDesc: t.landing.counselingDesc,
      gradient: 'from-rose-600 via-rose-500 to-pink-500',
      iconBg: 'bg-rose-400/30',
      btnClass: 'bg-white text-rose-700 hover:bg-rose-50',
    },
    {
      icon: Home,
      title: t.landing.homeBuying,
      desc: t.landing.homeBuyingLongDesc,
      shortDesc: t.landing.homeBuyingDesc,
      gradient: 'from-purple-600 via-purple-500 to-violet-500',
      iconBg: 'bg-purple-400/30',
      btnClass: 'bg-white text-purple-700 hover:bg-purple-50',
    },
    {
      icon: Briefcase,
      title: t.landing.businessCredit,
      desc: t.landing.businessCreditLongDesc,
      shortDesc: t.landing.businessCreditDesc,
      gradient: 'from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-accent)]',
      iconBg: 'bg-sky-400/30',
      btnClass: 'bg-white text-sky-700 hover:bg-sky-50',
    },
  ];

  const services = [
    { icon: Shield, title: t.landing.creditRepair, desc: t.landing.creditRepairDesc, color: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' },
    { icon: DollarSign, title: t.landing.consolidation, desc: t.landing.consolidationDesc, color: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' },
    { icon: GraduationCap, title: t.landing.education, desc: t.landing.educationDesc, color: 'bg-amber-100 text-amber-600' },
    { icon: Users, title: t.landing.counseling, desc: t.landing.counselingDesc, color: 'bg-rose-100 text-rose-600' },
  ];

  const steps = [
    { icon: Phone, title: t.landing.step1, desc: t.landing.step1Desc, num: '01' },
    { icon: FileSearch, title: t.landing.step2, desc: t.landing.step2Desc, num: '02' },
    { icon: Rocket, title: t.landing.step3, desc: t.landing.step3Desc, num: '03' },
  ];

  const courses = [
    {
      title: 'Credit Fundamentals 101',
      desc: language === 'es'
        ? 'Aprende los fundamentos del credito, desde como funciona hasta como construir un historial solido.'
        : 'Learn the fundamentals of credit, from how it works to building a solid history.',
      gradient: 'from-[var(--color-accent)] to-[var(--color-primary)]',
      icon: BookOpen,
    },
    {
      title: language === 'es' ? 'Estrategias de Consolidacion de Deudas' : 'Debt Consolidation Strategies',
      desc: language === 'es'
        ? 'Descubre las mejores estrategias para consolidar deudas y reducir pagos mensuales.'
        : 'Discover the best strategies to consolidate debt and reduce monthly payments.',
      gradient: 'from-[var(--color-gold)] to-[var(--color-accent)]',
      icon: DollarSign,
    },
    {
      title: language === 'es' ? 'Guia para Compradores Primerizos' : 'First-Time Homebuyer Guide',
      desc: language === 'es'
        ? 'Todo lo que necesitas saber para comprar tu primera casa con el mejor credito posible.'
        : 'Everything you need to know to buy your first home with the best credit possible.',
      gradient: 'from-[var(--color-primary)] to-[var(--color-accent)]',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ───────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 shadow-lg shadow-black/5 backdrop-blur-xl ring-1 ring-black/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex cursor-pointer items-center gap-2.5" onClick={() => navigate('landing')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reys-logo.png" alt="REYS Smart Solutions" className="h-9 w-auto" />
            </div>

            {/* Desktop nav */}
            <div className="hidden items-center gap-7 md:flex">
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'ES' : 'EN'}
              </button>
              <Button
                onClick={() => scrollTo('contact')}
                className={`shimmer-gold hidden bg-[var(--color-gold)] font-semibold text-[var(--gold-foreground)] shadow-md shadow-[var(--color-gold)]/30 transition hover:brightness-110 sm:inline-flex ${scrolled ? '' : 'ring-2 ring-white/20'}`}
              >
                {language === 'es' ? 'Evaluación Gratis' : 'Free Evaluation'}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 md:hidden ${scrolled ? 'text-muted-foreground' : 'text-white'}`}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border pb-4 md:hidden"
            >
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full py-2 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <Button
                onClick={() => { scrollTo('contact'); setMobileMenuOpen(false); }}
                className="mt-3 w-full bg-[var(--color-gold)] font-semibold text-[var(--gold-foreground)] shadow-md"
              >
                {language === 'es' ? 'Evaluación Gratis' : 'Free Evaluation'}
              </Button>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[var(--color-primary)]">
        {/* Background: deep navy with blue ambient glow — white/blue palette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 65% 25%, oklch(0.32 0.08 245 / 0.95) 0%, oklch(0.22 0.045 258 / 0.98) 40%, oklch(0.16 0.025 264) 100%)',
          }}
        />
        {/* Subtle financial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)',
          }}
        />
        {/* Subtle financial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Blue glow — top right (universe light source) */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.55_0.14_245)]/25 blur-[120px]" />
        {/* White-blue glow — bottom left */}
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.70_0.10_230)]/15 blur-[120px]" />
        {/* Center vignette accent (blue) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.60_0.12_248)]/10 blur-[100px]" />

        {/* Animated particles (blue/white stars — financial universe) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[15%] top-[30%] h-1 w-1 animate-pulse rounded-full bg-white/70" />
          <div className="absolute right-[20%] top-[45%] h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.75_0.12_240)]/70 [animation-delay:700ms]" />
          <div className="absolute bottom-[25%] left-[30%] h-1 w-1 animate-pulse rounded-full bg-white/50 [animation-delay:1400ms]" />
          <div className="absolute right-[35%] bottom-[35%] h-1 w-1 animate-pulse rounded-full bg-[oklch(0.65_0.14_248)]/60 [animation-delay:2100ms]" />
          <div className="absolute left-[60%] top-[20%] h-0.5 w-0.5 animate-pulse rounded-full bg-white/80 [animation-delay:1000ms]" />
          <div className="absolute right-[10%] top-[15%] h-1 w-1 animate-pulse rounded-full bg-[oklch(0.70_0.10_235)]/50 [animation-delay:1800ms]" />
        </div>

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo large */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-7"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reys-logo.png" alt="REYS Smart Solutions" className="h-16 w-auto drop-shadow-[0_4px_24px_rgba(201,162,39,0.35)]" />
              </motion.div>

              <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                {language === 'es' ? (
                  <>
                    Reconstruye Tu Crédito
                    <br />
                    Con <span className="text-[var(--color-accent)]">Estrategia Legal</span>
                    <br />
                    Y Expertos Reales
                  </>
                ) : (
                  <>
                    Rebuild Your Credit
                    <br />
                    With <span className="text-[var(--color-accent)]">Legal Strategy</span>
                    <br />
                    And Real Experts
                  </>
                )}
              </h1>

              {/* Elegant tagline */}
              <p className="mt-5 text-lg font-light italic tracking-wide text-[var(--color-gold)]">
                {language === 'es' ? '"Construyendo Vidas, No Solo Crédito."' : '"Building Lives, Not Just Credit."'}
              </p>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                {t.landing.heroSubtitle}
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => scrollTo('contact')}
                  size="lg"
                  className="shimmer-gold bg-[var(--color-gold)] px-8 py-6 text-base font-semibold text-[var(--gold-foreground)] shadow-xl shadow-[var(--color-gold)]/30 transition hover:brightness-110 active:scale-[0.98]"
                >
                  {language === 'es' ? 'Evaluación Gratis' : 'Free Evaluation'}
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => scrollTo('how-it-works')}
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 px-8 py-6 text-base text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  {language === 'es' ? 'Cómo Funciona' : 'How it Works'}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                {[
                  { icon: Shield, label: language === 'es' ? 'Sin cobros por adelantado' : 'No Upfront Fees' },
                  { icon: FileSearch, label: language === 'es' ? 'Ley federal' : 'Federal Law' },
                  { icon: PhoneCall, label: language === 'es' ? 'Todo el país' : 'Nationwide' },
                  { icon: Users, label: language === 'es' ? 'Profesionales' : 'Licensed Pros' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm text-white/75">
                    <b.icon className="h-4 w-4 text-[var(--color-gold)]" />
                    {b.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — financial universe (hand holding the financial world) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="relative hidden lg:block"
            >
              {/* The symbolic image: hand holding the financial universe */}
              <div className="relative">
                {/* rotating orbit ring accent */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-gold)]/20 [animation:spin_28s_linear_infinite]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-accent)]/15 [animation:spin_20s_linear_infinite_reverse]" />

                {/* Main hero image */}
                <motion.img
                  src="/hero-finance.svg"
                  alt={language === 'es' ? 'Tu mundo financiero en buenas manos' : 'Your financial world in good hands'}
                  className="relative z-10 mx-auto w-full max-w-md drop-shadow-[0_8px_40px_rgba(74,144,217,0.35)]"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Floating stat card — score improvement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="absolute -bottom-2 -left-4 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.1] px-4 py-3 backdrop-blur-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/20 ring-1 ring-[var(--color-gold)]/40">
                    <Rocket className="h-5 w-5 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-none text-[var(--color-accent)]">+253</p>
                    <p className="text-[11px] text-white/60">
                      {language === 'es' ? 'puntos en 6 meses' : 'points in 6 months'}
                    </p>
                  </div>
                </motion.div>

                {/* Floating "compliance" badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="absolute -right-2 top-8 z-20 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.1] px-3 py-2 backdrop-blur-xl"
                >
                  <Shield className="h-4 w-4 text-[var(--color-gold)]" />
                  <span className="text-xs font-medium text-white/80">FCRA / FDCPA</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-primary)] to-transparent" />
      </section>

      {/* ── Service Carousel ───────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t.landing.serviceCarouselTitle}
            </h2>
          </motion.div>

          <div className="relative px-8 sm:px-14">
            <Carousel
              opts={{ loop: true }}
              setApi={setCarouselApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {carouselServices.map((service, i) => (
                  <CarouselItem key={i} className="pl-4 md:basis-full lg:basis-full">
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.gradient} p-6 sm:p-8 md:p-10 lg:p-12 min-h-[320px] sm:min-h-[360px] flex items-center`}
                      onMouseEnter={stopAutoPlay}
                      onMouseLeave={startAutoPlay}
                    >
                      {/* Decorative background icon */}
                      <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 opacity-[0.08] pointer-events-none">
                        <service.icon className="w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 text-white" />
                      </div>
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                      <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        {/* Icon */}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${service.iconBg} backdrop-blur-sm flex items-center justify-center flex-shrink-0`}>
                          <service.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                            {service.title}
                          </h3>
                          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl mb-6">
                            {service.shortDesc}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => navigate('dashboard')}
                              className={`${service.btnClass} px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold shadow-lg`}
                            >
                              {t.landing.getStarted}
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/50 text-white hover:bg-white/15 backdrop-blur-sm px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base"
                            >
                              {t.landing.learnMore}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 sm:-left-14 bg-white/90 text-gray-800 hover:bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all" />
              <CarouselNext className="right-0 sm:-right-14 bg-white/90 text-gray-800 hover:bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all" />
            </Carousel>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselServices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    carouselApi?.scrollTo(i);
                    stopAutoPlay();
                    startAutoPlay();
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-8 bg-[var(--color-accent)]'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ────────────────────────────── */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.services}</h2>
            <p className="mt-4 text-lg text-gray-600">{t.landing.servicesSubtitle}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="glow-ring tilt-card group h-full cursor-pointer border-0 shadow-md hover:shadow-2xl">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-[var(--color-accent)]">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.howItWorks}</h2>
          </motion.div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Animated gradient connecting line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute left-[16%] right-[16%] top-10 hidden h-1 origin-left rounded-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-gold)] to-[var(--color-accent)] md:block"
            />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.18, duration: 0.6 }}
                className="relative text-center"
              >
                {/* Glowing number circle */}
                <div className="relative z-10 mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-accent)]/30 ring-4 ring-white">
                  {/* pulsing aura */}
                  <span className="absolute inset-0 animate-glow-pulse rounded-full bg-[var(--color-accent)]/40 blur-md" />
                  <span className="relative text-2xl font-bold">{step.num}</span>
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-gold)]/10 ring-1 ring-[var(--color-gold)]/20 transition-transform group-hover:scale-110">
                  <step.icon className="h-7 w-7 text-[var(--color-accent)]" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mx-auto max-w-xs text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section (animated gradient band) ─────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-primary)] via-[oklch(0.30_0.06_258)] to-[var(--color-accent)] animate-gradient">
        {/* Floating glow orbs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--color-gold)]/10 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[oklch(0.65_0.14_248)]/15 blur-3xl animate-glow-pulse [animation-delay:2s]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { end: 2500, suffix: '+', label: t.landing.clientsHelped },
              { end: 15000, suffix: '+', label: t.landing.disputesResolved },
              { end: 85, suffix: '+', label: t.landing.avgImprovement },
              { end: 500, suffix: '+', label: t.landing.coursesCompleted },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <p className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-bold text-transparent drop-shadow-sm sm:text-5xl">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-[var(--color-gold)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ────────────────────────────── */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.featuredCourses}</h2>
            </motion.div>
            <Button
              variant="outline"
              className="border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
              onClick={() => navigate('courses')}
            >
              {t.landing.viewAll}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-full h-36 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4`}>
                      <course.icon className="w-12 h-12 text-white/80" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>3h 30m</span>
                      </div>
                      <Button size="sm" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-xs">
                        {language === 'es' ? 'Inscribirse' : 'Enroll Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.testimonials}</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <Card className={`glow-ring tilt-card h-full border-0 shadow-md transition-shadow hover:shadow-2xl ${i === currentTestimonial ? 'ring-2 ring-[var(--color-gold)]' : ''}`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                      ))}
                    </div>
                    <p className="mb-4 italic leading-relaxed text-gray-700">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-accent)] text-sm font-bold text-white shadow-md">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentTestimonial ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Lead Form Section (split layout) ──── */}
      <section id="contact" className="relative overflow-hidden bg-[var(--color-primary)] py-20">
        {/* decorative gold glow */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-[var(--color-gold)]/5 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Left — info & trust */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <span className="inline-block rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              {t.landing.formEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              {t.landing.formTitle}
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/70">{t.landing.formSubtitle}</p>

            {/* trust badges */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: language === 'es' ? 'Sin cobros por adelantado' : 'No upfront fees' },
                { icon: Star, label: language === 'es' ? 'Ley federal' : 'Federal law' },
                { icon: PhoneCall, label: language === 'es' ? 'Todo el país' : 'Nationwide' },
                { icon: Users, label: language === 'es' ? 'Profesionales licenciados' : 'Licensed professionals' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                  <b.icon className="h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                  <span className="text-sm text-white/80">{b.label}</span>
                </div>
              ))}
            </div>

            {/* contact info */}
            <div className="mt-8 space-y-3 text-sm">
              <a href="tel:+14074328872" className="flex items-center gap-3 text-white/70 transition hover:text-[var(--color-gold)]">
                <Phone className="h-4 w-4 text-[var(--color-gold)]" />
                (407) 432-8872
              </a>
              <a href="mailto:info@reysmartsolution.com" className="flex items-center gap-3 text-white/70 transition hover:text-[var(--color-gold)]">
                <Mail className="h-4 w-4 text-[var(--color-gold)]" />
                info@reysmartsolution.com
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                <span>7800 S US Hwy 17/92, Ste 194, Fern Park, FL 32730</span>
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LandingForm />
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-[var(--color-primary)] py-12 text-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reys-logo.png" alt="REYS Smart Solutions" className="h-9 w-auto" />
              </div>
              <p className="mb-4 text-sm text-white/40">
                {language === 'es'
                  ? 'Transformando vidas a través de soluciones financieras inteligentes.'
                  : 'Transforming lives through smart financial solutions.'}
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/50 ring-1 ring-white/10 transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">{t.landing.aboutUs}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.aboutUs}</a></li>
                <li><a href="#services" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.services}</a></li>
                <li><a href="#" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.privacyPolicy}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">{t.nav.courses}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#courses" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.featuredCourses}</a></li>
                <li><a href="#contact" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.contactUs}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">{t.landing.contactUs}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                  (407) 432-8872
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                  info@reysmartsolution.com
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                  <span>7800 S US Hwy 17/92, Ste 194, Fern Park, FL 32730</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} REYS Smart Solutions. {t.landing.footerRights}</p>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.privacyPolicy}</a>
              <a href="#" className="transition-colors hover:text-[var(--color-gold)]">{t.landing.termsOfService}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
