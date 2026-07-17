'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  TrendingUp,
  Award,
  MessageCircle,
  ChevronDown,
  Plus,
  Minus,
  Youtube,
  Play,
  Sparkles,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
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
import { PricingSection } from '@/components/landing/PricingSection';
import { FinanceCalculator } from '@/components/landing/FinanceCalculator';
import { BridgeHowItWorks } from '@/components/landing/BridgeHowItWorks';

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

function AnimatedCounter({ end, suffix, prefix }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(end, 2000, inView);
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── FAQ accordion item ────────────────────────────────────────── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <span className="flex-shrink-0">
          {open ? (
            <Minus className="h-5 w-5 text-[var(--color-gold)]" />
          ) : (
            <Plus className="h-5 w-5 text-[var(--color-accent)]" />
          )}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
      </motion.div>
    </div>
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
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [modalService, setModalService] = useState<typeof carouselServices[0] | null>(null);
  const [modalCourse, setModalCourse] = useState<typeof courses[0] | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const testimonials = [
    {
      name: 'María R.',
      role: language === 'es' ? 'Orlando, FL' : 'Orlando, FL',
      text: language === 'es'
        ? 'Me explicaron todo con claridad y nunca prometieron lo que no podían hacer. Hoy califiqué para mi primera casa.'
        : 'They explained everything clearly and never promised what they could not deliver. Today I qualified for my first home.',
      rating: 5,
    },
    {
      name: 'Jorge C.',
      role: language === 'es' ? 'Florida' : 'Florida',
      text: language === 'es'
        ? 'Profesionales de principio a fin. Me acompañaron en cada disputa y mi puntaje subió más de 150 puntos.'
        : 'Professional from start to finish. They walked me through every dispute and my score went up over 150 points.',
      rating: 5,
    },
    {
      name: 'Luis V.',
      role: language === 'es' ? 'Miami, FL' : 'Miami, FL',
      text: language === 'es'
        ? 'La educación que recibí cambió mi forma de ver el crédito. Hoy tengo el historial más sano de mi vida.'
        : 'The education I received changed how I see credit. Today I have the healthiest credit history of my life.',
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
    { label: t.landing.services, href: '#services' },
    { label: t.landing.howItWorks, href: '#how-it-works' },
    { label: t.nav.courses, href: '#courses' },
  ];

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    // Support both '#contact' and 'contact' formats
    const selector = href.startsWith('#') ? href : `#${href}`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: try by id directly
      const byId = document.getElementById(href.replace('#', ''));
      if (byId) byId.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      gradient: 'from-[var(--color-gold)] via-[var(--color-gold)] to-[var(--color-accent)]',
      iconBg: 'bg-[var(--color-gold)]/30',
      btnClass: 'bg-white text-[var(--color-primary)] hover:bg-[var(--color-gold)]/10',
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
    {
      icon: Shield,
      title: t.landing.protection,
      desc: t.landing.protectionDesc,
      color: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
      benefits: language === 'es'
        ? ['Disputas con burós de crédito (Equifax, Experian, TransUnion)', 'Validación de deuda conforme a FDCPA', 'Quejas ante CFPB, FTC y reguladores estatales', 'Eliminación de items negativos inexactos o no verificables']
        : ['Disputes with credit bureaus (Equifax, Experian, TransUnion)', 'Debt validation under FDCPA', 'Complaints to CFPB, FTC, and state regulators', 'Removal of inaccurate or unverifiable negative items'],
    },
    {
      icon: TrendingUp,
      title: t.landing.building,
      desc: t.landing.buildingDesc,
      color: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
      benefits: language === 'es'
        ? ['Tarjetas aseguradas (secured cards) para construir historial', 'Préstamos constructores (credit builder loans)', 'Optimización de la mezcla de crédito', 'Estrategia para aumentar el puntaje paso a paso']
        : ['Secured credit cards to build history', 'Credit builder loans', 'Credit mix optimization', 'Step-by-step strategy to raise your score'],
    },
    {
      icon: GraduationCap,
      title: t.landing.education2,
      desc: t.landing.education2Desc,
      color: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
      benefits: language === 'es'
        ? ['Mentoría personalizada 1-a-1', 'Talleres sobre cómo mantener un crédito sano', 'Recursos educativos en español e inglés', 'Acompañamiento continuo durante todo el proceso']
        : ['Personalized 1-on-1 mentoring', 'Workshops on maintaining healthy credit', 'Educational resources in Spanish and English', 'Ongoing support throughout the entire process'],
    },
  ];

  const steps = [
    { icon: Phone, title: t.landing.step1, desc: t.landing.step1Desc, num: '01' },
    { icon: FileSearch, title: t.landing.step2, desc: t.landing.step2Desc, num: '02' },
    { icon: Rocket, title: t.landing.step3, desc: t.landing.step3Desc, num: '03' },
    { icon: Award, title: t.landing.step4, desc: t.landing.step4Desc, num: '04' },
  ];

  const courses = [
    {
      title: language === 'es' ? 'Fundamentos del Crédito 101' : 'Credit Fundamentals 101',
      desc: language === 'es'
        ? 'Aprende los fundamentos del crédito, desde cómo funciona hasta cómo construir un historial sólido.'
        : 'Learn the fundamentals of credit, from how it works to building a solid history.',
      longDesc: language === 'es'
        ? 'Curso completo para entender el sistema crediticio estadounidense. Aprenderás cómo se calcula tu puntaje, qué factores lo afectan, y cómo construir un historial sólido desde cero. Ideal para personas que están empezando o quieren entender mejor su crédito.'
        : 'Complete course to understand the U.S. credit system. You will learn how your score is calculated, what factors affect it, and how to build a solid history from scratch. Ideal for people who are starting out or want to better understand their credit.',
      gradient: 'from-[var(--color-accent)] to-[var(--color-primary)]',
      icon: BookOpen,
      duration: language === 'es' ? '4 horas' : '4 hours',
      lessons: 12,
      level: language === 'es' ? 'Principiante' : 'Beginner',
      price: 49,
      modules: language === 'es'
        ? ['¿Cómo funciona el puntaje de crédito?', 'Los 5 factores que importan', 'Cómo leer tu reporte de crédito', 'Construye historial desde cero', 'Errores comunes que debes evitar', 'Herramientas para monitorear tu crédito']
        : ['How the credit score works', 'The 5 factors that matter', 'How to read your credit report', 'Build history from scratch', 'Common mistakes to avoid', 'Tools to monitor your credit'],
    },
    {
      title: language === 'es' ? 'Estrategias de Consolidación de Deudas' : 'Debt Consolidation Strategies',
      desc: language === 'es'
        ? 'Descubre las mejores estrategias para consolidar deudas y reducir pagos mensuales.'
        : 'Discover the best strategies to consolidate debt and reduce monthly payments.',
      longDesc: language === 'es'
        ? 'Aprende estrategias comprobadas para salir de deudas más rápido. Cubrimos consolidación, refinanciamiento, negociación con acreedores, y cómo crear un plan realista de pago que funcione para tu presupuesto.'
        : 'Learn proven strategies to get out of debt faster. We cover consolidation, refinancing, creditor negotiation, and how to create a realistic payment plan that works for your budget.',
      gradient: 'from-[var(--color-gold)] to-[var(--color-accent)]',
      icon: DollarSign,
      duration: language === 'es' ? '3.5 horas' : '3.5 hours',
      lessons: 10,
      level: language === 'es' ? 'Intermedio' : 'Intermediate',
      price: 79,
      modules: language === 'es'
        ? ['Tipos de deuda y cómo priorizar', 'Consolidación: pros y contras', 'Refinanciamiento de tarjetas', 'Cómo negociar con acreedores', 'Crea tu plan de pago personalizado', 'Mantén la disciplina financiera']
        : ['Types of debt and how to prioritize', 'Consolidation: pros and cons', 'Card refinancing', 'How to negotiate with creditors', 'Create your personalized payment plan', 'Maintain financial discipline'],
    },
    {
      title: language === 'es' ? 'Guía para Compradores Primerizos' : 'First-Time Homebuyer Guide',
      desc: language === 'es'
        ? 'Todo lo que necesitas saber para comprar tu primera casa con el mejor crédito posible.'
        : 'Everything you need to know to buy your first home with the best credit possible.',
      longDesc: language === 'es'
        ? 'Guía completa para comprar tu primera casa en EE.UU. Desde preparar tu crédito para la hipoteca, hasta entender los costos de cierre y elegir el préstamo correcto. Incluye checklist descargable.'
        : 'Complete guide to buying your first home in the U.S. From preparing your credit for the mortgage, to understanding closing costs and choosing the right loan. Includes downloadable checklist.',
      gradient: 'from-[var(--color-primary)] to-[var(--color-accent)]',
      icon: GraduationCap,
      duration: language === 'es' ? '5 horas' : '5 hours',
      lessons: 15,
      level: language === 'es' ? 'Avanzado' : 'Advanced',
      price: 99,
      modules: language === 'es'
        ? ['Prepara tu crédito para la hipoteca', 'Tipos de préstamos (FHA, Convencional, VA)', 'Cuánta casa puedes pagar', 'El proceso de pre-aprobación', 'Costos de cierre explicados', 'Del contrato al cierre: paso a paso']
        : ['Prepare your credit for the mortgage', 'Loan types (FHA, Conventional, VA)', 'How much house can you afford', 'The pre-approval process', 'Closing costs explained', 'From contract to closing: step by step'],
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
              <img
                src="/reys-logo.png"
                alt="REYS Smart Solutions"
                className={`h-9 w-auto transition-all ${scrolled ? 'drop-shadow-sm' : 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]'}`}
              />
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
              <button
                onClick={() => navigate('dashboard')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={language === 'es' ? 'Panel de Administración' : 'Admin Dashboard'}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">{language === 'es' ? 'Admin' : 'Admin'}</span>
              </button>
              <Button
                onClick={() => scrollTo('contact')}
                className={`shimmer-gold hidden bg-[var(--color-gold)] font-semibold text-[var(--gold-foreground)] shadow-md shadow-[var(--color-gold)]/30 transition hover:brightness-110 sm:inline-flex ${scrolled ? '' : 'ring-2 ring-white/20'}`}
              >
                {language === 'es' ? 'Contáctanos' : 'Contact Us'}
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
                {language === 'es' ? 'Contáctanos' : 'Contact Us'}
              </Button>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[var(--color-primary)]">
        {/* Background: luxury city video (autoplay, muted, loop) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          poster="/hero-bg.webp"
        >
          <source src="/hero-bg-video.mp4" type="video/mp4" />
        </video>

        {/* Navy overlay — darker on left (text side) for contrast, lighter right (video shows) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, oklch(0.06 0.025 264 / 0.85) 0%, oklch(0.07 0.03 264 / 0.65) 45%, oklch(0.08 0.03 264 / 0.40) 100%)',
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
        {/* Bright blue glow — top right (universe light source) */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.60_0.15_240)]/35 blur-[120px]" />
        {/* Light blue glow — bottom left */}
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.65_0.12_230)]/25 blur-[120px]" />
        {/* Center light accent */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.70_0.10_240)]/15 blur-[100px]" />

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
                <img src="/reys-logo.png" alt="REYS Smart Solutions" className="h-16 w-auto brightness-0 invert drop-shadow-[0_4px_24px_rgba(201,162,39,0.35)]" />
              </motion.div>

              <h1
                className="text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)' }}
              >
                {language === 'es' ? (
                  <>
                    Tu crédito es la llave
                    <br />
                    a tu{' '}
                    <span
                      className="text-[var(--color-accent)]"
                      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(27,127,75,0.5)' }}
                    >
                      futuro financiero
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Your credit is the key
                    <br />
                    to your{' '}
                    <span
                      className="text-[var(--color-accent)]"
                      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(27,127,75,0.5)' }}
                    >
                      financial future
                    </span>
                    .
                  </>
                )}
              </h1>

              {/* Subtitle — clear, benefit-oriented */}
              <p
                className="mt-5 max-w-xl text-xl leading-relaxed text-white"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
              >
                {t.landing.heroSubtitle}
              </p>

              {/* Trust badges — large, prominent (conversion-critical) */}
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                  {language === 'es' ? 'Evaluación 100% gratuita' : '100% Free Evaluation'}
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                  {language === 'es' ? 'No cobramos por adelantado' : 'No upfront fees'}
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                  {language === 'es' ? 'Métodos comprobados' : 'Proven methods'}
                </span>
              </div>

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
                  <div key={i} className="flex items-center gap-1.5 text-base font-medium text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                    <b.icon className="h-5 w-5 text-[var(--color-gold)]" />
                    {b.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — luminous orb composition (golden/blue light atmosphere) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative hidden items-center justify-center lg:flex"
            >
              <div className="relative h-[440px] w-[440px]">
                {/* Central glowing orb — golden light core */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, oklch(0.85 0.15 80) 0%, oklch(0.65 0.18 65) 30%, oklch(0.40 0.12 250 / 0.6) 70%, transparent 100%)',
                    filter: 'blur(20px)',
                  }}
                />

                {/* Inner bright core */}
                <motion.div
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-2xl"
                />

                {/* Orbiting rings */}
                <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-gold)]/15 [animation:spin_30s_linear_infinite]" />
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.60_0.14_245)]/20 [animation:spin_22s_linear_infinite_reverse]" />
                <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 [animation:spin_16s_linear_infinite]" />

                {/* Floating light particles */}
                {[
                  { top: '15%', left: '20%', delay: 0, color: 'bg-[var(--color-gold)]' },
                  { top: '25%', left: '75%', delay: 0.5, color: 'bg-white' },
                  { top: '65%', left: '15%', delay: 1, color: 'bg-[oklch(0.70_0.12_240)]' },
                  { top: '75%', left: '80%', delay: 1.5, color: 'bg-[var(--color-gold)]' },
                  { top: '40%', left: '90%', delay: 0.8, color: 'bg-white' },
                  { top: '85%', left: '45%', delay: 2, color: 'bg-[var(--color-gold)]' },
                  { top: '10%', left: '50%', delay: 1.2, color: 'bg-white' },
                  { top: '50%', left: '5%', delay: 0.3, color: 'bg-[oklch(0.70_0.12_240)]' },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                    className={`absolute h-2 w-2 rounded-full ${p.color} blur-[1px]`}
                    style={{ top: p.top, left: p.left }}
                  />
                ))}

              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-primary)] to-transparent" />
      </section>

      {/* ── About / Who We Are (with video) ────────────── */}
      <section id="about" className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white py-20">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[var(--color-accent)]/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-[var(--color-gold)]/8 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              <Sparkles className="h-3.5 w-3.5" />
              {t.landing.aboutEyebrow}
            </span>
            <h2 className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl">
              {t.landing.aboutTitle}
            </h2>
          </motion.div>

          {/* Featured video — large and prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto mb-10 max-w-4xl"
          >
            {/* Glow behind video */}
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-[var(--color-gold)]/20 via-[var(--color-accent)]/15 to-[var(--color-primary)]/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-black/10 shadow-2xl">
              <div className="relative aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/5RMMZPs0u1o?rel=0&modestbranding=1"
                  title="REYS Smart Solutions — Quiénes Somos"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Text + CTA + channel button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              {t.landing.aboutText1}
            </p>

            {/* Scannable bullets */}
            <div className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2">
              {[
                language === 'es' ? '3 frentes simultáneos: protección, construcción y educación' : '3 simultaneous fronts: protection, building, and education',
                language === 'es' ? 'Métodos comprobados conforme a la normativa vigente' : 'Proven methods compliant with applicable regulations',
                language === 'es' ? 'Acompañamiento real en cada paso' : 'Real guidance at every step',
                language === 'es' ? 'Sin cobros por adelantado. Pagas por resultados.' : 'No upfront fees. You pay for results.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-accent)]" />
                  <span className="text-sm leading-snug text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => scrollTo('contact')}
                className="bg-[var(--color-accent)] px-7 py-5 text-base font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 transition hover:brightness-110"
              >
                {language === 'es' ? 'Solicitar Evaluación' : 'Get Evaluation'}
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <a
                href="https://youtube.com/@reyssmartsolutionadmin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex items-center gap-2 rounded-xl bg-[#FF0000] px-7 py-5 text-base font-semibold text-white shadow-lg shadow-red-600/25 transition hover:brightness-110 active:scale-[0.98]"
              >
                <Youtube className="h-5 w-5" />
                <Play className="h-4 w-4 fill-white" />
              </a>
            </div>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              { icon: Users, value: '6+', label: language === 'es' ? 'Expertos' : 'Experts' },
              { icon: Shield, value: '100%', label: language === 'es' ? 'Legal' : 'Legal' },
              { icon: Award, value: '6+', label: language === 'es' ? 'Años' : 'Years' },
              { icon: Sparkles, value: '3', label: language === 'es' ? 'Frentes' : 'Fronts' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-gold)]/15">
                  <s.icon className="h-5 w-5 text-[var(--color-gold)]" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
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
                              onClick={() => setModalService(service)}
                              className={`${service.btnClass} px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold shadow-lg`}
                            >
                              {language === 'es' ? 'Ver Detalles' : 'View Details'}
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                            <Button
                              onClick={() => scrollTo('contact')}
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const isOpen = expandedService === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card
                    onClick={() => setExpandedService(isOpen ? null : i)}
                    className={`glow-ring group h-full cursor-pointer border-0 shadow-md transition-all duration-300 hover:shadow-2xl ${isOpen ? 'ring-2 ring-[var(--color-gold)]/50' : 'tilt-card'}`}
                  >
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${service.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <service.icon className="h-6 w-6" />
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-[var(--color-accent)]">
                          {service.title}
                        </h3>
                        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                          {isOpen ? (
                            <Minus className="h-5 w-5 text-[var(--color-gold)]" />
                          ) : (
                            <Plus className="h-5 w-5 text-[var(--color-accent)]" />
                          )}
                        </motion.div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{service.desc}</p>

                      {/* Expandable benefits */}
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                          {service.benefits.map((benefit, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-gold)]" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works (Interactive Bridge) ──────────── */}
      <BridgeHowItWorks />

      {/* ── Pricing Section ────────────────────────────── */}
      <PricingSection />

      {/* ── Finance Calculator ─────────────────────────── */}
      <FinanceCalculator />

      {/* ── Stats Section (animated gradient band) ─────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-primary)] via-[oklch(0.18_0.05_258)] to-[var(--color-accent)] animate-gradient">
        {/* Floating glow orbs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--color-gold)]/10 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[oklch(0.65_0.14_248)]/15 blur-3xl animate-glow-pulse [animation-delay:2s]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { end: 3, suffix: '', label: t.landing.statFronts, prefix: '' },
              { end: 100, suffix: '%', label: t.landing.statCompliance, prefix: '' },
              { end: 6, suffix: '+', label: t.landing.statYears, prefix: '' },
              { end: 0, suffix: '', label: t.landing.statUpfront, prefix: '$' },
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
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} prefix={stat.prefix} />
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
                onClick={() => setModalCourse(course)}
              >
                <Card className="glow-ring tilt-card h-full cursor-pointer border-0 shadow-md hover:shadow-2xl">
                  <CardContent className="p-6">
                    <div className={`w-full h-36 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4`}>
                      <course.icon className="w-12 h-12 text-white/80" />
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-[var(--color-gold)]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-gold)]">{course.level}</span>
                      <span className="text-xs text-gray-400">${course.price}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <Button size="sm" className="bg-[var(--color-accent)] text-xs hover:bg-[var(--color-accent)]/90">
                        {language === 'es' ? 'Ver detalles' : 'View details'}
                        <ChevronRight className="ml-1 h-3 w-3" />
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

          {/* Google Reviews CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 text-center shadow-lg"
          >
            {/* Google logo + rating */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-2xl font-bold text-gray-900">Google Reviews</span>
            </div>

            {/* Stars */}
            <div className="mb-3 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-7 w-7 fill-[#FBBC05] text-[#FBBC05]" />
              ))}
            </div>
            <p className="mb-6 text-lg text-gray-600">
              {language === 'es'
                ? '¿Tu experiencia con nosotros fue excelente? Compártela en Google y ayuda a más familias.'
                : 'Did you have a great experience with us? Share it on Google and help more families.'}
            </p>
            <a
              href="https://share.google/G5bT7mEvb1LxUIUr6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4285F4] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Star className="h-5 w-5 fill-white" />
              {language === 'es' ? 'Escribir Reseña en Google' : 'Write a Google Review'}
              <ArrowRight className="h-5 w-5" />
            </a>
          </motion.div>
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
              <a href="tel:+14077163478" className="flex items-center gap-3 text-white/70 transition hover:text-[var(--color-gold)]">
                <Phone className="h-4 w-4 text-[var(--color-gold)]" />
                (407) 716-3478
              </a>
              <a href="mailto:admin@reyssmartsolution.com" className="flex items-center gap-3 text-white/70 transition hover:text-[var(--color-gold)]">
                <Mail className="h-4 w-4 text-[var(--color-gold)]" />
                admin@reyssmartsolution.com
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

      {/* ── Team Section ────────────────────────────────── */}
      <section id="team" className="relative overflow-hidden bg-gray-50 py-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[var(--color-accent)]/6 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-[var(--color-gold)]/6 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              <Users className="h-3.5 w-3.5" />
              {language === 'es' ? 'NUESTRO EQUIPO' : 'OUR TEAM'}
            </span>
            <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">{t.landing.teamTitle}</h2>
            <p className="mt-4 text-lg text-gray-600">{t.landing.teamSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[
              { name: t.landing.team1Name, role: t.landing.team1Role, photo: '/team/reys-michel.jpg', featured: true, badge: language === 'es' ? 'Presidente' : 'President' },
              { name: t.landing.team2Name, role: t.landing.team2Role, photo: '/team/yolanda-peron.jpg', featured: true, badge: language === 'es' ? 'Vicepresidenta' : 'Vice President' },
              { name: t.landing.team3Name, role: t.landing.team3Role, photo: null },
              { name: t.landing.team4Name, role: t.landing.team4Role, photo: '/team/vladimir-caceres.jpg', featured: false, badge: null },
              { name: t.landing.team5Name, role: t.landing.team5Role, photo: null },
              { name: t.landing.team6Name, role: t.landing.team6Role, photo: null },
              { name: t.landing.team7Name, role: t.landing.team7Role, photo: null },
              { name: t.landing.team8Name, role: t.landing.team8Role, photo: null },
              { name: t.landing.team9Name, role: t.landing.team9Role, photo: null },
              { name: t.landing.team10Name, role: t.landing.team10Role, photo: null },
              { name: t.landing.team11Name, role: t.landing.team11Role, photo: null },
              { name: t.landing.team12Name, role: t.landing.team12Role, photo: null },
              { name: t.landing.team13Name, role: t.landing.team13Role, photo: null },
            ].map((member, i) => {
              const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: (i % 4) * 0.08 }}
                >
                  <Card className={`glow-ring tilt-card group overflow-hidden border-0 shadow-md hover:shadow-2xl ${member.featured ? 'ring-2 ring-[var(--color-gold)]/40' : ''}`}>
                    {/* Photo or Avatar */}
                    <div className="relative aspect-square overflow-hidden">
                      {member.photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        /* Avatar with initials */
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary)] via-[oklch(0.25_0.04_258)] to-[var(--color-accent)]">
                          <span className="text-5xl font-bold text-white/90 drop-shadow-lg">{initials}</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      {/* Name + role */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        {member.badge && (
                          <span className="mb-1.5 inline-block rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
                            {member.badge}
                          </span>
                        )}
                        <h3 className="text-base font-bold leading-tight drop-shadow-md">{member.name}</h3>
                        <p className="mt-0.5 text-xs text-[var(--color-gold)] drop-shadow-md">{member.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ Section (accordion) ─────────────────────── */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block rounded-full bg-[var(--color-gold)]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              {t.landing.faqEyebrow}
            </span>
            <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">{t.landing.faqTitle}</h2>
            <p className="mt-4 text-lg text-gray-600">{t.landing.faqSubtitle}</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: t.landing.faq1Q, a: t.landing.faq1A },
              { q: t.landing.faq2Q, a: t.landing.faq2A },
              { q: t.landing.faq3Q, a: t.landing.faq3A },
              { q: t.landing.faq4Q, a: t.landing.faq4A },
              { q: t.landing.faq5Q, a: t.landing.faq5A },
              { q: t.landing.faq6Q, a: t.landing.faq6A },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ──────────────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Shield className="h-5 w-5 text-[var(--color-gold)]" />
              {t.landing.disclaimerTitle}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">{t.landing.disclaimerText}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Service Detail Modal ───────────────────────── */}
      <Dialog open={!!modalService} onOpenChange={(open) => !open && setModalService(null)}>
        <DialogContent className="max-w-lg">
          {modalService && (
            <>
              <DialogHeader>
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${modalService.iconBg}`}>
                  <modalService.icon className="h-7 w-7 text-white" />
                </div>
                <DialogTitle className="text-2xl">{modalService.title}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {modalService.desc}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <h4 className="font-semibold text-gray-900">
                  {language === 'es' ? '¿Qué incluye?' : 'What\'s included?'}
                </h4>
                <ul className="space-y-2">
                  {(modalService.benefits || [
                    language === 'es' ? 'Estrategia personalizada según tu caso' : 'Personalized strategy for your case',
                    language === 'es' ? 'Acompañamiento de expertos certificados' : 'Guidance from certified experts',
                    language === 'es' ? 'Base legal en cada paso (FCRA/FDCPA)' : 'Legal foundation at every step (FCRA/FDCPA)',
                    language === 'es' ? 'Resultados medibles y reportes de progreso' : 'Measurable results and progress reports',
                  ]).map((benefit: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex gap-3">
                <Button
                  onClick={() => { setModalService(null); scrollTo('contact'); }}
                  className="flex-1 bg-[var(--color-gold)] text-[var(--color-primary)] hover:brightness-110"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {language === 'es' ? 'Contratar Servicio' : 'Hire Service'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setModalService(null); scrollTo('contact'); }}
                >
                  {language === 'es' ? 'Evaluación Gratis' : 'Free Evaluation'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Course Detail Modal ────────────────────────── */}
      <Dialog open={!!modalCourse} onOpenChange={(open) => !open && setModalCourse(null)}>
        <DialogContent className="max-w-2xl">
          {modalCourse && (
            <>
              <DialogHeader>
                <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${modalCourse.gradient}`}>
                  <modalCourse.icon className="h-10 w-10 text-white" />
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--color-gold)]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-gold)]">{modalCourse.level}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="h-3 w-3" /> {modalCourse.duration}</span>
                  <span className="text-xs text-gray-500">{modalCourse.lessons} {language === 'es' ? 'lecciones' : 'lessons'}</span>
                </div>
                <DialogTitle className="text-2xl">{modalCourse.title}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {modalCourse.longDesc}
                </DialogDescription>
              </DialogHeader>

              {/* Modules */}
              <div className="mt-2">
                <h4 className="mb-3 font-semibold text-gray-900">
                  {language === 'es' ? 'Lo que aprenderás' : 'What you will learn'}
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {modalCourse.modules.map((mod: string, j: number) => (
                    <div key={j} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">{j + 1}</span>
                      <span className="text-sm text-gray-700">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + Payment */}
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{language === 'es' ? 'Precio del curso' : 'Course price'}</p>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">${modalCourse.price}<span className="text-sm font-normal text-gray-400"> USD</span></p>
                  <p className="text-xs text-[var(--color-accent)]">{language === 'es' ? '✓ Acceso de por vida' : '✓ Lifetime access'} · {language === 'es' ? '✓ Certificado incluido' : '✓ Certificate included'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => { setModalCourse(null); scrollTo('contact'); }}
                    className="bg-[var(--color-gold)] text-[var(--color-primary)] hover:brightness-110"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {language === 'es' ? 'Comprar Ahora' : 'Buy Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setModalCourse(null); scrollTo('contact'); }}
                  >
                    {language === 'es' ? 'Más información' : 'More info'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Floating WhatsApp button ───────────────────── */}
      <a
        href="https://wa.me/14077163478"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 transition-transform hover:scale-110 active:scale-95"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      </a>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-[var(--color-primary)] py-12 text-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reys-logo.png" alt="REYS Smart Solutions" className="h-9 w-auto brightness-0 invert" />
              </div>
              <p className="mb-4 text-sm text-white/40">
                {language === 'es'
                  ? 'Transformando vidas a través de soluciones financieras inteligentes.'
                  : 'Transforming lives through smart financial solutions.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://www.facebook.com/61591155728320/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-[#1877F2] hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/reyssmartsolutions/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-gradient-to-br hover:from-[#E4405F] hover:to-[#F77737] hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com/@reyssmartsolutionadmin" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-[#FF0000] hover:text-white">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://share.google/G5bT7mEvb1LxUIUr6" target="_blank" rel="noopener noreferrer" aria-label="Google Reviews" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70 ring-1 ring-white/10 transition-colors hover:bg-[#4285F4] hover:text-white">
                  <Star className="h-5 w-5" />
                </a>
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
                  (407) 716-3478
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-gold)]" />
                  admin@reyssmartsolution.com
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
